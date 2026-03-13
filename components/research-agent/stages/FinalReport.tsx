'use client';

import React, { useEffect, useRef } from 'react';
import { mockVeridict } from '@/utils/mockData';
import { animateCardSlideIn } from '@/utils/animations';

export default function FinalReport() {
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionsRef.current) {
      const sections = sectionsRef.current.querySelectorAll('.report-section');
      animateCardSlideIn(Array.from(sections), 0.4, 0.1);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">📄</span>
        <span>Report Generation</span>
      </div>

      <div ref={sectionsRef} className="space-y-2">
        <div className="report-section p-3 bg-white border-l-4 border-green-500 rounded">
          <p className="text-xs font-semibold text-foreground">Executive Summary</p>
          <p className="text-xs text-textSecondary mt-1 line-clamp-2">
            {mockVeridict.summary}
          </p>
        </div>

        <div className="report-section p-3 bg-white border-l-4 border-green-500 rounded">
          <p className="text-xs font-semibold text-foreground">Key Findings</p>
          <ul className="text-xs text-textSecondary mt-1 space-y-1">
            {mockVeridict.keyFindings.slice(0, 2).map((finding, i) => (
              <li key={i} className="line-clamp-1">• {finding}</li>
            ))}
          </ul>
        </div>

        <div className="report-section p-3 bg-white border-l-4 border-green-500 rounded">
          <p className="text-xs font-semibold text-foreground">Research Gaps</p>
          <ul className="text-xs text-textSecondary mt-1 space-y-1">
            {mockVeridict.gaps.slice(0, 2).map((gap, i) => (
              <li key={i} className="line-clamp-1">• {gap}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-xs text-textTertiary italic">
        Compiling report sections...
      </div>
    </div>
  );
}
