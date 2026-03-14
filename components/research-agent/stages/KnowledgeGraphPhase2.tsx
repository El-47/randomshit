'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CrawlApiResponse, ResearchQuery } from '@/utils/types';
import { buildGraph, GraphData, GraphNode, GraphEdge } from '@/utils/graphPipeline';

/* ── colour maps ─────────────────────────────────────────── */

const NODE_BG: Record<string, string> = {
  paper:         '#E6F1FB',
  method:        '#EEEDFE',
  dataset:       '#E1F5EE',
  gap:           '#FCEBEB',
  experiment:    '#EAF3DE',
  contradiction: '#FAEEDA',
};

const NODE_BORDER: Record<string, string> = {
  paper:         '#2196F3',
  method:        '#9C27B0',
  dataset:       '#00897B',
  gap:           '#E53935',
  experiment:    '#43A047',
  contradiction: '#FF6F00',
};

const NODE_TEXT: Record<string, string> = {
  paper:         '#042C53',
  method:        '#26215C',
  dataset:       '#04342C',
  gap:           '#501313',
  experiment:    '#173404',
  contradiction: '#412402',
};

const NODE_EMOJI: Record<string, string> = {
  paper:         '📄',
  method:        '🔧',
  dataset:       '📊',
  gap:           '🔍',
  experiment:    '🧪',
  contradiction: '⚡',
};

const EDGE_COLOR: Record<string, string> = {
  contradicts:       '#E53935',
  compares_with:     '#E53935',
  has_gap:           '#E53935',
  addresses_gap:     '#43A047',
  uses_method:       '#9C27B0',
  uses_dataset:      '#00897B',
  has_contradiction: '#FF6F00',
  requires_dataset:  '#00897B',
  agrees_with:       '#2196F3',
  replicates:        '#1565C0',
};

const EDGE_LABEL: Record<string, string> = {
  contradicts:       'contradicts',
  compares_with:     'compares with',
  has_gap:           'has gap',
  addresses_gap:     'addresses gap',
  uses_method:       'uses method',
  uses_dataset:      'uses dataset',
  has_contradiction: 'has contradiction',
  requires_dataset:  'requires dataset',
  agrees_with:       'agrees with',
  replicates:        'replicates',
};

/* ── paper-centric cluster layout ────────────────────────── */
/*
  Based on the spec: papers are central hubs. For each paper,
  its methods and datasets fan out around it. Gaps, experiments,
  and contradictions are placed in a shared zone below, linked
  to the papers they relate to.
*/

const NODE_WIDTH = 220;
const NODE_HEIGHT = 70;
const PAPER_WIDTH = 260;
const PAPER_HEIGHT = 80;

