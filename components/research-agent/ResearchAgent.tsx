'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, CrawlApiResponse, StageType } from '@/utils/types';
import LandingPage from './LandingPage';
import ProcessingPhase from './ProcessingPhase';
import ExplorePhase from './ExplorePhase';

const SESSION_STORAGE_KEY = 'research-agent-session-v1';

const initialStageStatuses: AppState['stageStatuses'] = {
  crawler: 'pending',
  nlp: 'pending',
  agents: 'pending',
  graph: 'pending',
  rag: 'pending',
  report: 'pending',
  trail: 'pending',
};

const initialAppState: AppState = {
  phase: 'landing',
  activeStage: null,
  query: null,
  stageStatuses: initialStageStatuses,
  allStagesComplete: false,
};

interface PersistedResearchAgentState {
  appState: AppState;
  crawlData: CrawlApiResponse | null;
  isCrawlLoading: boolean;
}

export default function ResearchAgent() {
  const [crawlData, setCrawlData] = useState<CrawlApiResponse | null>(null);
  const [isCrawlLoading, setIsCrawlLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const crawlRequestIdRef = useRef(0);

  const [appState, setAppState] = useState<AppState>(initialAppState);

  const runCrawlRequestUntilSuccess = useCallback((question: string, requestId: number) => {
    const payload = {
      question: question.trim(),
      topic_count: 4,
      max_papers: 3,
    };

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
              activeStage: prev.activeStage ?? 'crawler',
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
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (!raw) {
        setIsHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as PersistedResearchAgentState;

      if (parsed?.appState) {
        setAppState(parsed.appState);
      }

      if (parsed?.crawlData) {
        setCrawlData(parsed.crawlData);
      }

      setIsCrawlLoading(Boolean(parsed?.isCrawlLoading));

      if (parsed?.isCrawlLoading && parsed?.appState?.query?.question && !parsed?.crawlData) {
        const requestId = Date.now();
        crawlRequestIdRef.current = requestId;
        runCrawlRequestUntilSuccess(parsed.appState.query.question, requestId);
      }
    } catch (error) {
      console.error('Failed to restore research session state:', error);
    } finally {
      setIsHydrated(true);
    }
  }, [runCrawlRequestUntilSuccess]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return;
    }

    const payload: PersistedResearchAgentState = {
      appState,
      crawlData,
      isCrawlLoading,
    };

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }, [appState, crawlData, isCrawlLoading, isHydrated]);

  const handleStartResearch = useCallback((query: string, keywords: string[]) => {
    const requestId = Date.now();
    crawlRequestIdRef.current = requestId;

    setCrawlData(null);
    setIsCrawlLoading(true);

    runCrawlRequestUntilSuccess(query, requestId);

    setAppState((prev) => ({
      ...prev,
      phase: 'processing',
      query: { question: query, keywords },
      stageStatuses: initialStageStatuses,
    }));
  }, [runCrawlRequestUntilSuccess]);

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

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    setCrawlData(null);
    setIsCrawlLoading(false);

    setAppState(initialAppState);
  }, []);

  if (!isHydrated) {
    return null;
  }

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
