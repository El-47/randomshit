// Types for the Research Literature Agent

export type StageType = 'crawler' | 'nlp' | 'agents' | 'graph' | 'rag' | 'report' | 'trail';

export type StageStatus = 'pending' | 'processing' | 'complete';

export interface Stage {
  id: StageType;
  name: string;
  color: string;
  status: StageStatus;
  icon: string;
  description: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  abstract: string;
  sections?: {
    title: string;
    content: string;
  }[];
  methodology?: string;
  results?: string;
  limitations?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  analysis: string;
  status: 'analyzing' | 'complete';
  icon: string;
}

export interface Verdict {
  summary: string;
  keyFindings: string[];
  contradictions: string[];
  gaps: string[];
  recommendations: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: Date;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  stage: StageType;
  details: string;
  status: 'complete' | 'processing' | 'pending';
}

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  connections: string[];
  description: string;
}

export interface ResearchQuery {
  question: string;
  keywords: string[];
}

export interface Phase1Data {
  papersFound: number;
  sectionsExtracted: number;
  agentAnalysisComplete: boolean;
  graphNodesGenerated: number;
  ragIndexed: boolean;
  reportSections: number;
  eventsLogged: number;
}

export interface AppState {
  phase: 'landing' | 'processing' | 'explore';
  activeStage: StageType | null;
  query: ResearchQuery | null;
  stageStatuses: Record<StageType, StageStatus>;
  allStagesComplete: boolean;
}