function getLayoutedElements(
  nodes: any[],
  edges: any[],
): { nodes: any[]; edges: any[] } {
  // Classify nodes
  const papers: any[] = [];
  const childMap: Record<string, any[]> = {}; // paperId → child nodes
  const sharedNodes: any[] = []; // gaps, experiments, contradictions
  const orphans: any[] = []; // nodes not connected to any paper

  const nodeById: Record<string, any> = {};
  for (const n of nodes) nodeById[n.id] = n;

  for (const n of nodes) {
    const t = n.data?.nodeType ?? 'unknown';
    if (t === 'paper') {
      papers.push(n);
    } else if (t === 'gap' || t === 'experiment' || t === 'contradiction') {
      sharedNodes.push(n);
    }
    // methods and datasets will be assigned to papers via edges
  }

  // Build adjacency: which non-paper nodes are children of which papers
  const nodeAssigned = new Set<string>();
  const paperIds = new Set(papers.map((p) => p.id));

  for (const e of edges) {
    const srcType = nodeById[e.source]?.data?.nodeType;
    const tgtType = nodeById[e.target]?.data?.nodeType;

    // paper → method/dataset edges
    if (paperIds.has(e.source) && (tgtType === 'method' || tgtType === 'dataset')) {
      if (!childMap[e.source]) childMap[e.source] = [];
      if (!nodeAssigned.has(e.target)) {
        childMap[e.source].push(nodeById[e.target]);
        nodeAssigned.add(e.target);
      }
    }
    // experiment → method/dataset edges (assign experiment's children too)
    if (paperIds.has(e.target) && (srcType === 'method' || srcType === 'dataset')) {
      if (!childMap[e.target]) childMap[e.target] = [];
      if (!nodeAssigned.has(e.source)) {
        childMap[e.target].push(nodeById[e.source]);
        nodeAssigned.add(e.source);
      }
    }
  }

  // Collect truly orphaned method/dataset nodes
  for (const n of nodes) {
    const t = n.data?.nodeType;
    if ((t === 'method' || t === 'dataset') && !nodeAssigned.has(n.id)) {
      orphans.push(n);
    }
  }

  // ── Layout papers horizontally ──────────────────────────
  const CLUSTER_GAP = 100;       // gap between paper clusters
  const CHILD_OFFSET_Y = 140;    // vertical offset for children below paper
  const CHILD_H_GAP = 30;        // horizontal gap between child nodes

  const positionedNodes: any[] = [];
  let clusterX = 0;
  const paperCenterX: Record<string, number> = {};

  for (const paper of papers) {
    const children = childMap[paper.id] ?? [];
    const childrenWidth = children.length > 0
      ? children.length * (NODE_WIDTH + CHILD_H_GAP) - CHILD_H_GAP
      : 0;
    const clusterWidth = Math.max(PAPER_WIDTH, childrenWidth);

    // Center the paper in its cluster
    const paperX = clusterX + (clusterWidth - PAPER_WIDTH) / 2;
    paperCenterX[paper.id] = clusterX + clusterWidth / 2;

    positionedNodes.push({
      ...paper,
      style: {
        ...paper.style,
        width: PAPER_WIDTH,
        fontSize: '13px',
        fontWeight: 700,
        padding: '14px 16px',
        boxShadow: `0 4px 16px ${paper.style?.border?.includes('#') ? paper.style.border.match(/#[0-9a-fA-F]+/)?.[0] ?? '#2196F3' : '#2196F3'}30`,
      },
      position: { x: paperX, y: 0 },
    });

    // Fan children below the paper
    const childStartX = clusterX + (clusterWidth - childrenWidth) / 2;
    children.forEach((child: any, idx: number) => {
      positionedNodes.push({
        ...child,
        position: {
          x: childStartX + idx * (NODE_WIDTH + CHILD_H_GAP),
          y: CHILD_OFFSET_Y,
        },
      });
    });

    clusterX += clusterWidth + CLUSTER_GAP;
  }

  // ── Shared zone: gaps, experiments, contradictions ───────
  const SHARED_Y = CHILD_OFFSET_Y + NODE_HEIGHT + 160;
  const SHARED_GAP = 30;

  // Sort: contradictions first (red), then gaps, then experiments
  const sharedOrder = ['contradiction', 'gap', 'experiment'];
  sharedNodes.sort((a, b) => {
    const ai = sharedOrder.indexOf(a.data?.nodeType ?? '');
    const bi = sharedOrder.indexOf(b.data?.nodeType ?? '');
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const totalSharedWidth = sharedNodes.length * (NODE_WIDTH + SHARED_GAP) - SHARED_GAP;
  const totalGraphWidth = clusterX - CLUSTER_GAP;
  const sharedStartX = Math.max(0, (totalGraphWidth - totalSharedWidth) / 2);

  sharedNodes.forEach((n, idx) => {
    positionedNodes.push({
      ...n,
      position: {
        x: sharedStartX + idx * (NODE_WIDTH + SHARED_GAP),
        y: SHARED_Y,
      },
    });
  });

  // ── Orphans: unlinked methods/datasets at the bottom ────
  if (orphans.length > 0) {
    const ORPHAN_Y = SHARED_Y + NODE_HEIGHT + 120;
    const orphanWidth = orphans.length * (NODE_WIDTH + CHILD_H_GAP) - CHILD_H_GAP;
    const orphanStartX = Math.max(0, (totalGraphWidth - orphanWidth) / 2);

    orphans.forEach((n, idx) => {
      positionedNodes.push({
        ...n,
        position: {
          x: orphanStartX + idx * (NODE_WIDTH + CHILD_H_GAP),
          y: ORPHAN_Y,
        },
      });
    });
  }

  return { nodes: positionedNodes, edges };
}

/* ── api → react-flow transform ──────────────────────────── */

function toReactFlow(apiNodes: GraphNode[], apiEdges: GraphEdge[]) {
  const rfNodes = apiNodes.map((n) => {
    // Border style varies by node type for visual distinction
    const borderStyle = n.type === 'gap'
      ? `2px dashed ${NODE_BORDER[n.type] ?? '#888780'}`
      : n.type === 'experiment'
        ? `3px double ${NODE_BORDER[n.type] ?? '#888780'}`
        : `2px solid ${NODE_BORDER[n.type] ?? '#888780'}`;

    return {
      id: n.id,
      type: 'default',
      position: { x: 0, y: 0 },
      data: {
        label: `${NODE_EMOJI[n.type] ?? '●'} ${n.label}`,
        nodeType: n.type,
        properties: n.properties,
        fullLabel: n.label,
      },
      style: {
        background: NODE_BG[n.type] ?? '#F1EFE8',
        border: borderStyle,
        color: NODE_TEXT[n.type] ?? '#2C2C2A',
        borderRadius: n.type === 'paper' ? '12px' : n.type === 'contradiction' ? '4px' : '8px',
        fontSize: '11px',
        fontWeight: 500,
        width: NODE_WIDTH,
        padding: '10px 12px',
        cursor: 'pointer',
        boxShadow: `0 2px 8px ${NODE_BORDER[n.type] ?? '#888'}20`,
        transition: 'box-shadow 0.2s ease',
      },
    };
  });

  const rfEdges = apiEdges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    label: EDGE_LABEL[e.relation] ?? e.relation.replace(/_/g, ' '),
    animated:
      e.relation === 'contradicts' ||
      e.relation === 'compares_with' ||
      e.relation === 'has_contradiction',
    style: {
      stroke: EDGE_COLOR[e.relation] ?? '#888780',
      strokeWidth: e.relation === 'contradicts' || e.relation === 'has_contradiction' ? 2.5 : 1.5,
    },
    labelStyle: {
      fontSize: 9,
      fill: EDGE_COLOR[e.relation] ?? '#5F5E5A',
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: '#fff',
      opacity: 0.9,
      rx: 4,
      ry: 4,
    },
    labelBgPadding: [6, 3] as [number, number],
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: EDGE_COLOR[e.relation] ?? '#888780',
    },
  }));

  return getLayoutedElements(rfNodes, rfEdges);
}

