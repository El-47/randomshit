'use client';

import React, { useState, useCallback } from 'react';
import { AppState, ResearchQuery, StageType } from '@/utils/types';
import LandingPage from './LandingPage';
import ProcessingPhase from './ProcessingPhase';
import ExplorePhase from './ExplorePhase';
import { mockStages } from '@/utils/mockData';

export default function ResearchAgent() {
  const [appState, setAppState] = useState<AppState>({
    phase: 'landing',
    activeStage: null,
    query: null,
    stageStatuses: {
      crawler: 'pending',
      nlp: 'pending',
      agents: 'pending',
      graph: 'pending',
      rag: 'pending',
      report: 'pending',
      trail: 'pending',
    },
    allStagesComplete: false,
  });

  const handleStartResearch = useCallback((query: string, keywords: string[]) => {
    setAppState((prev) => ({
      ...prev,
      phase: 'processing',
      query: { question: query, keywords },
      stageStatuses: {
        crawler: 'pending',
        nlp: 'pending',
        agents: 'pending',
        graph: 'pending',
        rag: 'pending',
        report: 'pending',
        trail: 'pending',
      },
    }));
  }, []);

  const handleStageComplete = useCallback((stageId: StageType) => {
    setAppState((prev) => ({
      ...prev,
      stageStatuses: {
        ...prev.stageStatuses,
        [stageId]: 'complete',
      },
    }));
  }, []);

  const handleAllStagesComplete = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      phase: 'explore',
      allStagesComplete: true,
      activeStage: 'crawler',
    }));
  }, []);

  const handleSelectStage = useCallback((stageId: StageType) => {
    setAppState((prev) => ({
      ...prev,
      activeStage: stageId,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setAppState({
      phase: 'landing',
      activeStage: null,
      query: null,
      stageStatuses: {
        crawler: 'pending',
        nlp: 'pending',
        agents: 'pending',
        graph: 'pending',
        rag: 'pending',
        report: 'pending',
        trail: 'pending',
      },
      allStagesComplete: false,
    });
  }, []);

  // Render based on current phase
  if (appState.phase === 'landing') {
    return <LandingPage onStartResearch={handleStartResearch} />;
  }

  if (appState.phase === 'processing') {
    return (
      <ProcessingPhase
        query={appState.query!}
        onStageComplete={handleStageComplete}
        onAllStagesComplete={handleAllStagesComplete}
        stageStatuses={appState.stageStatuses}
      />
    );
  }

  if (appState.phase === 'explore') {
    return (
      <ExplorePhase
        query={appState.query!}
        activeStage={appState.activeStage!}
        onSelectStage={handleSelectStage}
        onBack={handleBack}
        stageStatuses={appState.stageStatuses}
      />
    );
  }

  return null;
}
