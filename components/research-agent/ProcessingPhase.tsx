'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CrawlApiResponse, ResearchQuery, StageType, StageStatus } from '@/utils/types';
import TimelineCenter from './TimelineCenter';
import { animateTimelineCollapse } from '@/utils/animations';

interface ProcessingPhaseProps {
  query: ResearchQuery;
  crawlData: CrawlApiResponse | null;
  isCrawlLoading: boolean;
  onStageComplete: (stageId: StageType) => void;
  stageStatuses: Record<StageType, StageStatus>;
}

export default function ProcessingPhase({
  query,
  crawlData,
  isCrawlLoading,
  onStageComplete,
  stageStatuses,
}: ProcessingPhaseProps) {
  const [completedStages, setCompletedStages] = useState<StageType[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Simulate stage progression once, then hold on last stage while waiting for API success
  useEffect(() => {
    const stageIds: StageType[] = ['crawler', 'nlp', 'agents', 'graph', 'rag', 'report'];
    const delays = [0, 3000, 6000, 9000, 13500, 17000];

    setCompletedStages([]);
    setAllComplete(false);

    const timerIds = stageIds.map((stageId, index) => {
      return setTimeout(() => {
        onStageComplete(stageId);
        setCompletedStages((prev) => [...prev, stageId]);
      }, delays[index]);
    });

    return () => {
      timerIds.forEach((timerId) => clearTimeout(timerId));
    };
  }, [onStageComplete]);

  return (
    <div className="relative min-h-screen bg-muted bg-linear-to-br from-primary/20 via-chart-1/10 to-chart-2/20 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-chart-4/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analyzing Research</h1>
          <p className="text-textSecondary">{query.question}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {query.keywords.map((keyword) => (
              <span key={keyword} className="px-3 py-1 bg-card/80 border border-border/70 text-foreground text-xs rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="flex justify-center">
          <TimelineCenter
            query={query}
            crawlData={crawlData}
            isCrawlLoading={isCrawlLoading}
            completedStages={completedStages}
            allComplete={allComplete}
          />
        </div>

        {/* Status Footer */}
        <div className="mt-12 text-center text-sm text-textTertiary">
          <p>Processing stage {Math.min(completedStages.length + 1, 7)} of 7...</p>
          {isCrawlLoading && <p className="mt-2"></p>}
          {allComplete && !isCrawlLoading && <p className="mt-2 text-green-600 font-semibold">Research complete. Transitioning...</p>}
        </div>
      </div>
    </div>
  );
}
