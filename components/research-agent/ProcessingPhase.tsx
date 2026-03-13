'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResearchQuery, StageType, StageStatus } from '@/utils/types';
import { mockStages } from '@/utils/mockData';
import TimelineCenter from './TimelineCenter';
import { animateTimelineCollapse } from '@/utils/animations';
import gsap from 'gsap';

interface ProcessingPhaseProps {
  query: ResearchQuery;
  onStageComplete: (stageId: StageType) => void;
  onAllStagesComplete: () => void;
  stageStatuses: Record<StageType, StageStatus>;
}

export default function ProcessingPhase({
  query,
  onStageComplete,
  onAllStagesComplete,
  stageStatuses,
}: ProcessingPhaseProps) {
  const [completedStages, setCompletedStages] = useState<StageType[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Simulate stage progression
  useEffect(() => {
    const stageIds: StageType[] = ['crawler', 'nlp', 'agents', 'graph', 'rag', 'report', 'trail'];
    const delays = [0, 3000, 6500, 10000, 13500, 17000, 20500];

    const timers = stageIds.map((stageId, index) => {
      return setTimeout(() => {
        onStageComplete(stageId);
        setCompletedStages((prev) => [...prev, stageId]);
      }, delays[index]);
    });

    // After all stages complete, trigger transition
    const finalTimer = setTimeout(() => {
      setAllComplete(true);
      // Trigger animation collapse after a brief delay
      setTimeout(() => {
        if (timelineRef.current) {
          animateTimelineCollapse(timelineRef.current, 0.8);
        }
        setTimeout(() => {
          onAllStagesComplete();
        }, 900);
      }, 500);
    }, delays[delays.length - 1] + 1000);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearTimeout(finalTimer);
    };
  }, [onStageComplete, onAllStagesComplete]);

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
          <TimelineCenter completedStages={completedStages} allComplete={allComplete} />
        </div>

        {/* Status Footer */}
        <div className="mt-12 text-center text-sm text-textTertiary">
          <p>Processing stage {completedStages.length + 1} of 7...</p>
          {allComplete && <p className="mt-2 text-green-600 font-semibold">Research complete. Transitioning...</p>}
        </div>
      </div>
    </div>
  );
}
