'use client';

import React, { useMemo } from 'react';
import { StageType } from '@/utils/types';
import { mockStages } from '@/utils/mockData';
import TimelineNode from './shared/TimelineNode';
import Crawler from './stages/Crawler';
import NLPProcessor from './stages/NLPProcessor';
import AgentCouncil from './stages/AgentCouncil';
import KnowledgeGraph from './stages/KnowledgeGraph';
import RAGInterface from './stages/RAGInterface';
import FinalReport from './stages/FinalReport';
import ExecutionTrail from './stages/ExecutionTrail';

interface TimelineCenterProps {
  completedStages: StageType[];
  allComplete: boolean;
}

export default function TimelineCenter({ completedStages, allComplete }: TimelineCenterProps) {
  const stageComponents: Record<StageType, React.ComponentType> = {
    crawler: Crawler,
    nlp: NLPProcessor,
    agents: AgentCouncil,
    graph: KnowledgeGraph,
    rag: RAGInterface,
    report: FinalReport,
    trail: ExecutionTrail,
  };

  const activeStageIndex = completedStages.length;
  const activeStageId = mockStages[activeStageIndex]?.id as StageType | undefined;
  const ActiveComponent = activeStageId ? stageComponents[activeStageId] : null;

  // Get stage order
  const stageOrder: StageType[] = ['crawler', 'nlp', 'agents', 'graph', 'rag', 'report', 'trail'];

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-8">
        {/* Timeline Nodes */}
        <div className="flex gap-8 items-start justify-center flex-wrap max-w-5xl">
          {mockStages.map((stage, index) => (
            <TimelineNode
              key={stage.id}
              stage={stage}
              index={index}
              isActive={index === activeStageIndex && !allComplete}
              isCompleted={completedStages.includes(stage.id)}
            />
          ))}
        </div>

        {/* Active Stage Component */}
        {ActiveComponent && (
          <div className="w-full max-w-2xl mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
            <ActiveComponent />
          </div>
        )}
      </div>
    </div>
  );
}
