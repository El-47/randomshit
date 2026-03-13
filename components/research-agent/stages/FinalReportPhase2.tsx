'use client';

import React from 'react';
import { ResearchQuery } from '@/utils/types';
import { mockVeridict, mockPapers } from '@/utils/mockData';
import { Download } from 'lucide-react';

interface FinalReportPhase2Props {
  query: ResearchQuery;
}

export default function FinalReportPhase2({ query }: FinalReportPhase2Props) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Report Generated" value="✓" color="#43A047" />
        <StatCard label="Papers Analyzed" value={mockPapers.length.toString()} color="#43A047" />
        <StatCard label="Key Findings" value={mockVeridict.keyFindings.length.toString()} color="#43A047" />
        <StatCard label="Gaps Identified" value={mockVeridict.gaps.length.toString()} color="#43A047" />
      </div>

      {/* Download Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors">
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Executive Summary */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Executive Summary
        </h2>
        <p className="text-foreground leading-relaxed">{mockVeridict.summary}</p>
      </section>

      {/* Papers Analyzed */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Papers Analyzed
        </h2>
        <div className="space-y-2">
          {mockPapers.map((paper) => (
            <div key={paper.id} className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
              <p className="font-semibold text-sm text-foreground">{paper.title}</p>
              <p className="text-xs text-textSecondary">
                {paper.authors[0]} et al. • {paper.source} • {paper.year}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Methods Comparison */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Key Methods Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 border-b border-green-200">
                <th className="px-3 py-2 text-left font-semibold text-foreground">Paper</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">Method</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {mockPapers.slice(0, 4).map((paper) => (
                <tr key={paper.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2 text-textSecondary text-xs">{paper.title.substring(0, 20)}...</td>
                  <td className="px-3 py-2 text-textSecondary text-xs">{paper.methodology?.substring(0, 30)}...</td>
                  <td className="px-3 py-2 text-textSecondary text-xs">Reviewed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contradictions Found */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Contradictions Found
        </h2>
        <ul className="space-y-2">
          {mockVeridict.contradictions.map((contradiction, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-orange-500 font-bold flex-shrink-0">!</span>
              <span className="text-textSecondary">{contradiction}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Research Gaps */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Research Gaps
        </h2>
        <ul className="space-y-2">
          {mockVeridict.gaps.map((gap, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-blue-500 font-bold flex-shrink-0">?</span>
              <span className="text-textSecondary">{gap}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recommendations */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground border-b-4 border-green-500 pb-2">
          Recommendations for Future Work
        </h2>
        <ul className="space-y-2">
          {mockVeridict.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-green-500 font-bold flex-shrink-0">→</span>
              <span className="text-textSecondary">{rec}</span>
            </li>
          ))}
        </ul>
      </section>
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
