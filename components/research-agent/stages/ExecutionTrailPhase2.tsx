'use client';

import React, { useState } from 'react';
import { ResearchQuery } from '@/utils/types';
import { mockExecutionEvents } from '@/utils/mockData';
import { STAGE_COLORS } from '@/utils/colors';

interface ExecutionTrailPhase2Props {
  query: ResearchQuery;
}

type StageFilter = 'all' | 'crawler' | 'nlp' | 'agents' | 'graph' | 'rag' | 'report' | 'trail';

export default function ExecutionTrailPhase2({ query }: ExecutionTrailPhase2Props) {
  const [activeFilter, setActiveFilter] = useState<StageFilter>('all');

  const filteredEvents =
    activeFilter === 'all' ? mockExecutionEvents : mockExecutionEvents.filter((e) => e.stage === activeFilter);

  const stageCounts = {
    crawler: mockExecutionEvents.filter((e) => e.stage === 'crawler').length,
    nlp: mockExecutionEvents.filter((e) => e.stage === 'nlp').length,
    agents: mockExecutionEvents.filter((e) => e.stage === 'agents').length,
    graph: mockExecutionEvents.filter((e) => e.stage === 'graph').length,
    rag: mockExecutionEvents.filter((e) => e.stage === 'rag').length,
    report: mockExecutionEvents.filter((e) => e.stage === 'report').length,
    trail: mockExecutionEvents.filter((e) => e.stage === 'trail').length,
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Events" value={mockExecutionEvents.length.toString()} color="#546E7A" />
        <StatCard label="Total Duration" value="31s" color="#546E7A" />
        <StatCard label="Success Rate" value="100%" color="#546E7A" />
        <StatCard label="Avg Speed" value="~2s/step" color="#546E7A" />
      </div>

      {/* Filter Chips */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Filter by Stage</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All Events"
            count={mockExecutionEvents.length}
            isActive={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            color="#546E7A"
          />
          {Object.entries(stageCounts).map(([stage, count]) => (
            <FilterChip
              key={stage}
              label={stage.charAt(0).toUpperCase() + stage.slice(1)}
              count={count}
              isActive={activeFilter === stage}
              onClick={() => setActiveFilter(stage as StageFilter)}
              color={STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#546E7A'}
            />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredEvents.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isFirst={index === 0}
            isLast={index === filteredEvents.length - 1}
          />
        ))}
      </div>

      {/* Statistics */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-foreground mb-3">Stage Breakdown</p>
        <div className="space-y-2">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <div key={stage} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#546E7A' }}
                />
                <span className="capitalize text-textSecondary">{stage}</span>
              </span>
              <span className="font-medium text-foreground">{count} events</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({
  event,
  isFirst,
  isLast,
}: {
  event: (typeof mockExecutionEvents)[0];
  isFirst: boolean;
  isLast: boolean;
}) {
  const stageColor = STAGE_COLORS[event.stage];

  return (
    <div className="flex gap-4">
      {/* Timeline Connector */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: stageColor, backgroundColor: event.status === 'complete' ? stageColor : 'white' }}
        >
          {event.status === 'complete' && <span className="text-xs text-white font-bold">✓</span>}
        </div>

        {/* Vertical Line */}
        {!isLast && (
          <div
            className="flex-1 w-1 my-2"
            style={{ backgroundColor: stageColor, minHeight: '32px' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="pt-0.5">
          <h4 className="font-semibold text-foreground">{event.title}</h4>
          <p className="text-xs text-textSecondary mt-1">{event.details}</p>

          <div className="flex items-center gap-4 mt-2 text-xs">
            <span
              className="px-2 py-1 rounded text-white"
              style={{ backgroundColor: stageColor }}
            >
              {event.stage}
            </span>
            <span className="text-textTertiary">{(event.timestamp / 1000).toFixed(1)}s</span>
            <span className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: event.status === 'complete' ? '#4CAF50' : '#FF9800' }}
              />
              <span className="capitalize">{event.status}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  isActive,
  onClick,
  color,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-full text-xs font-medium transition-colors
        ${isActive
          ? 'text-white'
          : 'bg-white border border-gray-300 text-foreground hover:border-gray-400'
        }
      `}
      style={isActive ? { backgroundColor: color } : {}}
    >
      {label} ({count})
    </button>
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
