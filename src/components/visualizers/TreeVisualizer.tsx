'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { TreeNodeData } from '@/types';

interface TreeVisualizerProps {
  treeData: TreeNodeData;
  stepNumber: number;
}

interface PositionedNode {
  node: TreeNodeData;
  x: number;
  y: number;
  id: string;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlighted: boolean;
}

function layoutTree(
  node: TreeNodeData,
  depth: number = 0,
  counter: { value: number } = { value: 0 },
  positions: PositionedNode[] = [],
  edges: Edge[] = [],
  parentX?: number,
  parentY?: number
): { positions: PositionedNode[]; edges: Edge[]; width: number } {
  const NODE_H_GAP = 70;
  const NODE_V_GAP = 80;

  const selfX = counter.value * NODE_H_GAP;
  const selfY = depth * NODE_V_GAP;

  positions.push({ node, x: selfX, y: selfY, id: node.id });

  if (parentX !== undefined && parentY !== undefined) {
    edges.push({
      x1: parentX,
      y1: parentY,
      x2: selfX,
      y2: selfY,
      highlighted: node.current || node.highlighted || false,
    });
  }

  counter.value++;

  for (const child of node.children ?? []) {
    layoutTree(child, depth + 1, counter, positions, edges, selfX, selfY);
  }

  return { positions, edges, width: counter.value * NODE_H_GAP };
}

function getNodeColor(node: TreeNodeData): { fill: string; stroke: string; text: string; glow: string } {
  if (node.current) {
    return {
      fill: 'rgba(168, 85, 247, 0.4)',
      stroke: '#a855f7',
      text: '#e9d5ff',
      glow: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.9))',
    };
  }
  if (node.highlighted) {
    return {
      fill: 'rgba(34, 211, 238, 0.3)',
      stroke: '#22d3ee',
      text: '#a5f3fc',
      glow: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.7))',
    };
  }
  if (node.visited) {
    return {
      fill: 'rgba(34, 197, 94, 0.2)',
      stroke: '#22c55e',
      text: '#bbf7d0',
      glow: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))',
    };
  }
  return {
    fill: 'rgba(30, 41, 59, 0.8)',
    stroke: '#334155',
    text: '#94a3b8',
    glow: 'none',
  };
}

export default function TreeVisualizer({ treeData, stepNumber }: TreeVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { positions, edges, width } = layoutTree(treeData, 0, { value: 0 }, [], []);

  const padding = 60;
  const nodeRadius = 24;
  const svgWidth = Math.max(width + padding * 2, 400);
  const maxDepth = Math.max(...positions.map(p => p.y));
  const svgHeight = maxDepth + padding * 2 + nodeRadius * 2;

  // Center the tree
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const treeWidth = maxX - minX;
  const offsetX = (svgWidth - treeWidth) / 2 - minX;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-slate-400">Tree Traversal</span>
      </div>

      <div className="w-full overflow-auto">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={Math.max(svgHeight, 300)}
          className="mx-auto"
          style={{ minWidth: svgWidth }}
        >
          {/* Edges */}
          {edges.map((edge, i) => (
            <motion.line
              key={`${stepNumber}-edge-${i}`}
              x1={edge.x1 + offsetX}
              y1={edge.y1 + padding}
              x2={edge.x2 + offsetX}
              y2={edge.y2 + padding}
              stroke={edge.highlighted ? '#a855f7' : '#1e293b'}
              strokeWidth={edge.highlighted ? 2.5 : 1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}

          {/* Nodes */}
          {positions.map(({ node, x, y, id }, i) => {
            const colors = getNodeColor(node);
            const cx = x + offsetX;
            const cy = y + padding;

            return (
              <motion.g
                key={`${stepNumber}-node-${id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: i * 0.04 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Glow ring for current node */}
                {node.current && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1"
                    opacity={0.4}
                    animate={{ r: [nodeRadius + 4, nodeRadius + 10, nodeRadius + 4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={nodeRadius}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  style={{ filter: colors.glow }}
                />

                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {String(node.value)}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-400" />
          <span>Highlighted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500" />
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