/* ── props ───────────────────────────────────────────────── */

interface KnowledgeGraphPhase2Props {
  query: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

/* ── inner ReactFlow wrapper (needs ReactFlowProvider above) */

function ReactFlowInner({
  rfNodes,
  rfEdges,
  onNodesChange,
  onEdgesChange,
  onNodeMouseEnter,
  onNodeMouseLeave,
  hoveredNode,
}: {
  rfNodes: any[];
  rfEdges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeMouseEnter: (_: any, node: any) => void;
  onNodeMouseLeave: () => void;
  hoveredNode: any;
}) {
  return (
    <>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2.5}
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls showInteractive={false} />

        {hoveredNode && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'white',
              border: `2px solid ${NODE_BORDER[hoveredNode.data.nodeType] ?? '#e5e7eb'}`,
              borderRadius: 12,
              padding: 16,
              maxWidth: 320,
              maxHeight: 400,
              overflowY: 'auto',
              fontSize: 12,
              zIndex: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: `1px solid ${NODE_BORDER[hoveredNode.data.nodeType] ?? '#eee'}30`,
              }}
            >
              <span style={{ fontSize: 18 }}>
                {NODE_EMOJI[hoveredNode.data.nodeType] ?? '●'}
              </span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
                  {hoveredNode.data.fullLabel ?? hoveredNode.data.label}
                </p>
                <p
                  style={{
                    color: NODE_BORDER[hoveredNode.data.nodeType] ?? '#888',
                    fontSize: 10,
                    textTransform: 'capitalize',
                    fontWeight: 600,
                  }}
                >
                  {hoveredNode.data.nodeType}
                </p>
              </div>
            </div>
            {Object.entries(hoveredNode.data.properties ?? {}).map(
              ([k, v]) => {
                const strVal = String(v);
                if (!strVal || strVal === 'null' || strVal === 'undefined') return null;
                return (
                  <div key={k} style={{ marginBottom: 6 }}>
                    <span
                      style={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: '#888',
                        fontSize: 10,
                      }}
                    >
                      {k.replace(/_/g, ' ')}
                    </span>
                    <p style={{ color: '#333', lineHeight: 1.4, marginTop: 2 }}>
                      {strVal.slice(0, 200)}
                      {strVal.length > 200 && '…'}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        )}
      </ReactFlow>
    </>
  );
}

/* ── main component ──────────────────────────────────────── */

