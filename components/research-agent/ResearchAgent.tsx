'use client';

import React, { useState, useCallback, useRef } from 'react';
import { AppState, CrawlApiResponse, StageType } from '@/utils/types';
import LandingPage from './LandingPage';
import ProcessingPhase from './ProcessingPhase';
import ExplorePhase from './ExplorePhase';

export default function ResearchAgent() {
  const [crawlData, setCrawlData] = useState<CrawlApiResponse | null>(null);
  const [isCrawlLoading, setIsCrawlLoading] = useState(false);
  const crawlRequestIdRef = useRef(0);

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
    const payload = {
      question: query.trim(),
      topic_count: 4,
      max_papers: 3,
    };

    const requestId = Date.now();
    crawlRequestIdRef.current = requestId;

    setCrawlData(null);
    setIsCrawlLoading(true);

    console.info('Calling crawl API:', payload);

    const wait = (ms: number) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

    const fetchUntilSuccess = async () => {
      let attempt = 0;

      while (crawlRequestIdRef.current === requestId) {
        attempt += 1;

        try {
          const response = await fetch('http://164.52.193.157/crawl', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          console.info(`Crawl API response status (attempt ${attempt}):`, response.status);

          if (response.status === 200) {
            const data = await response.json();

            if (crawlRequestIdRef.current !== requestId) {
              return;
            }

            setCrawlData(data);
            setIsCrawlLoading(false);
            setAppState((prev) => ({
              ...prev,
              phase: 'explore',
              allStagesComplete: true,
              activeStage: 'crawler',
            }));
            return;
          }
        } catch (error) {
          console.error(`Crawl API request failed (attempt ${attempt}):`, error);
        }

        if (crawlRequestIdRef.current !== requestId) {
          return;
        }

        await wait(2500);
      }
    };

    void fetchUntilSuccess();

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

  const handleSelectStage = useCallback((stageId: StageType) => {
    setAppState((prev) => ({
      ...prev,
      activeStage: stageId,
    }));
  }, []);

  const handleBack = useCallback(() => {
    crawlRequestIdRef.current += 1;
    setCrawlData(null);
    setIsCrawlLoading(false);

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
        crawlData={crawlData}
        isCrawlLoading={isCrawlLoading}
        onStageComplete={handleStageComplete}
        stageStatuses={appState.stageStatuses}
      />
    );
  }

  if (appState.phase === 'explore') {
    return (
      <ExplorePhase
        query={appState.query!}
        crawlData={crawlData}
        isCrawlLoading={isCrawlLoading}
        activeStage={appState.activeStage!}
        onSelectStage={handleSelectStage}
        onBack={handleBack}
        stageStatuses={appState.stageStatuses}
      />
    );
  }

  return null;
}
