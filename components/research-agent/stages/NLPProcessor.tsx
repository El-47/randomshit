'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animateCounter, animatePulse } from '@/utils/animations';

interface ApiPaper {
  abstract?: string;
  methodology?: string;
  results?: string;
  conclusion?: string;
}

interface ApiResponse {
  aggregated_extraction?: {
    papers?: ApiPaper[];
  };
}

export default function NLPProcessor() {
  const countRef = useRef<HTMLSpanElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const loadNlpData = async () => {
      try {
        const response = await fetch('/api/research');
        if (!response.ok) {
          throw new Error('Failed to fetch NLP data');
        }

        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadNlpData();
  }, []);

  const tasks = useMemo(() => {
    const papers = apiData?.aggregated_extraction?.papers ?? [];
    const total = papers.length || 1;

    const getProgress = (field: keyof ApiPaper) => (
      Math.round((papers.filter((paper) => (paper[field] ?? '').trim().length > 0).length / total) * 100)
    );

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
        const value = paper[field as keyof ApiPaper];
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
        Processing pipeline active...
      </div>
    </div>
  );
}
