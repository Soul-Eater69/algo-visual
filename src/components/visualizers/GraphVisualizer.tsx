'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { GraphNodeData, GraphEdgeData } from '@/types';

interface GraphVisualizerProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  stepNumber: number;
}

function getNodeColor(node: GraphNodeData) {
  if (node.current) {
    return { fill: 'rgba(168, 85, 247, 0.5)', stroke: '#a855f7', text: '#e9d5ff', glow: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.9))' };
  }
  if (node.inQueue) {
    return { fill: 'rgba(234, 179, 8, 0.3)', stroke: '#eab308', text: '#fef08a', glow: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))' };
  }
  if (node.visited) {
    return { fill: 'rgba(34, 197, 94, 0.25)', stroke: '#22c55e', text: '#bbf7d0', glow: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))' };
  }
  return { fill: 'rgba(30, 41, 59, 0.9)', stroke: '#334155', text: '#64748b', glow: 'none' };
}

function autoLayout(nodes: GraphNodeData[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = nodes.length;
  const radius = Math.min(160, 40 * n);
  const cx = 250;
  const cy = 200;

  nodes.forEach((node, i) => {
    if (node.x !== undefined && node.y !== undefined) {
      positions.set(node.id, { x: node.x, y: node.y });
    } else {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      positions.set(node.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
  });

  return positions;
}

export default function GraphVisualizer({ nodes, edges, stepNumber }: GraphVisualizerProps) {
  const positions = useMemo(() => autoLayout(nodes), [nodes]);
  const nodeRadius = 26;
  const svgWidth = 500;
  const svgHeight = 400;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-sm text-slate-400">Graph Traversal</span>
      </div>

      <div className="w-full overflow-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
            <marker
              id="arrowhead-highlight"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / dist;
            const uy = dy / dist;

            const startX = from.x + ux * nodeRadius;
            const startY = from.y + uy * nodeRadius;
            const endX = to.x - ux * (nodeRadius + (edge.directed ? 12 : 0));
            const endY = to.y - uy * (nodeRadius + (edge.directed ? 12 : 0));

            return (
              <motion.line
                key={`${stepNumber}-edge-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={edge.highlighted ? '#a855f7' : '#1e293b'}
                strokeWidth={edge.highlighted ? 2.5 : 1.5}
                markerEnd={edge.directed ? (edge.highlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)') : undefined}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              />
            );
          })}

          {/* Edge weights */}
          {edges.map((edge, i) => {
            if (!edge.weight) return null;
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <text key={`weight-${i}`} x={mx} y={my - 8} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">
                {edge.weight}
              </text>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const colors = getNodeColor(node);

            return (
              <motion.g
                key={`${stepNumber}-node-${node.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, delay: i * 0.05 }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                {node.current && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 8}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1"
                    opacity={0.35}
                    animate={{ r: [nodeRadius + 5, nodeRadius + 12, nodeRadius + 5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  style={{ filter: colors.glow }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500" />
          <span>In Queue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/25 border border-green-500" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
}
