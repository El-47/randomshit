'use client';

import React, { useEffect, useState } from 'react';
import { CrawlApiResponse, ResearchQuery } from '@/utils/types';

interface GlobalClaimSummary {
  paper_id: string;
  claim_text: string;
  confidence_score: number;
}

interface MethodComparisonAnalysis {
  paper_id: string;
  model_class: string;
  dataset_scale: string;
  evaluation_metrics: string[];
  baseline_fairness: string;
  experimental_assumptions: string[];
  inferred_details: string[];
}

interface ContradictionReport {
  contradiction_type: string;
  description: string;
  paper_ids: string[];
  severity: string;
  confidence: number;
  linked_gap_ids: number[];
}

interface EvidenceStrengthMapping {
  paper_id: string;
  claim_index: number;
  statistical_strength: string;
  replication_risk: string;
}

interface ResearchGap {
  gap_type: string;
  description: string;
  related_paper_ids: string[];
  priority_score: number;
  suggested_experiments: string[];
}

interface ExperimentSuggestion {
  title: string;
  hypothesis: string;
  datasets: string[];
  methods: string[];
  expected_outcome: string;
  priority_score: number;
}

interface AgentCouncilData {
  global_claim_summary: GlobalClaimSummary[];
  method_comparison_analysis: MethodComparisonAnalysis[];
  contradiction_report: ContradictionReport[];
  evidence_strength_mapping: EvidenceStrengthMapping[];
  ranked_research_gaps: ResearchGap[];
  actionable_experiment_suggestions: ExperimentSuggestion[];
}

const COLOR = '#FF6F00';

const SEVERITY_COLOR: Record<string, string> = {
  low: 'text-green-600 bg-green-50',
  moderate: 'text-yellow-700 bg-yellow-50',
  high: 'text-red-600 bg-red-50',
};

const GAP_TYPE_LABEL: Record<string, string> = {
  unresolved_question: 'Unresolved Question',
  missing_ablation: 'Missing Ablation',
  untested_combination: 'Untested Combination',
  new_direction: 'New Direction',
};

interface AgentCouncilPhase2Props {
  query: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

export default function AgentCouncilPhase2({ query, apiData, isLoading = false }: AgentCouncilPhase2Props) {
  const [data, setData] = useState<AgentCouncilData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!apiData) {
      return;
    }

    const runAgentCouncil = async () => {
      try {
        setIsAnalyzing(true);
        setErrorMessage(null);

        const response = await fetch('/api/agent-council', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent council analysis');
        }

        const json = await response.json();
        setData(json as AgentCouncilData);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to load agent analysis.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAgentCouncil();
  }, [apiData]);

