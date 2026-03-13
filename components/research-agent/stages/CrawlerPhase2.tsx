'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ResearchQuery } from '@/utils/types';
import { animateGridStagger } from '@/utils/animations';

interface CrawlerPhase2Props {
  query: ResearchQuery;
}

interface ApiPaper {
  paper_id: string;
  title: string;
  topic: string;
  abstract: string;
}

interface ApiResponse {
  discovered: number;
  saved: number;
  aggregated_extraction?: {
    papers?: ApiPaper[];
  };
}

export default function CrawlerPhase2({ query }: CrawlerPhase2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCrawlerData = async () => {
      try {
        const response = await fetch('/api/research');
        if (!response.ok) {
          throw new Error('Failed to fetch crawler data');
        }

        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCrawlerData();
  }, []);

  useEffect(() => {
    if (containerRef.current && apiData?.aggregated_extraction?.papers?.length) {
      animateGridStagger(containerRef.current, '.paper-grid-item', 0.5);
    }
  }, [apiData]);

  const papers = apiData?.aggregated_extraction?.papers ?? [];

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Papers Found"
          value={(apiData?.discovered ?? 0).toString()}
          color="#2196F3"
        />
        <StatCard
          label="Saved"
          value={(apiData?.saved ?? 0).toString()}
          color="#2196F3"
        />
      </div>

      {/* Paper Cards */}
      <div ref={containerRef} className="grid grid-cols-1 gap-4">
        {isLoading && (
          <div className="paper-grid-item p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-textSecondary">Loading papers...</p>
          </div>
        )}

        {!isLoading && papers.length > 0 && papers.map((paper) => (
          <div
            key={paper.paper_id}
            className="paper-grid-item p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-foreground mb-2 text-balance">{paper.title}</h3>
            <div className="mb-3">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{paper.topic || query.question}</span>
            </div>
            <p className="text-xs text-textTertiary mb-3 line-clamp-4">{paper.abstract}</p>
          </div>
        ))}

        {!isLoading && papers.length === 0 && (
          <div className="paper-grid-item p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-textSecondary">No papers found in API response.</p>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-textTertiary py-8">
        Showing {papers.length} of {papers.length} papers
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="p-4 bg-white border-x-4 border-y-0 rounded-lg"
      style={{
        borderColor: color,
        boxShadow: `inset 0 1px 0 ${color}55, inset 0 -1px 0 ${color}55`,
      }}
    >
      <p className="text-xs text-textTertiary mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
