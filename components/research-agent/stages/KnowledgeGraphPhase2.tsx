'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ResearchQuery } from '@/utils/types';

interface KnowledgeGraphPhase2Props {
  query: ResearchQuery;
}

const NODE_BG: Record<string, string> = {
  paper: '#E6F1FB',
  method: '#EEEDFE',
  dataset: '#E1F5EE',
  gap: '#FCEBEB',
  experiment: '#EAF3DE',
  contradiction: '#FAEEDA',
};

const NODE_BORDER: Record<string, string> = {
  paper: '#2196F3',
  method: '#9C27B0',
  dataset: '#00897B',
  gap: '#E53935',
  experiment: '#43A047',
  contradiction: '#FF6F00',
};

const NODE_TEXT: Record<string, string> = {
  paper: '#042C53',
  method: '#26215C',
  dataset: '#04342C',
  gap: '#501313',
  experiment: '#173404',
  contradiction: '#412402',
};

const EDGE_COLOR: Record<string, string> = {
  contradicts: '#E53935',
  compares_with: '#E53935',
  has_gap: '#E53935',
  addresses_gap: '#43A047',
  uses_method: '#9C27B0',
  uses_dataset: '#00897B',
  has_contradiction: '#FF6F00',
  requires_dataset: '#00897B',
  agrees_with: '#2196F3',
  replicates: '#43A047',
};

