'use client';

import React from 'react';
import { ResearchQuery, StageType, StageStatus } from '@/utils/types';
import TimelineSidebar from './TimelineSidebar';
import StagePage from './shared/StagePage';

interface ExplorePhaseProps {
  query: ResearchQuery;
  activeStage: StageType;
  onSelectStage: (stageId: StageType) => void;
  onBack: () => void;
  stageStatuses: Record<StageType, StageStatus>;
}

export default function ExplorePhase({
  query,
  activeStage,
  onSelectStage,
  onBack,
  stageStatuses,
}: ExplorePhaseProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <TimelineSidebar
        activeStage={activeStage}
        onSelectStage={onSelectStage}
        onBack={onBack}
        stageStatuses={stageStatuses}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <StagePage
          stageId={activeStage}
          query={query}
        />
      </div>
    </div>
  );
}
