import { CrawlApiResponse } from '@/utils/types';

// ─── Ingest Types ────────────────────────────────────────────────────────────

export interface RAGIngestPaper {
  paper_id: string;
  title: string;
  abstract: string;
  introduction: string;
  methodology: string;
  results: string;
  conclusion: string;
  claims: string[];
  datasets: string[];
  figures: { summary: string }[];
}

export interface RAGIngestPayload {
  session_id: string;
  nlp: {
    aggregated_extraction: {
      papers: RAGIngestPaper[];
    };
  };
  council: {
    global_claim_summary: {
      papers: unknown[];
      summary: string;
    };
    method_comparison_analysis: {
      papers: unknown[];
      summary: string;
    };
    contradiction_report: {
      contradictions: unknown[];
    };
    evidence_strength_mapping: {
      papers: unknown[];
    };
    ranked_research_gaps: unknown[];
    actionable_experiment_suggestions: unknown[];
  };
}

export interface RAGIngestResponse {
  session_id: string;
  total_chunks: number;
  status: string;
}

// ─── Query Types ─────────────────────────────────────────────────────────────

export interface RAGQueryPayload {
  session_id: string;
  query: string;
  top_k: number;
}

export interface RAGTopChunk {
  text: string;
  source_type: string;
  paper_id: string | null;
}

export interface RAGQueryResponse {
  session_id: string;
  query: string;
  intent: {
    intent: string;
    paper_id: string | null;
    filter_section: string | null;
  };
  chunks_searched: number;
  top_chunks: RAGTopChunk[];
  answer: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate a deterministic session ID from the research query so that
 * we reuse the same RAG index within a single research session.
 */
export function buildSessionId(query: string): string {
  // Simple hash — keeps it deterministic for the same question
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = ((hash << 5) - hash + query.charCodeAt(i)) | 0;
  }
  return `session-${Math.abs(hash).toString(36)}`;
}

/**
 * Build the ingest payload from the crawl API response and (optional)
 * agent council data.
 */
export function buildIngestPayload(
  sessionId: string,
  crawlData: CrawlApiResponse,
  councilData?: Record<string, unknown> | null,
): RAGIngestPayload {
  const papers: RAGIngestPaper[] = (crawlData.aggregated_extraction?.papers ?? []).map((p) => ({
    paper_id: p.paper_id,
    title: p.title ?? '',
    abstract: p.abstract ?? '',
    introduction: p.introduction ?? '',
    methodology: p.methodology ?? '',
    results: p.results ?? '',
    conclusion: p.conclusion ?? '',
    claims: p.claims ?? [],
    datasets: p.datasets ?? [],
    figures: (p.figures ?? []).map((f) => ({
      summary: f.summary ?? '',
    })),
  }));

  // Extract council sections if available
  const council = councilData ?? {};

  const globalClaimSummary = council.global_claim_summary as
    | { papers?: unknown[]; summary?: string }
    | undefined;

  const methodComparison = council.method_comparison_analysis as
    | { papers?: unknown[]; summary?: string }
    | undefined;

  const contradictionReport = council.contradiction_report as
    | { contradictions?: unknown[] }
    | undefined;

  const evidenceMapping = council.evidence_strength_mapping as
    | { papers?: unknown[] }
    | undefined;

  return {
    session_id: sessionId,
    nlp: {
      aggregated_extraction: {
        papers,
      },
    },
    council: {
      global_claim_summary: {
        papers: globalClaimSummary?.papers ?? [],
        summary: globalClaimSummary?.summary ?? '',
      },
      method_comparison_analysis: {
        papers: methodComparison?.papers ?? [],
        summary: methodComparison?.summary ?? '',
      },
      contradiction_report: {
        contradictions: contradictionReport?.contradictions ?? [],
      },
      evidence_strength_mapping: {
        papers: evidenceMapping?.papers ?? [],
      },
      ranked_research_gaps: (council.ranked_research_gaps as unknown[]) ?? [],
      actionable_experiment_suggestions:
        (council.actionable_experiment_suggestions as unknown[]) ?? [],
    },
  };
}

// ─── API Calls (client-side, hit Next.js proxy routes) ───────────────────────

const RAG_INGEST_ENDPOINT = 'http://164.52.193.157/ingest';
const RAG_QUERY_ENDPOINT = 'http://164.52.193.157/query';

export async function ingestToRAG(payload: RAGIngestPayload): Promise<RAGIngestResponse> {
  const response = await fetch(RAG_INGEST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RAG ingest failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function queryRAG(payload: RAGQueryPayload): Promise<RAGQueryResponse> {
  const response = await fetch(RAG_QUERY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RAG query failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
