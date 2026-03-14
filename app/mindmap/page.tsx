'use client'

import React, { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Color mapping per node type
const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  problem:    { bg: '#FCEBEB', border: '#E53935', text: '#501313' },
  method:     { bg: '#EEEDFE', border: '#9C27B0', text: '#26215C' },
  component:  { bg: '#F3E5F5', border: '#7B1FA2', text: '#2E0048' },
  finding:    { bg: '#EAF3DE', border: '#43A047', text: '#173404' },
  dataset:    { bg: '#E1F5EE', border: '#00897B', text: '#04342C' },
  limitation: { bg: '#FAEEDA', border: '#FF6F00', text: '#412402' },
  detail:     { bg: '#F1EFE8', border: '#888780', text: '#2C2C2A' },
  root:       { bg: '#E6F1FB', border: '#2196F3', text: '#042C53' },
}

// Custom circular node component
function MindmapNode({ data }: { data: any }) {
  const colors = NODE_COLORS[data.nodeType] ?? NODE_COLORS.detail
  const isRoot = data.nodeType === 'root'

  return (
    <div style={{
      width: isRoot ? 160 : 130,
      height: isRoot ? 160 : 130,
      borderRadius: '50%',
      background: colors.bg,
      border: `${isRoot ? 4 : 3}px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      cursor: 'pointer',
      boxShadow: isRoot
        ? `0 4px 16px ${colors.border}40`
        : '0 2px 8px rgba(0,0,0,0.12)',
      boxSizing: 'border-box' as const,
    }}>
      <div style={{
        fontSize: isRoot ? '10px' : '8px',
        fontWeight: 700,
        color: colors.border,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        marginBottom: '4px',
        textAlign: 'center' as const,
      }}>
        {data.nodeType}
      </div>
      <div style={{
        fontSize: isRoot ? '12px' : '10px',
        fontWeight: isRoot ? 700 : 600,
        color: colors.text,
        textAlign: 'center' as const,
        lineHeight: 1.2,
        wordBreak: 'break-word' as const,
        maxWidth: isRoot ? '130px' : '100px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical' as const,
      }}>
        {data.label}
      </div>
      <Handle type="target" position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  )
}

// Radial layout: root in center, children in ring, grandchildren in outer ring
function buildRadialLayout(mindmap: any) {
  const nodes: any[] = []
  const edges: any[] = []

  const cx = 600
  const cy = 450

  // Root node in center
  nodes.push({
    id: 'root',
    type: 'mindmap',
    position: { x: cx - 80, y: cy - 80 },
    data: { label: mindmap.root, nodeType: 'root' },
  })

  const children = mindmap.children ?? []
  const childCount = children.length

  children.forEach((child: any, i: number) => {
    // Place children evenly around the root in a circle
    const angle = (i / childCount) * 2 * Math.PI - Math.PI / 2
    const radius = 280
    const cx2 = cx + radius * Math.cos(angle)
    const cy2 = cy + radius * Math.sin(angle)

    nodes.push({
      id: child.id,
      type: 'mindmap',
      position: { x: cx2 - 65, y: cy2 - 65 },
      data: { label: child.label, nodeType: child.type },
    })

    // Edge from root to child
    edges.push({
      id: `root-${child.id}`,
      source: 'root',
      target: child.id,
      type: 'smoothstep',
      style: {
        stroke: NODE_COLORS[child.type]?.border ?? '#888780',
        strokeWidth: 2,
      },
    })

    const grandchildren = child.children ?? []
    const gcCount = grandchildren.length

    grandchildren.forEach((gc: any, j: number) => {
      // Spread grandchildren in a small arc around their parent
      const spreadAngle = gcCount > 1
        ? angle - 0.4 + (j / (gcCount - 1)) * 0.8
        : angle
      const gcRadius = 200
      const gcx = cx2 + gcRadius * Math.cos(spreadAngle)
      const gcy = cy2 + gcRadius * Math.sin(spreadAngle)

      nodes.push({
        id: gc.id,
        type: 'mindmap',
        position: { x: gcx - 65, y: gcy - 65 },
        data: { label: gc.label, nodeType: gc.type },
      })

      // Edge from child to grandchild
      edges.push({
        id: `${child.id}-${gc.id}`,
        source: child.id,
        target: gc.id,
        type: 'smoothstep',
        style: {
          stroke: NODE_COLORS[gc.type]?.border ?? '#888780',
          strokeWidth: 1.5,
          opacity: 0.7,
        },
      })
    })
  })

  return { nodes, edges }
}

// Inner component that uses useReactFlow hook
function MindmapInner({
  rfNodes, rfEdges, onNodesChange, onEdgesChange, nodeTypes
}: any) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      >
        <Background color="#f5f5f5" gap={24} variant={"dots" as any} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', gap: 8, zIndex: 10,
      }}>
        {[
          { label: 'Zoom In', action: () => zoomIn() },
          { label: 'Zoom Out', action: () => zoomOut() },
          { label: 'Fit View', action: () => fitView({ padding: 0.2 }) },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            padding: '6px 14px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Main page component
export default function MindmapPage() {
  const [mindmap, setMindmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([])

  const nodeTypes = React.useMemo(() => ({ mindmap: MindmapNode }), [])

  useEffect(() => {
    // Read paper and session data from localStorage
    const sessionId = localStorage.getItem('mindmap_session_id')
    const paperRaw = localStorage.getItem('mindmap_paper')

    if (!sessionId || !paperRaw) {
      setError('No paper data found. Please click View Mindmap from a paper card.')
      setLoading(false)
      return
    }

    let paper: any
    try {
      paper = JSON.parse(paperRaw)
    } catch {
      setError('Invalid paper data in storage.')
      setLoading(false)
      return
    }

    // Call mindmap API
    fetch('http://localhost:8002/mindmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, paper }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`)
        return r.json()
      })
      .then(data => {
        setMindmap(data)
        const { nodes, edges } = buildRadialLayout(data)
        setRfNodes(nodes)
        setRfEdges(edges)
        setLoading(false)
      })
      .catch(err => {
        setError(`Failed to generate mindmap: ${err.message}`)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={() => window.close()}
          style={{
            padding: '6px 14px',
            background: '#F3F4F6',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Close
        </button>
        <div>
          <h1 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1A1A2E',
            margin: 0,
          }}>
            {mindmap?.title ?? 'Paper Mindmap'}
          </h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            Visual summary of research paper structure
          </p>
        </div>

        {/* Legend */}
        {mindmap && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap' as const,
          }}>
            {Object.entries(NODE_COLORS)
              .filter(([type]) => type !== 'root')
              .map(([type, colors]) => (
                <div key={type} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                  }} />
                  <span style={{ color: '#555', textTransform: 'capitalize' }}>
                    {type}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, position: 'relative' }}>

        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            gap: 12,
          }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: '#888', fontSize: 14 }}>
              Generating mindmap...
            </p>
            <p style={{ color: '#aaa', fontSize: 12 }}>
              This may take 10-30 seconds
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            gap: 8,
          }}>
            <p style={{ color: '#E53935', fontSize: 14, fontWeight: 600 }}>
              {error}
            </p>
            <p style={{ color: '#888', fontSize: 12 }}>
              Make sure mindmap_api.py is running on port 8002
            </p>
          </div>
        )}

        {!loading && !error && mindmap && (
          <div style={{ height: 'calc(100vh - 73px)' }}>
            <ReactFlowProvider>
              <MindmapInner
                rfNodes={rfNodes}
                rfEdges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
              />
            </ReactFlowProvider>
          </div>
        )}
      </div>
    </div>
  )
}