  if (isLoading || isAnalyzing || !apiData) {
    return (
      <div className="flex items-center justify-center h-48 text-textTertiary text-sm">
        Loading analysis…
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500 text-sm">
        {errorMessage}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 text-textTertiary text-sm">
        No analysis data found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Claims Identified" value={data.global_claim_summary.length.toString()} color={COLOR} />
        <StatCard label="Contradictions" value={data.contradiction_report.length.toString()} color={COLOR} />
        <StatCard label="Research Gaps" value={data.ranked_research_gaps.length.toString()} color={COLOR} />
        <StatCard label="Experiments" value={data.actionable_experiment_suggestions.length.toString()} color={COLOR} />
      </div>

      {/* Global Claim Summary */}
      <div className="rounded-xl p-6 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
        <h2 className="text-lg font-semibold mb-4 pl-3 rounded-sm text-foreground" style={{ background: `${COLOR}12` }}>Global Claim Summary</h2>
        <div className="space-y-4">
          {data.global_claim_summary.map((claim, i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-lg"
              style={{ borderLeft: `4px solid ${COLOR}`, boxShadow: `inset 0 1px 0 ${COLOR}55, inset 0 -1px 0 ${COLOR}55` }}
            >
              <p className="text-xs font-mono text-textTertiary mb-2">{claim.paper_id}</p>
              <p className="text-sm text-textSecondary leading-relaxed">{claim.claim_text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Method Comparison */}
      <div className="rounded-xl p-6 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
        <h2 className="text-lg font-semibold mb-4 pl-3 rounded-sm text-foreground" style={{ background: `${COLOR}12` }}>Method Comparison</h2>
        <div className="grid grid-cols-1 gap-4">
          {data.method_comparison_analysis.map((m, i) => (
            <div key={i} className="p-5 bg-white rounded-lg" style={{ borderLeft: `4px solid ${COLOR}`, boxShadow: `inset 0 1px 0 ${COLOR}55, inset 0 -1px 0 ${COLOR}55` }}>
              <div className="flex flex-wrap gap-2 mb-3">
                <Tag label={m.model_class} color={COLOR} />
                <Tag label={`Scale: ${m.dataset_scale}`} color="#546E7A" />
                <Tag label={`Fairness: ${m.baseline_fairness}`} color="#43A047" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-textTertiary uppercase mb-1">Evaluation Metrics</p>
                  <ul className="space-y-1">
                    {m.evaluation_metrics.map((metric, j) => (
                      <li key={j} className="text-textSecondary flex gap-2">
                        <span style={{ color: COLOR }}>•</span> {metric}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-textTertiary uppercase mb-1">Experimental Assumptions</p>
                  <ul className="space-y-1">
                    {m.experimental_assumptions.map((a, j) => (
                      <li key={j} className="text-textSecondary flex gap-2">
                        <span style={{ color: COLOR }}>•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contradiction Report */}
      <div className="rounded-xl p-6 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
        <h2 className="text-lg font-semibold mb-4 pl-3 rounded-sm text-foreground" style={{ background: `${COLOR}12` }}>Contradiction Report</h2>
        <div className="space-y-4">
          {data.contradiction_report.map((c, i) => (
            <div key={i} className="p-5 bg-white rounded-lg" style={{ borderLeft: `4px solid ${COLOR}`, boxShadow: `inset 0 1px 0 ${COLOR}55, inset 0 -1px 0 ${COLOR}55` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${SEVERITY_COLOR[c.severity] ?? 'text-textSecondary bg-gray-100'}`}>
                  {c.severity} severity
                </span>
                <span className="text-xs text-textTertiary capitalize">{c.contradiction_type.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-textSecondary leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Research Gaps */}
      <div className="rounded-xl p-6 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
        <h2 className="text-lg font-semibold mb-4 pl-3 rounded-sm text-foreground" style={{ background: `${COLOR}12` }}>Ranked Research Gaps</h2>
        <div className="space-y-4">
          {data.ranked_research_gaps
            .slice()
            .sort((a, b) => b.priority_score - a.priority_score)
            .map((gap, i) => (
              <div key={i} className="p-5 bg-white rounded-lg" style={{ borderLeft: `4px solid ${COLOR}`, boxShadow: `inset 0 1px 0 ${COLOR}55, inset 0 -1px 0 ${COLOR}55` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${COLOR}18`, color: COLOR }}
                  >
                    {GAP_TYPE_LABEL[gap.gap_type] ?? gap.gap_type}
                  </span>
                  <span className="ml-auto text-xs font-bold" style={{ color: COLOR }}>
                    Priority {gap.priority_score}/10
                  </span>
                </div>
                <p className="text-sm text-textSecondary mb-3">{gap.description}</p>
                <div>
                  <p className="text-xs font-semibold text-textTertiary uppercase mb-1">Suggested Experiments</p>
                  <ul className="space-y-1">
                    {gap.suggested_experiments.map((exp, j) => (
                      <li key={j} className="text-xs text-textSecondary flex gap-2">
                        <span style={{ color: COLOR }}>→</span> {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Actionable Experiments */}
      <div className="rounded-xl p-6 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
        <h2 className="text-lg font-semibold mb-4 pl-3 rounded-sm text-foreground" style={{ background: `${COLOR}12` }}>Actionable Experiment Suggestions</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.actionable_experiment_suggestions
            .slice()
            .sort((a, b) => b.priority_score - a.priority_score)
            .map((exp, i) => (
              <div
                key={i}
                className="p-5 bg-white rounded-lg"
                style={{ borderLeft: `4px solid ${COLOR}`, boxShadow: `inset 0 1px 0 ${COLOR}55, inset 0 -1px 0 ${COLOR}55` }}
              >
                <div className="flex items-start mb-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{exp.title}</h3>
                </div>
                <p className="text-xs text-textTertiary italic mb-3">"{exp.hypothesis}"</p>
                <div className="space-y-2 text-xs text-textSecondary">
                  <div>
                    <span className="font-semibold text-textTertiary uppercase">Datasets: </span>
                    {exp.datasets.join(', ')}
                  </div>
                  <div>
                    <span className="font-semibold text-textTertiary uppercase">Methods: </span>
                    {exp.methods.join(', ')}
                  </div>
                  <div>
                    <span className="font-semibold text-textTertiary uppercase">Expected: </span>
                    {exp.expected_outcome}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </span>
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
