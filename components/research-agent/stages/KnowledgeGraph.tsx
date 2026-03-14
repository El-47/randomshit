'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animateCounter, animateFloat } from '@/utils/animations';
import { buildGraph, GraphData } from '@/utils/graphPipeline';
import { CrawlApiResponse, ResearchQuery } from '@/utils/types';

interface KnowledgeGraphProps {
  query?: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

export default function KnowledgeGraph({
  apiData,
  isLoading = false,
}: KnowledgeGraphProps) {
  const nodeCountRef = useRef<HTMLSpanElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiData || isLoading) {
      // No data — run animations with zero values
      if (nodeCountRef.current) {
        animateCounter(nodeCountRef.current, 0, 1, 0.3);
      }
      nodesRef.current.forEach((ref, index) => {
        if (ref) {
          setTimeout(() => animateFloat(ref, 8), 100 * (index + 1));
        }
      });
      return;
    }

    setLoading(true);

    // Read council data from localStorage (stored by AgentCouncilPhase2)
    let councilData: Record<string, any> = {};
    try {
      const raw = localStorage.getItem('agent-council-data');
      if (raw) councilData = JSON.parse(raw);
    } catch {
      // Ignore parse errors
    }

    // Build graph client-side
    try {
      const graph = buildGraph(apiData, councilData);
      setGraphData(graph);
      setLoading(false);

      // Animate counter
      if (nodeCountRef.current) {
        animateCounter(nodeCountRef.current, graph.stats.total_nodes, 1, 0.3);
      }

      // Float animation on nodes
      setTimeout(() => {
        nodesRef.current.forEach((ref, index) => {
          if (ref) {
            setTimeout(() => animateFloat(ref, 8), 100 * (index + 1));
          }
        });
      }, 50);
    } catch {
      setLoading(false);
    }
  }, [apiData, isLoading]);

  const displayNodes = (graphData?.nodes ?? []).slice(0, 6);
  const nodeCount = graphData?.stats?.total_nodes ?? 0;

  const typeColors: Record<string, string> = {
    paper: '#2196F3',
    method: '#9C27B0',
    dataset: '#00897B',
    gap: '#E53935',
    experiment: '#43A047',
    contradiction: '#FF6F00',
  };

  const typeEmojis: Record<string, string> = {
    paper: '📄',
    method: '🔧',
    dataset: '📊',
    gap: '🔍',
    experiment: '🧪',
    contradiction: '⚡',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">🕸️</span>
        <span>
          Nodes created:{' '}
          <span ref={nodeCountRef} className="text-teal-500">
            0
          </span>
        </span>
      </div>

      {/* Node Type Summary */}
      {graphData && (
        <div className="flex flex-wrap gap-2 mb-2">
          {Object.entries(graphData.stats.node_types).map(([type, count]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${typeColors[type] ?? '#888'}15`,
                color: typeColors[type] ?? '#888',
                border: `1px solid ${typeColors[type] ?? '#888'}40`,
              }}
            >
              {typeEmojis[type] ?? '●'} {type}: {count as number}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-2 bg-gray-200 border-2 border-gray-200 rounded-lg text-center animate-pulse"
                style={{ minHeight: 48 }}
              />
            ))
          : displayNodes.map((node, index) => (
              <div
                key={node.id}
                ref={(el) => {
                  nodesRef.current[index] = el;
                }}
                className="p-2 border-2 rounded-lg text-center"
                style={{
                  backgroundColor: `${typeColors[node.type] ?? '#888'}10`,
                  borderColor: `${typeColors[node.type] ?? '#888'}40`,
                }}
              >
                <p className="text-xs font-semibold text-foreground truncate">
                  {typeEmojis[node.type] ?? ''} {node.label}
                </p>
                <p
                  className="text-xs capitalize"
                  style={{ color: typeColors[node.type] ?? '#888' }}
                >
                  {node.type}
                </p>
              </div>
            ))}
      </div>

      {nodeCount > 6 && (
        <p className="text-xs text-textTertiary italic">
          + {nodeCount - 6} more nodes in the full graph view →
        </p>
      )}

      <div className="text-xs text-textTertiary italic">
        {loading
          ? 'Building knowledge graph structure...'
          : graphData
            ? `Graph built: ${graphData.stats.total_nodes} nodes, ${graphData.stats.total_edges} edges`
            : 'Waiting for analysis data...'}
      </div>
    </div>
  );
}
