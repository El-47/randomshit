'use client';

import React, { useEffect, useRef } from 'react';
import { mockPapers } from '@/utils/mockData';
import { animateCounter, animateCardSlideIn } from '@/utils/animations';

export default function Crawler() {
  const countRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate counter
    if (countRef.current) {
      animateCounter(countRef.current, mockPapers.length, 1, 0.3);
    }

    // Animate cards
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.paper-card');
      animateCardSlideIn(Array.from(cards), 0.4, 0.08);
    }
  }, []);

  const displayPapers = mockPapers.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">🔍</span>
        <span>
          Papers found: <span ref={countRef} className="text-blue-500">0</span>
        </span>
      </div>

      <div ref={cardsRef} className="space-y-2">
        {displayPapers.map((paper) => (
          <div key={paper.id} className="paper-card p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2">{paper.title}</h4>
            <p className="text-xs text-textTertiary mt-1">
              {paper.authors[0]} et al. • {paper.year}
            </p>
          </div>
        ))}
      </div>

      <div className="text-xs text-textTertiary italic">
        Searching 12 papers total...
      </div>
    </div>
  );
}