function CircularNode({ data }: { data: any }) {
  const borderColor = NODE_BORDER[data.nodeType] ?? '#888780';
  const bgColor = NODE_BG[data.nodeType] ?? '#F1EFE8';
  const textColor = NODE_TEXT[data.nodeType] ?? '#2C2C2A';

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: bgColor,
        border: `3px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: borderColor,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px',
          textAlign: 'center',
        }}
      >
        {data.nodeType}
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.2,
          wordBreak: 'break-word',
          maxWidth: '90px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as const,
        }}
      >
        {data.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1 }}
      />
    </div>
  );
}

function getCircularLayout(
  nodes: any[],
  edges: any[]
): { nodes: any[]; edges: any[] } {
  const centerX = 500;
  const centerY = 400;

  const byType: Record<string, any[]> = {};
  nodes.forEach((n) => {
    const t = n.data?.nodeType ?? 'unknown';
    if (!byType[t]) byType[t] = [];
    byType[t].push(n);
  });

  const types = Object.keys(byType);
  const typeCount = types.length;

  const positionedNodes = nodes.map((node) => {
    const type = node.data?.nodeType ?? 'unknown';
    const typeIndex = types.indexOf(type);
    const nodesOfType = byType[type];
    const nodeIndex = nodesOfType.findIndex((n: any) => n.id === node.id);

    const typeAngle = (typeIndex / typeCount) * 2 * Math.PI;
    const ringRadius = typeCount <= 2 ? 200 : 300;

    const groupCenterX = centerX + ringRadius * Math.cos(typeAngle);
    const groupCenterY = centerY + ringRadius * Math.sin(typeAngle);

    const spread = nodesOfType.length > 1 ? 110 : 0;
    const nodeAngle =
      nodesOfType.length > 1
        ? (nodeIndex / nodesOfType.length) * 2 * Math.PI
        : 0;

    return {
      ...node,
      position: {
        x: groupCenterX + spread * Math.cos(nodeAngle) - 60,
        y: groupCenterY + spread * Math.sin(nodeAngle) - 60,
      },
    };
  });

  return { nodes: positionedNodes, edges };
}

function toReactFlow(apiNodes: any[], apiEdges: any[]) {
  const rfNodes = apiNodes.map((n) => ({
    id: n.id,
    type: 'circular',
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      nodeType: n.type,
      properties: n.properties ?? {},
    },
  }));

  const rfEdges = apiEdges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: e.relation === 'contradicts' || e.relation === 'compares_with',
    label: e.relation.replace(/_/g, ' '),
    style: {
      stroke: EDGE_COLOR[e.relation] ?? '#888780',
      strokeWidth: 2,
    },
    labelStyle: { fontSize: 9, fill: '#5F5E5A', fontWeight: 500 },
    labelBgStyle: { fill: 'white', opacity: 0.9 },
    labelBgPadding: [4, 4] as [number, number],
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: EDGE_COLOR[e.relation] ?? '#888780',
      width: 15,
      height: 15,
    },
  }));

  return getCircularLayout(rfNodes, rfEdges);
}

interface ReactFlowInnerProps {
  rfNodes: any[];
  rfEdges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeMouseEnter: any;
  onNodeMouseLeave: any;
  hoveredNode: any;
  nodeTypes: any;
}

function ReactFlowInner({
  rfNodes,
  rfEdges,
  onNodesChange,
  onEdgesChange,
  onNodeMouseEnter,
  onNodeMouseLeave,
  hoveredNode,
  nodeTypes,
}: ReactFlowInnerProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
      >
        <Background color="#f0f0f0" gap={20} variant={'dots' as any} />
        <Controls showInteractive={false} />

        {hoveredNode && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              maxWidth: 280,
              fontSize: 12,
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              pointerEvents: 'none',
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {hoveredNode.data?.label}
            </p>
            <p
              style={{
                color: NODE_BORDER[hoveredNode.data?.nodeType] ?? '#888',
                marginBottom: 8,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
              }}
            >
              {hoveredNode.data?.nodeType}
            </p>
            {Object.entries(hoveredNode.data?.properties ?? {}).map(
              ([k, v]) => (
                <div key={k} style={{ marginBottom: 3 }}>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {k.replace(/_/g, ' ')}:
                  </span>{' '}
                  <span style={{ color: '#555' }}>
                    {String(v).slice(0, 100)}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </ReactFlow>

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          gap: 8,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => zoomIn()}
          style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Zoom In
        </button>
        <button
          onClick={() => zoomOut()}
          style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Zoom Out
        </button>
        <button
          onClick={() => fitView({ padding: 0.3 })}
          style={{
            padding: '6px 12px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Fit View
        </button>
      </div>
    </div>
  );
}

export default function KnowledgeGraphPhase2({ query }: KnowledgeGraphPhase2Props) {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ circular: CircularNode }), []);

  useEffect(() => {
    const sessionId = localStorage.getItem('graph_session_id');
    if (!sessionId) {
      setLoading(false);
      setError(true);
      return;
    }
    fetch(`http://localhost:8001/graph/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => {
        setGraphData(data);
        const { nodes, edges } = toReactFlow(data.nodes ?? [], data.edges ?? []);
        setRfNodes(nodes);
        setRfEdges(edges);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  const onNodeMouseEnter = useCallback((_: any, node: any) => {
    setHoveredNode(node);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const totalNodes = graphData?.stats?.total_nodes ?? 0;
  const totalEdges = graphData?.stats?.total_edges ?? 0;
  const nodeTypeStats = graphData?.stats?.node_types ?? {};
  const density =
    totalNodes > 1
      ? Math.round((totalEdges / (totalNodes * (totalNodes - 1))) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={totalNodes.toString()} color="#00897B" />
        <StatCard label="Total Edges" value={totalEdges.toString()} color="#00897B" />
        <StatCard
          label="Node Types"
          value={Object.keys(nodeTypeStats).length.toString()}
          color="#00897B"
        />
        <StatCard label="Graph Density" value={`${density}%`} color="#00897B" />
      </div>

      <div
        className="border-2 border-teal-200 rounded-lg overflow-hidden"
        style={{ height: '600px', position: 'relative' }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full text-sm text-textTertiary">
            Loading knowledge graph...
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-sm text-textTertiary">
              Graph will appear after analysis completes
            </p>
            <p className="text-xs text-textTertiary">
              Make sure graph_api.py is running on port 8001
            </p>
          </div>
        )}

        {!loading && !error && (
          <ReactFlowProvider>
            <ReactFlowInner
              rfNodes={rfNodes}
              rfEdges={rfEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseLeave={onNodeMouseLeave}
              hoveredNode={hoveredNode}
              nodeTypes={nodeTypes}
            />
          </ReactFlowProvider>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Node Types</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(nodeTypeStats).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: NODE_BORDER[type] ?? '#888780' }}
              />
              <span className="text-textSecondary capitalize">{type}</span>
              <span
                className="ml-auto font-semibold"
                style={{ color: NODE_BORDER[type] ?? '#888780' }}
              >
                {count as number}
              </span>
            </div>
          ))}
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
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}