export default function KnowledgeGraphPhase2({
  query,
  apiData,
  isLoading: propIsLoading = false,
}: KnowledgeGraphPhase2Props) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  /* fetch / build graph */
  useEffect(() => {
    if (!apiData || propIsLoading) {
      setLoading(false);
      setError(true);
      return;
    }

    // Read council data from localStorage
    let councilData: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('agent-council-data');
      if (raw) councilData = JSON.parse(raw);
    } catch {
      // Ignore parse errors
    }

    try {
      const graph = buildGraph(apiData, councilData);
      setGraphData(graph);
      const { nodes, edges } = toReactFlow(graph.nodes, graph.edges);
      setRfNodes(nodes);
      setRfEdges(edges);
      setLoading(false);
      setError(false);
    } catch (err) {
      console.error('Graph build error:', err);
      setLoading(false);
      setError(true);
    }
  }, [apiData, propIsLoading]);

  /* filter nodes by type */
  const filteredNodes = useMemo(() => {
    if (hiddenTypes.size === 0) return rfNodes;
    return rfNodes.filter((n) => !hiddenTypes.has(n.data.nodeType));
  }, [rfNodes, hiddenTypes]);

  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  );

  const filteredEdges = useMemo(() => {
    if (hiddenTypes.size === 0) return rfEdges;
    return rfEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
    );
  }, [rfEdges, hiddenTypes, visibleNodeIds]);

  /* hover handlers */
  const onNodeMouseEnter = useCallback((_: any, node: any) => {
    setHoveredNode(node);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  /* toggle type visibility */
  const toggleType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  /* derived stats */
  const totalNodes = graphData?.stats?.total_nodes ?? 0;
  const totalEdges = graphData?.stats?.total_edges ?? 0;
  const nodeTypes: Record<string, number> = graphData?.stats?.node_types ?? {};
  const edgeTypes: Record<string, number> = graphData?.stats?.edge_types ?? {};
  const density =
    totalNodes > 1
      ? Math.round((totalEdges / (totalNodes * (totalNodes - 1))) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={totalNodes.toString()} color="#00897B" />
        <StatCard label="Total Edges" value={totalEdges.toString()} color="#2196F3" />
        <StatCard label="Node Types" value={Object.keys(nodeTypes).length.toString()} color="#9C27B0" />
        <StatCard label="Graph Density" value={`${density}%`} color="#FF6F00" />
      </div>

      {/* Node Type Filters */}
      {Object.keys(nodeTypes).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-textTertiary mr-1 self-center">
            Filter:
          </span>
          {Object.entries(nodeTypes).map(([type, count]) => {
            const isHidden = hiddenTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: isHidden ? '#f3f4f6' : `${NODE_BORDER[type] ?? '#888'}15`,
                  color: isHidden ? '#9ca3af' : NODE_BORDER[type] ?? '#888',
                  border: `1.5px solid ${isHidden ? '#d1d5db' : `${NODE_BORDER[type] ?? '#888'}50`}`,
                  opacity: isHidden ? 0.6 : 1,
                  textDecoration: isHidden ? 'line-through' : 'none',
                }}
              >
                {NODE_EMOJI[type] ?? '●'} {type} ({count as number})
              </button>
            );
          })}
        </div>
      )}

      {/* React Flow Graph Container */}
      <div
        className="border-2 rounded-xl overflow-hidden"
        style={{
          height: '75vh',
          minHeight: '600px',
          position: 'relative',
          borderColor: '#00897B40',
          background: '#fafbfc',
        }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full text-sm text-textTertiary">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Building knowledge graph…</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-full text-sm text-textTertiary">
            <div className="flex flex-col items-center gap-2 text-center max-w-xs">
              <span className="text-3xl">🕸️</span>
              <p className="font-medium">Graph will appear after analysis completes</p>
              <p className="text-xs">Run a research query and wait for the Agent Council to finish analyzing.</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <ReactFlowProvider>
            <ReactFlowInner
              rfNodes={filteredNodes}
              rfEdges={filteredEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseLeave={onNodeMouseLeave}
              hoveredNode={hoveredNode}
            />
          </ReactFlowProvider>
        )}
      </div>

      {/* Legends — Node Types + Edge Types side by side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Node Types Legend */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">
            Node Types
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(nodeTypes).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: NODE_BG[type] ?? '#f1efe8',
                    border: `2px solid ${NODE_BORDER[type] ?? '#888780'}`,
                    borderStyle: type === 'gap' ? 'dashed' : 'solid',
                  }}
                />
                <span className="text-textSecondary capitalize flex-1">{type}</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: NODE_BORDER[type] ?? '#888780' }}
                >
                  {count as number}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edge Types Legend */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">
            Edge Types
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(edgeTypes).map(([rel, count]) => (
              <div key={rel} className="flex items-center gap-2 text-xs">
                <div
                  className="w-6 h-0 flex-shrink-0"
                  style={{
                    borderTop: `2px ${rel === 'contradicts' || rel === 'compares_with' ? 'dashed' : 'solid'} ${EDGE_COLOR[rel] ?? '#888'}`,
                  }}
                />
                <span className="text-textSecondary capitalize flex-1">
                  {EDGE_LABEL[rel] ?? rel.replace(/_/g, ' ')}
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: EDGE_COLOR[rel] ?? '#888' }}
                >
                  {count as number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── stat card ───────────────────────────────────────────── */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="p-4 bg-white rounded-xl shadow-sm"
      style={{
        borderLeft: `4px solid ${color}`,
        boxShadow: `0 2px 8px ${color}10`,
      }}
    >
      <p className="text-xs text-textTertiary mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
