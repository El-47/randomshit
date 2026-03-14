'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animateCounter, animateFloat } from '@/utils/animations';

interface KnowledgeGraphProps {
  nlpData?: Record<string, any>;
  councilData?: Record<string, any>;
}

export default function KnowledgeGraph({ nlpData, councilData }: KnowledgeGraphProps) {
  const nodeCountRef = useRef<HTMLSpanElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nlpData && councilData) {
      setLoading(true);
      const session_id = 'graph_' + Date.now();
      localStorage.setItem('graph_session_id', session_id);
      fetch('http://localhost:8001/graph/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, nlp: nlpData, council: councilData }),
      })
        .then((r) => r.json())
        .then((data) => {
          setGraphNodes(data.nodes ?? []);
          setNodeCount(data.stats?.total_nodes ?? 0);
          setLoading(false);
          if (nodeCountRef.current) {
            animateCounter(nodeCountRef.current, data.stats?.total_nodes ?? 0, 1, 0.3);
          }
          nodesRef.current.forEach((ref, index) => {
            if (ref) setTimeout(() => animateFloat(ref, 8), 100 * (index + 1));
          });
        })
        .catch(() => {
          setLoading(false);
          setNodeCount(0);
        });
    } else {
      if (nodeCountRef.current) animateCounter(nodeCountRef.current, 0, 1, 0.3);
    }
  }, [nlpData, councilData]);

  const displayNodes = graphNodes.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">🕸️</span>
        <span>
          Nodes created: <span ref={nodeCountRef} className="text-teal-500">0</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-2 bg-white border-2 border-gray-200 rounded-lg text-center animate-pulse"
              >
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ))
          : displayNodes.map((node, index) => (
              <div
                key={node.id}
                ref={(el) => {
                  nodesRef.current[index] = el;
                }}
                className="p-2 bg-white border-2 border-gray-200 rounded-lg text-center"
              >
                <p className="text-xs font-semibold text-foreground">{node.label}</p>
                <p className="text-xs text-textTertiary">{node.type}</p>
              </div>
            ))}
      </div>

      <div className="text-xs text-textTertiary italic">
        Building knowledge graph structure...
      </div>
    </div>
  );
}