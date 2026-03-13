'use client';

import React, { useEffect, useRef } from 'react';
import { mockGraphNodes } from '@/utils/mockData';
import { animateCounter, animateFloat } from '@/utils/animations';

export default function KnowledgeGraph() {
  const nodeCountRef = useRef<HTMLSpanElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Animate counter
    if (nodeCountRef.current) {
      animateCounter(nodeCountRef.current, mockGraphNodes.length, 1, 0.3);
    }

    // Float animation on nodes
    nodesRef.current.forEach((ref, index) => {
      if (ref) {
        setTimeout(() => {
          animateFloat(ref, 8);
        }, 100 * (index + 1));
      }
    });
  }, []);

  const displayNodes = mockGraphNodes.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">🕸️</span>
        <span>
          Nodes created: <span ref={nodeCountRef} className="text-teal-500">0</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {displayNodes.map((node, index) => (
          <div
            key={node.id}
            ref={(el) => {
              nodesRef.current[index] = el;
            }}
            className="p-2 bg-white border-2 border-gray-200 rounded-lg text-center"
          >
            <p className="text-xs font-semibold text-foreground">{node.label}</p>
            <p className="text-xs text-textTertiary">{node.category}</p>
          </div>
        ))}
      </div>

      <div className="text-xs text-textTertiary italic">
        Building knowledge graph structure...
      </div>
    </div>
  );
}
