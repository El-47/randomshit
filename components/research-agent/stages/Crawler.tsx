'use client';

import React, { useEffect, useRef } from 'react';
import { CrawlApiResponse, ResearchQuery } from '@/utils/types';
import { animateCounter, animateCardSlideIn } from '@/utils/animations';

interface CrawlerProps {
  query: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

export default function Crawler({ query, apiData, isLoading = false }: CrawlerProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const papers = apiData?.aggregated_extraction?.papers ?? [];
  const displayPapers = papers.slice(0, 4);

  useEffect(() => {
    // Animate counter
    if (countRef.current) {
      animateCounter(countRef.current, apiData?.discovered ?? papers.length, 1, 0.3);
    }

    // Animate cards
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.paper-card');
      animateCardSlideIn(cards, 0.4, 0.08);
    }
  }, [apiData?.discovered, papers.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">🔍</span>
        <span>
          Papers found: <span ref={countRef} className="text-blue-500">0</span>
        </span>
      </div>

      <div ref={cardsRef} className="space-y-2">
        {isLoading && (
          <div className="paper-card p-3 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-foreground">Loading papers...</h4>
          </div>
        )}

        {displayPapers.map((paper) => (
          <div key={paper.paper_id} className="paper-card p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2">{paper.title ?? 'Untitled paper'}</h4>
            <p className="text-xs text-textTertiary mt-1">
              {paper.topic || query.question}
            </p>
          </div>
        ))}

        {!isLoading && displayPapers.length === 0 && (
          <div className="paper-card p-3 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-foreground">No papers found yet</h4>
          </div>
        )}
      </div>

      <div className="text-xs text-textTertiary italic">
        Searching {(apiData?.discovered ?? papers.length).toString()} papers total...
      </div>
    </div>
  );
}
