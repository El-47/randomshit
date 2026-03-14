'use client';

import React, { Suspense } from 'react';
import { CrawlApiResponse, StageType, ResearchQuery } from '@/utils/types';
import { mockStages } from '@/utils/mockData';
import CrawlerPhase2 from '../stages/CrawlerPhase2';
import NLPPhase2 from '../stages/NLPPhase2';
import AgentCouncilPhase2 from '../stages/AgentCouncilPhase2';
import KnowledgeGraphPhase2 from '../stages/KnowledgeGraphPhase2';
import RAGPhase2 from '../stages/RAGPhase2';
import FinalReportPhase2 from '../stages/FinalReportPhase2';
import ExecutionTrailPhase2 from '../stages/ExecutionTrailPhase2';

interface StagePageProps {
  stageId: StageType;
  query: ResearchQuery;
  crawlData: CrawlApiResponse | null;
  isCrawlLoading: boolean;
}

function StageGlyph({ stageId }: { stageId: StageType }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'h-5 w-5',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (stageId) {
    case 'crawler':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="5.5" />
          <path d="M15 15L20 20" />
          <path d="M11 8.5V13.5" opacity="0.75" />
          <path d="M8.5 11H13.5" opacity="0.75" />
        </svg>
      );
    case 'nlp':
      return (
        <svg {...commonProps}>
          <path d="M9 6.5C6.8 6.5 5 8.3 5 10.5C5 12 5.8 13.3 7 14V16.3C7 17.2 7.8 18 8.7 18H9.2" />
          <path d="M15 6.5C17.2 6.5 19 8.3 19 10.5C19 12 18.2 13.3 17 14V16.3C17 17.2 16.2 18 15.3 18H14.8" />
          <path d="M9.2 18H14.8" />
          <path d="M10 10.5H10.01" />
          <path d="M14 10.5H14.01" />
          <path d="M10.5 13.5C11 14 11.5 14.2 12 14.2C12.5 14.2 13 14 13.5 13.5" />
        </svg>
      );
    case 'agents':
      return (
        <svg {...commonProps}>
          <path d="M8.5 11C10.1569 11 11.5 9.65685 11.5 8C11.5 6.34315 10.1569 5 8.5 5C6.84315 5 5.5 6.34315 5.5 8C5.5 9.65685 6.84315 11 8.5 11Z" />
          <path d="M15.5 12C16.8807 12 18 10.8807 18 9.5C18 8.11929 16.8807 7 15.5 7" opacity="0.75" />
          <path d="M4.5 18C5 15.9 6.9 14.5 9 14.5C11.1 14.5 13 15.9 13.5 18" />
          <path d="M14 17C14.3 15.8 15.3 15 16.5 15C17.7 15 18.7 15.8 19 17" opacity="0.75" />
        </svg>
      );
    case 'graph':
      return (
        <svg {...commonProps}>
          <circle cx="6.5" cy="7" r="2" />
          <circle cx="17.5" cy="6.5" r="2" />
          <circle cx="12" cy="17" r="2.2" />
          <path d="M8.4 7.2L15.5 6.7" />
          <path d="M7.8 8.6L10.7 15" />
          <path d="M16.3 8.2L13.3 15" />
        </svg>
      );
    case 'rag':
      return (
        <svg {...commonProps}>
          <path d="M6.5 7.5C6.5 6.7 7.2 6 8 6H13L17.5 10.5V16.5C17.5 17.3 16.8 18 16 18H8C7.2 18 6.5 17.3 6.5 16.5V7.5Z" />
          <path d="M13 6V10.5H17.5" />
          <path d="M9 13H15" opacity="0.75" />
          <path d="M9 15.5H13" opacity="0.75" />
          <path d="M18.5 6.5L19 7.7L20.2 8.2L19 8.7L18.5 10L18 8.7L16.8 8.2L18 7.7L18.5 6.5Z" />
        </svg>
      );
    case 'report':
      return (
        <svg {...commonProps}>
          <path d="M8 5.5H16C16.8 5.5 17.5 6.2 17.5 7V17C17.5 17.8 16.8 18.5 16 18.5H8C7.2 18.5 6.5 17.8 6.5 17V7C6.5 6.2 7.2 5.5 8 5.5Z" />
          <path d="M9.5 10.5H14.5" />
          <path d="M9.5 13H14.5" opacity="0.75" />
          <path d="M9.5 15.5H12.5" opacity="0.75" />
          <path d="M15.8 8.3L16.5 9L15 10.5" />
        </svg>
      );
    case 'trail':
      return (
        <svg {...commonProps}>
          <circle cx="7" cy="7" r="1.75" />
          <circle cx="17" cy="17" r="1.75" />
          <path d="M8.7 8.2C10.2 9.2 10.8 10 11.2 11.4C11.6 12.8 12.5 13.8 15.1 15.2" />
          <path d="M13.8 7H17V10.2" opacity="0.75" />
          <path d="M17 7L12.8 11.2" opacity="0.75" />
        </svg>
      );
    default:
      return null;
  }
}

function StageIcon({ stageId, color }: { stageId: StageType; color: string }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm"
      style={{
        color,
        background: `linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`,
      }}
    >
      <StageGlyph stageId={stageId} />
    </div>
  );
}

const phaseComponents: Record<StageType, React.ComponentType<{ query: ResearchQuery }>> = {
  crawler: CrawlerPhase2,
  nlp: NLPPhase2,
  agents: AgentCouncilPhase2,
  graph: KnowledgeGraphPhase2,
  rag: RAGPhase2,
  report: FinalReportPhase2,
  trail: ExecutionTrailPhase2,
};

export default function StagePage({ stageId, query, crawlData, isCrawlLoading }: StagePageProps) {
  const stage = mockStages.find((s) => s.id === stageId);
  const Component = phaseComponents[stageId];

  if (!stage || !Component) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <StageIcon stageId={stage.id} color={stage.color} />
          <h1 className="text-2xl font-bold text-foreground">{stage.name}</h1>
        </div>
        <p className="text-textSecondary">{stage.description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <Component query={query} apiData={crawlData} isLoading={isCrawlLoading} />
        </Suspense>
      </div>
    </div>
  );
}
