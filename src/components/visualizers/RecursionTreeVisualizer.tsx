'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecursionTreeState, RecursionNode } from '@/types';

interface RecursionTreeVisualizerProps {
  state: RecursionTreeState;
  stepNumber: number;
}

const CELL_W = 24;
const CELL_H = 28;
const NODE_V_PAD = 8;
const NODE_H_PAD = 10;
const V_STRIDE = 100;   // vertical distance between depth levels
const SIBLING_GAP = 14; // horizontal gap between siblings

const PHASE_STYLES = {
  splitting: { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', label: 'split' },
  merging:   { border: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  text: '#c4b5fd', label: 'merge' },
  sorted:    { border: '#22c55e', bg: 'rgba(34,197,94,0.12)',   text: '#86efac', label: 'sorted' },
};

const ACTIVE_STYLE = {
  border: '#22d3ee', bg: 'rgba(34,211,238,0.18)', text: '#67e8f9', glow: '0 0 18px rgba(34,211,238,0.45)',
};

function nodeWidth(node: RecursionNode): number {
  return Math.max((node.array?.length ?? 1) * CELL_W + NODE_H_PAD * 2, 60);
}

function nodeHeight(): number {
  return CELL_H + NODE_V_PAD * 2 + 14; // cells + padding + phase label
}

/** Minimum width needed to lay out this subtree */
function subtreeWidth(node: RecursionNode): number {
  if (!node.children?.length) return nodeWidth(node) + SIBLING_GAP;
  return node.children.reduce((sum, c) => sum + subtreeWidth(c), 0);
}

interface LayoutItem {
  node: RecursionNode;
  cx: number;
  cy: number;
}

function buildLayout(node: RecursionNode, cx: number, depth: number, out: LayoutItem[]) {
  out.push({ node, cx, cy: depth * V_STRIDE + nodeHeight() / 2 });
  if (!node.children?.length) return;

  const childWidths = node.children.map(subtreeWidth);
  const total = childWidths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  for (let i = 0; i < node.children.length; i++) {
    buildLayout(node.children[i], x + childWidths[i] / 2, depth + 1, out);
    x += childWidths[i];
  }
}

interface EdgeData { x1: number; y1: number; x2: number; y2: number; }

function buildEdges(items: LayoutItem[]): EdgeData[] {
  const byId = new Map(items.map(l => [l.node.id, l]));
  const nh = nodeHeight();
  const edges: EdgeData[] = [];
  for (const item of items) {
    for (const child of item.node.children ?? []) {
      const childItem = byId.get(child.id);
      if (childItem) {
        edges.push({
          x1: item.cx,
          y1: item.cy + nh / 2,
          x2: childItem.cx,
          y2: childItem.cy - nh / 2,
        });
      }
    }
  }
  return edges;
}

export default function RecursionTreeVisualizer({ state, stepNumber }: RecursionTreeVisualizerProps) {
  if (!state?.root) {
    return <div className="flex items-center justify-center p-8 text-slate-500 text-sm">No recursion data</div>;
  }

  const items: LayoutItem[] = [];
  buildLayout(state.root, 0, 0, items);

  if (items.length === 0) {
    return <div className="flex items-center justify-center p-8 text-slate-500 text-sm">Empty tree</div>;
  }

  const nh = nodeHeight();
  const margin = 24;
  const minX = Math.min(...items.map(l => l.cx - nodeWidth(l.node) / 2)) - margin;
  const maxX = Math.max(...items.map(l => l.cx + nodeWidth(l.node) / 2)) + margin;
  const maxY = Math.max(...items.map(l => l.cy + nh / 2)) + margin;

  const svgW = maxX - minX;
  const svgH = maxY;

  // Shift all items so minX becomes 0
  const shifted = items.map(l => ({ ...l, cx: l.cx - minX }));
  const edges = buildEdges(shifted);

  return (
    <div className="flex flex-col items-center gap-4 w-full p-4 select-none">
      {/* Phase banner */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
        state.phase === 'dividing'
          ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
          : 'text-purple-400 border-purple-500/40 bg-purple-500/10'
      }`}>
        <span>{state.phase === 'dividing' ? '÷' : '+'}</span>
        <span>{state.phase === 'dividing' ? 'Dividing' : 'Merging'}</span>
      </div>

      {/* Scrollable tree canvas */}
      <div className="overflow-x-auto w-full">
        <div className="relative mx-auto" style={{ width: Math.max(svgW, 200), height: svgH }}>
          {/* SVG edges */}
          <svg
            width={svgW}
            height={svgH}
            className="absolute inset-0 pointer-events-none"
          >
            {edges.map((e, i) => (
              <motion.line
                key={`${stepNumber}-e${i}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="rgba(100,116,139,0.45)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
              />
            ))}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {shifted.map(({ node, cx, cy }) => {
              const nw = nodeWidth(node);
              const s = node.current ? ACTIVE_STYLE : (PHASE_STYLES[node.phase] ?? PHASE_STYLES.splitting);
              const glow = node.current ? (ACTIVE_STYLE as typeof ACTIVE_STYLE & { glow?: string }).glow : undefined;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: cx - nw / 2,
                    top: cy - nh / 2,
                    width: nw,
                  }}
                >
                  {/* Array cells */}
                  <div
                    className="flex gap-0.5 rounded-lg border"
                    style={{
                      padding: `${NODE_V_PAD}px ${NODE_H_PAD}px`,
                      background: s.bg,
                      borderColor: s.border,
                      boxShadow: glow ?? 'none',
                    }}
                  >
                    {(node.array ?? []).map((val, i) => (
                      <motion.div
                        key={`${node.id}-${i}`}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-center rounded text-[11px] font-mono font-bold"
                        style={{
                          width: CELL_W - 2,
                          height: CELL_H,
                          background: 'rgba(15,23,42,0.7)',
                          color: s.text,
                          border: `1px solid ${s.border}55`,
                        }}
                      >
                        {String(val)}
                      </motion.div>
                    ))}
                  </div>

                  {/* Phase label */}
                  <div
                    className="text-[9px] font-mono mt-1 opacity-60"
                    style={{ color: s.text }}
                  >
                    {PHASE_STYLES[node.phase]?.label ?? node.phase}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
        {[
          { color: '#22d3ee', bg: 'rgba(34,211,238,0.18)', label: 'Current' },
          { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Splitting' },
          { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Merging' },
          { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'Sorted' },
        ].map(({ color, bg, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border" style={{ borderColor: color, background: bg }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
