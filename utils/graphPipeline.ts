/**
 * Client-side knowledge graph builder.
 * Ports the Python graph_pipeline.py logic to TypeScript so the graph
 * can be built entirely in the browser without a separate FastAPI server.
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  properties: Record<string, any>;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  node_types: Record<string, number>;
  edge_types: Record<string, number>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in',
  'to', 'and', 'or', 'for', 'with', 'that', 'this', 'it',
  'by', 'on', 'at', 'from', 'as', 'be', 'been', 'has', 'have',
  'their', 'they', 'its', 'which', 'when', 'where', 'how',
  'can', 'will', 'would', 'should', 'could', 'not', 'no',
]);

function normalizeId(prefix: string, text: string): string {
  const clean = text.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
  const slug = clean.trim().replace(/\s+/g, '_').slice(0, 40);
  return `${prefix}_${slug}`;
}

function keywordsOf(text: string): Set<string> {
  const words = new Set(text.toLowerCase().split(/\s+/).filter(Boolean));
  STOP_WORDS.forEach((sw) => words.delete(sw));
  return words;
}

function claimsSimilar(textA: string, textB: string): boolean {
  const wordsA = keywordsOf(textA);
  const wordsB = keywordsOf(textB);
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  let intersection = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) intersection++; });
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union >= 0.25;
}

function makeNode(
  id: string,
  type: string,
  label: string,
  properties: Record<string, any> = {},
): GraphNode {
  return { id, type, label, properties };
}

function makeEdge(
  source: string,
  target: string,
  relation: string,
  properties: Record<string, any> = {},
): GraphEdge {
  return { source, target, relation, properties };
}

// ────────────────────────────────────────────────────────────────
// NLP Extractor
// ────────────────────────────────────────────────────────────────

function extractNlpNodesEdges(
  nlpInput: Record<string, any>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenIds = new Set<string>();

  const papers: any[] =
    nlpInput?.aggregated_extraction?.papers ?? [];

  for (const paper of papers) {
    const paperId: string = paper.paper_id ?? '';
    const title: string = paper.title ?? 'untitled';
    const abstract: string = paper.abstract ?? '';

    if (!paperId) continue;

    if (!seenIds.has(paperId)) {
      nodes.push(
        makeNode(paperId, 'paper', title, {
          abstract_snippet: abstract.slice(0, 200),
          citations_count: (paper.citations ?? []).length,
        }),
      );
      seenIds.add(paperId);
    }

    // Dataset nodes
    for (const dsName of paper.datasets ?? []) {
      if (!dsName) continue;
      const dsId = normalizeId('dataset', dsName);
      if (!seenIds.has(dsId)) {
        nodes.push(makeNode(dsId, 'dataset', dsName));
        seenIds.add(dsId);
      }
      edges.push(makeEdge(paperId, dsId, 'uses_dataset'));
    }

    // Method nodes
    for (const methodName of paper.methods ?? []) {
      if (!methodName) continue;
      const mId = normalizeId('method', methodName);
      if (!seenIds.has(mId)) {
        nodes.push(makeNode(mId, 'method', methodName));
        seenIds.add(mId);
      }
      edges.push(makeEdge(paperId, mId, 'uses_method'));
    }
  }

  return { nodes, edges };
}

// ────────────────────────────────────────────────────────────────
// Council Extractor
// ────────────────────────────────────────────────────────────────

function extractCouncilNodesEdges(
  councilInput: Record<string, any>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenIds = new Set<string>();
  const seenEdges = new Set<string>();

  // ── Global claim summary ──────────────────────────────────
  const globalClaims: any[] = councilInput.global_claim_summary ?? [];
  for (const item of globalClaims) {
    const paperId: string = item.paper_id ?? '';
    if (!paperId) continue;
    if (!seenIds.has(paperId)) {
      nodes.push(
        makeNode(paperId, 'paper', paperId, {
          claim_text: item.claim_text ?? '',
          confidence_score: item.confidence_score ?? null,
        }),
      );
      seenIds.add(paperId);
    }
  }

  // agrees_with edges between similar confident claims
  for (let i = 0; i < globalClaims.length; i++) {
    for (let j = i + 1; j < globalClaims.length; j++) {
      const entryI = globalClaims[i];
      const entryJ = globalClaims[j];
      const pidI: string = entryI.paper_id ?? '';
      const pidJ: string = entryJ.paper_id ?? '';
      if (!pidI || !pidJ || pidI === pidJ) continue;
      if (!seenIds.has(pidI) || !seenIds.has(pidJ)) continue;
      const confI = entryI.confidence_score ?? 0;
      const confJ = entryJ.confidence_score ?? 0;
      if (confI < 0.7 || confJ < 0.7) continue;
      const textA: string = entryI.claim_text ?? '';
      const textB: string = entryJ.claim_text ?? '';
      if (claimsSimilar(textA, textB)) {
        const wordsA = keywordsOf(textA);
        const wordsB = keywordsOf(textB);
        let intersection = 0;
        wordsA.forEach((w) => { if (wordsB.has(w)) intersection++; });
        const union = new Set([...wordsA, ...wordsB]).size;
        const sim = union ? Math.round((intersection / union) * 100) / 100 : 0;
        const edgeKey = `${pidI}|${pidJ}|agrees_with`;
        if (!seenEdges.has(edgeKey)) {
          edges.push(
            makeEdge(pidI, pidJ, 'agrees_with', {
              confidence_i: confI,
              confidence_j: confJ,
              similarity: sim,
            }),
          );
          seenEdges.add(edgeKey);
        }
      }
    }
  }

  // ── Method comparison analysis ────────────────────────────
  for (const item of councilInput.method_comparison_analysis ?? []) {
    const paperId: string = item.paper_id ?? '';
    const modelClass: string = item.model_class ?? '';
    if (!modelClass) continue;
    const mId = normalizeId('method', modelClass);
    if (!seenIds.has(mId)) {
      nodes.push(
        makeNode(mId, 'method', modelClass, {
          evaluation_metrics: item.evaluation_metrics ?? {},
        }),
      );
      seenIds.add(mId);
    }
    if (paperId) {
      edges.push(makeEdge(paperId, mId, 'uses_method'));
    }
  }

  // ── Contradiction report ──────────────────────────────────
  for (let idx = 0; idx < (councilInput.contradiction_report ?? []).length; idx++) {
    const item = councilInput.contradiction_report[idx];
    const cId = `contradiction_${String(idx).padStart(3, '0')}`;
    const description: string = item.description ?? '';
    const severity: string = item.severity ?? '';
    const confidence = item.confidence ?? null;
    if (!seenIds.has(cId)) {
      nodes.push(
        makeNode(cId, 'contradiction', description.slice(0, 60), {
          description,
          severity,
          confidence,
        }),
      );
      seenIds.add(cId);
    }
    const paperIds: string[] = item.paper_ids ?? [];
    for (const pid of paperIds) {
      if (pid) {
        edges.push(makeEdge(pid, cId, 'has_contradiction', { severity }));
      }
    }
    if (paperIds.length >= 2) {
      edges.push(makeEdge(paperIds[0], paperIds[1], 'compares_with'));
    }
  }

  // ── Ranked research gaps ──────────────────────────────────
  for (let idx = 0; idx < (councilInput.ranked_research_gaps ?? []).length; idx++) {
    const item = councilInput.ranked_research_gaps[idx];
    const gId = `gap_${String(idx).padStart(3, '0')}`;
    const description: string = item.description ?? '';
    const gapType: string = item.gap_type ?? '';
    const priority = item.priority_score ?? item.priority ?? '';
    const experiments: string[] = item.suggested_experiments ?? [];
    if (!seenIds.has(gId)) {
      nodes.push(
        makeNode(gId, 'gap', description.slice(0, 60), {
          description,
          gap_type: gapType,
          priority_score: priority,
          suggested_experiments: experiments.join('; '),
        }),
      );
      seenIds.add(gId);
    }
    for (const pid of item.related_paper_ids ?? []) {
      if (pid) edges.push(makeEdge(pid, gId, 'has_gap'));
    }
  }

  // ── Actionable experiment suggestions ─────────────────────
  const gapNodes = nodes.filter((n) => n.type === 'gap');
  for (let idx = 0; idx < (councilInput.actionable_experiment_suggestions ?? []).length; idx++) {
    const item = councilInput.actionable_experiment_suggestions[idx];
    const eId = `exp_${String(idx).padStart(3, '0')}`;
    const title: string = (item.title ?? item.description ?? 'experiment');
    const hypothesis: string = item.hypothesis ?? '';
    const outcome: string = item.expected_outcome ?? '';
    const priority = item.priority_score ?? '';
    if (!seenIds.has(eId)) {
      nodes.push(
        makeNode(eId, 'experiment', title.slice(0, 60), {
          title,
          hypothesis,
          expected_outcome: outcome,
          priority_score: priority,
        }),
      );
      seenIds.add(eId);
    }

    for (const dsName of item.datasets ?? []) {
      if (!dsName) continue;
      const dsId = normalizeId('dataset', dsName);
      if (!seenIds.has(dsId)) {
        nodes.push(makeNode(dsId, 'dataset', dsName));
        seenIds.add(dsId);
      }
      edges.push(makeEdge(eId, dsId, 'requires_dataset'));
    }

    for (const methodName of item.methods ?? []) {
      if (!methodName) continue;
      const mId = normalizeId('method', methodName);
      if (!seenIds.has(mId)) {
        nodes.push(makeNode(mId, 'method', methodName));
        seenIds.add(mId);
      }
      edges.push(makeEdge(eId, mId, 'uses_method'));
    }

    // Link experiment to matching gaps
    const titleWords = keywordsOf(title);
    for (const gapNode of gapNodes) {
      const gapDescWords = keywordsOf(gapNode.properties.description ?? '');
      let hasOverlap = false;
      titleWords.forEach((w) => { if (gapDescWords.has(w)) hasOverlap = true; });
      if (hasOverlap) {
        edges.push(makeEdge(eId, gapNode.id, 'addresses_gap'));
      }
    }
  }

  // ── Evidence strength mapping — replication detection ─────
  const claimGroups: Record<number, any[]> = {};
  for (const item of councilInput.evidence_strength_mapping ?? []) {
    const claimIdx = item.claim_index;
    if (claimIdx != null) {
      if (!claimGroups[claimIdx]) claimGroups[claimIdx] = [];
      claimGroups[claimIdx].push(item);
    }
  }

  for (const [claimIdx, group] of Object.entries(claimGroups)) {
    if (group.length < 2) continue;
    const strongPapers = group.filter(
      (e) => e.statistical_strength === 'strong',
    );
    const moderatePapers = group.filter(
      (e) => e.statistical_strength === 'moderate',
    );

    if (strongPapers.length >= 2) {
      for (let si = 0; si < strongPapers.length; si++) {
        for (let sj = si + 1; sj < strongPapers.length; sj++) {
          const pidA: string = strongPapers[si].paper_id ?? '';
          const pidB: string = strongPapers[sj].paper_id ?? '';
          if (!pidA || !pidB || pidA === pidB) continue;
          if (!seenIds.has(pidA) || !seenIds.has(pidB)) continue;
          const edgeKey = `${pidA}|${pidB}|replicates`;
          if (!seenEdges.has(edgeKey)) {
            edges.push(
              makeEdge(pidA, pidB, 'replicates', {
                claim_index: Number(claimIdx),
                statistical_strength: 'strong',
              }),
            );
            seenEdges.add(edgeKey);
          }
        }
      }
    } else if (strongPapers.length === 1 && moderatePapers.length >= 1) {
      const strongPid: string = strongPapers[0].paper_id ?? '';
      if (!strongPid || !seenIds.has(strongPid)) continue;
      for (const mp of moderatePapers) {
        const modPid: string = mp.paper_id ?? '';
        if (!modPid || modPid === strongPid || !seenIds.has(modPid)) continue;
        const edgeKey = `${strongPid}|${modPid}|replicates`;
        if (!seenEdges.has(edgeKey)) {
          edges.push(
            makeEdge(strongPid, modPid, 'replicates', {
              claim_index: Number(claimIdx),
              statistical_strength: 'partial',
            }),
          );
          seenEdges.add(edgeKey);
        }
      }
    }
  }

  return { nodes, edges };
}

// ────────────────────────────────────────────────────────────────
// Graph Builder
// ────────────────────────────────────────────────────────────────

export function buildGraph(
  nlpInput: Record<string, any>,
  councilInput: Record<string, any>,
): GraphData {
  const { nodes: nlpNodes, edges: nlpEdges } = extractNlpNodesEdges(nlpInput);
  const { nodes: councilNodes, edges: councilEdges } =
    extractCouncilNodesEdges(councilInput);

  // Merge nodes — deduplicate by id, update properties on collision
  const nodeMap = new Map<string, GraphNode>();
  for (const node of [...nlpNodes, ...councilNodes]) {
    const existing = nodeMap.get(node.id);
    if (existing) {
      for (const [k, v] of Object.entries(node.properties)) {
        if (v != null && !(k in existing.properties)) {
          existing.properties[k] = v;
        }
      }
    } else {
      nodeMap.set(node.id, { ...node });
    }
  }

  // Merge edges — deduplicate by (source, target, relation)
  const edgeSet = new Set<string>();
  const mergedEdges: GraphEdge[] = [];
  for (const edge of [...nlpEdges, ...councilEdges]) {
    const key = `${edge.source}|${edge.target}|${edge.relation}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      mergedEdges.push(edge);
    }
  }

  const mergedNodes = Array.from(nodeMap.values());

  // Compute stats
  const nodeTypes: Record<string, number> = {};
  for (const n of mergedNodes) {
    nodeTypes[n.type] = (nodeTypes[n.type] ?? 0) + 1;
  }

  const edgeTypes: Record<string, number> = {};
  for (const e of mergedEdges) {
    edgeTypes[e.relation] = (edgeTypes[e.relation] ?? 0) + 1;
  }

  return {
    nodes: mergedNodes,
    edges: mergedEdges,
    stats: {
      total_nodes: mergedNodes.length,
      total_edges: mergedEdges.length,
      node_types: nodeTypes,
      edge_types: edgeTypes,
    },
  };
}
