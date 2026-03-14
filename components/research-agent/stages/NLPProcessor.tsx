'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { animateCounter, animatePulse } from '@/utils/animations';
import { CrawlApiPaper, CrawlApiResponse, ResearchQuery } from '@/utils/types';

interface NLPProcessorProps {
  query: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

export default function NLPProcessor({ query, apiData, isLoading = false }: NLPProcessorProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);

  const tasks = useMemo(() => {
    const papers = apiData?.aggregated_extraction?.papers ?? [];
    const total = papers.length || 1;

    const getProgress = (field: keyof CrawlApiPaper) => {
      const count = papers.filter((paper) => {
        const value = paper[field];
        return typeof value === 'string' && value.trim().length > 0;
      }).length;
      return Math.round((count / total) * 100);
    };

    return [
      { label: 'Abstract Extraction', progress: getProgress('abstract') },
      { label: 'Methodology Parsing', progress: getProgress('methodology') },
      { label: 'Results Extraction', progress: getProgress('results') },
      { label: 'Conclusion Extraction', progress: getProgress('conclusion') },
    ];
  }, [apiData]);

  const extractedSections = useMemo(() => {
    const papers = apiData?.aggregated_extraction?.papers ?? [];

    return papers.reduce((count, paper) => {
      return count + ['abstract', 'methodology', 'results', 'conclusion'].filter((field) => {
        const value = paper[field as keyof CrawlApiPaper];
        return typeof value === 'string' && value.trim().length > 0;
      }).length;
    }, 0);
  }, [apiData]);

  useEffect(() => {
    // Animate counter
    if (countRef.current) {
      animateCounter(countRef.current, extractedSections, 1, 0.3);
    }

    // Pulse brain icon
    if (brainRef.current) {
      animatePulse(brainRef.current, 2);
    }
  }, [extractedSections]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <div ref={brainRef} className="text-2xl animate-pulse-subtle">🧠</div>
        <span>
          Sections extracted: <span ref={countRef} className="text-purple-500">0</span>
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground">{task.label}</span>
              <span className="text-textTertiary">{task.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-textTertiary italic">
        {isLoading ? 'Loading extracted sections...' : 'Processing pipeline active...'}
      </div>
    </div>
  );
}
