'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ResearchQuery } from '@/utils/types';

interface NLPPhase2Props {
  query: ResearchQuery;
}

type TabType = 'abstract' | 'introduction' | 'methodology' | 'results' | 'conclusion';

interface ApiPaper {
  paper_id: string;
  title: string;
  abstract?: string;
  introduction?: string;
  methodology?: string;
  results?: string;
  conclusion?: string;
}

interface ApiResponse {
  aggregated_extraction?: {
    processed_count?: number;
    papers?: ApiPaper[];
  };
}

export default function NLPPhase2({ query }: NLPPhase2Props) {
  const [activeTab, setActiveTab] = useState<TabType>('abstract');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadNlpData();
  }, []);

  const tabs: { id: TabType; label: string; key: keyof ApiPaper }[] = [
    { id: 'abstract', label: 'Abstracts', key: 'abstract' },
    { id: 'introduction', label: 'Introduction', key: 'introduction' },
    { id: 'methodology', label: 'Methodology', key: 'methodology' },
    { id: 'results', label: 'Results', key: 'results' },
    { id: 'conclusion', label: 'Conclusion', key: 'conclusion' },
  ];

  const papers = apiData?.aggregated_extraction?.papers ?? [];

  const extractedSections = useMemo(() => {
    return papers.reduce((count, paper) => {
      return count + ['abstract', 'introduction', 'methodology', 'results', 'conclusion'].filter((field) => {
        const value = paper[field as keyof ApiPaper];
        return typeof value === 'string' && value.trim().length > 0;
      }).length;
    }, 0);
  }, [papers]);

  const averageWords = useMemo(() => {
    const sectionTexts = papers.flatMap((paper) => [
      paper.abstract,
      paper.introduction,
      paper.methodology,
      paper.results,
      paper.conclusion,
    ]).filter((value): value is string => Boolean(value && value.trim()));

    if (sectionTexts.length === 0) {
      return 0;
    }

    const totalWords = sectionTexts.reduce((count, text) => count + text.trim().split(/\s+/).length, 0);
    return Math.round(totalWords / sectionTexts.length);
  }, [papers]);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Papers Processed" value={(apiData?.aggregated_extraction?.processed_count ?? papers.length).toString()} color="#9C27B0" />
        <StatCard label="Sections Extracted" value={extractedSections.toString()} color="#9C27B0" />
        <StatCard label="Avg Words/Section" value={averageWords.toString()} color="#9C27B0" />
        <StatCard label="Active Query" value={query.keywords.length.toString()} color="#9C27B0" />
      </div>

      {/* Tab Navigation */}
      <div>
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-textSecondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-foreground">Paper Title</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Extracted Content</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td colSpan={2} className="px-4 py-3 text-textSecondary text-xs">Loading extracted sections...</td>
              </tr>
            )}

            {!isLoading && papers.map((paper) => {
              const content = paper[activeTab] || 'N/A';

              return (
                <tr key={paper.paper_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-foreground text-xs max-w-xs">
                    <div className="line-clamp-2">{paper.title}</div>
                  </td>
                  <td className="px-4 py-3 text-textSecondary text-xs max-w-2xl">
                    <div className="line-clamp-3">{content || 'N/A'}</div>
                  </td>
                </tr>
              );
            })}

            {!isLoading && papers.length === 0 && (
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td colSpan={2} className="px-4 py-3 text-textSecondary text-xs">No extracted papers found in API response.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Chips */}
      <div className="p-4 bg-purple-50 rounded-lg">
        <p className="text-sm font-semibold text-foreground mb-3">Key Metrics</p>
        <div className="flex flex-wrap gap-2">
          <Chip label={`${papers.length} papers analyzed`} color="#9C27B0" />
          <Chip label={`${tabs.length} section views available`} color="#9C27B0" />
          <Chip label={`${extractedSections} extracted sections`} color="#9C27B0" />
        </div>
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
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-3 py-1 text-xs font-medium text-white rounded-full"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
