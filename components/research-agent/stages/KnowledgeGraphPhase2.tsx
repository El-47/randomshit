'use client';

import React, { useState } from 'react';
import { ResearchQuery } from '@/utils/types';
import { mockGraphNodes } from '@/utils/mockData';

interface KnowledgeGraphPhase2Props {
  query: ResearchQuery;
}

export default function KnowledgeGraphPhase2({ query }: KnowledgeGraphPhase2Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const categories = Array.from(new Set(mockGraphNodes.map((n) => n.category)));
  const categoryColors: Record<string, string> = {
    Architecture: '#00897B',
    Mechanism: '#4DB6AC',
    Model: '#80CBC4',
    Technique: '#B2DFDB',
    Paradigm: '#00897B',
    System: '#00897B',
    Capability: '#4DB6AC',
    Task: '#80CBC4',
    Representation: '#B2DFDB',
    Field: '#00897B',
  };

  const selectedNodeData = selectedNode ? mockGraphNodes.find((n) => n.id === selectedNode) : null;

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={mockGraphNodes.length.toString()} color="#00897B" />
        <StatCard label="Total Connections" value="28" color="#00897B" />
        <StatCard label="Categories" value={categories.length.toString()} color="#00897B" />
        <StatCard label="Graph Density" value="42%" color="#00897B" />
      </div>

      {/* Graph Visualization Container */}
      <div className="p-6 bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-lg min-h-96">
        <p className="text-sm text-textTertiary mb-4">Interactive Knowledge Graph</p>

        {/* Static Graph Representation (simplified grid) */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {mockGraphNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`
                p-3 rounded-lg border-2 cursor-pointer transition-all
                ${selectedNode === node.id
                  ? 'border-teal-500 bg-white shadow-lg'
                  : 'border-teal-200 bg-white hover:border-teal-400'
                }
              `}
            >
              <p className="font-semibold text-sm text-foreground">{node.label}</p>
              <p className="text-xs text-textTertiary">{node.category}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {node.connections.slice(0, 2).map((conn) => (
                  <span key={conn} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                    {conn}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Node Details Panel */}
        {selectedNodeData && (
          <div className="p-4 bg-white border border-teal-200 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">{selectedNodeData.label}</h3>
            <p className="text-sm text-textSecondary mb-3">{selectedNodeData.description}</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-textTertiary mb-2">Connections ({selectedNodeData.connections.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedNodeData.connections.map((conn) => (
                  <span key={conn} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                    {conn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Categories</p>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColors[category] || '#00897B' }}
              />
              <span className="text-textSecondary">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-foreground hover:bg-gray-50">
          Zoom In
        </button>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-foreground hover:bg-gray-50">
          Zoom Out
        </button>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-foreground hover:bg-gray-50">
          Reset View
        </button>
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
