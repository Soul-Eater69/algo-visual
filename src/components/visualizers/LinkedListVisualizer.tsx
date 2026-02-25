'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { LinkedListState, LinkedListPointer } from '@/types';

interface LinkedListVisualizerProps {
  state: LinkedListState;
  stepNumber: number;
}

const POINTER_COLORS: Record<string, string> = {
  head:    '#22d3ee',
  curr:    '#ec4899',
  current: '#ec4899',
  prev:    '#a855f7',
  slow:    '#f97316',
  fast:    '#22c55e',
  p1:      '#ec4899',
  p2:      '#22d3ee',
  l:       '#ec4899',
  r:       '#22d3ee',
  default: '#f59e0b',
};

function pointerColor(p: LinkedListPointer): string {
  if (p.color) return p.color;
  return POINTER_COLORS[p.name.toLowerCase()] ?? POINTER_COLORS.default;
}

export default function LinkedListVisualizer({ state, stepNumber }: LinkedListVisualizerProps) {
  const { nodes, pointers = [], highlightedEdge } = state;

  if (!nodes?.length) {
    return <div className="flex items-center justify-center p-8 text-slate-500 text-sm">Empty list</div>;
  }

  // Build a map: nodeId → pointers on that node
  const ptrMap = new Map<string, LinkedListPointer[]>();
  for (const p of pointers) {
    if (!ptrMap.has(p.nodeId)) ptrMap.set(p.nodeId, []);
    ptrMap.get(p.nodeId)!.push(p);
  }

  // Unique pointer names for the legend
  const uniqueNames = [...new Set(pointers.map(p => p.name))];

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full select-none">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-cyan-500" />
        <span className="text-sm text-slate-400">Linked List</span>
      </div>

      {/* Scrollable nodes row */}
      <div className="overflow-x-auto w-full flex justify-center">
        <div className="flex items-end gap-0 flex-nowrap px-4">

          {nodes.map((node, i) => {
            const ptrsHere = ptrMap.get(node.id) ?? [];
            const isLast = i === nodes.length - 1;
            const edgeHighlighted =
              highlightedEdge?.[0] === node.id;
            const dominantColor =
              ptrsHere.length > 0
                ? pointerColor(ptrsHere[0])
                : node.highlighted
                ? '#22d3ee'
                : null;

            return (
              <motion.div
                key={`${node.id}-${stepNumber}`}
                className="flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
              >
                {/* Node column (pointer labels + box + index) */}
                <div className="flex flex-col items-center">

                  {/* Pointer labels above */}
                  <div className="min-h-[52px] flex flex-col items-center justify-end gap-0.5 mb-1">
                    <AnimatePresence>
                      {ptrsHere.map(p => {
                        const col = pointerColor(p);
                        return (
                          <motion.div
                            key={p.name}
                            initial={{ y: -6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -6, opacity: 0 }}
                            className="flex flex-col items-center"
                          >
                            <motion.div
                              className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                              style={{
                                color: col,
                                background: `${col}20`,
                                border: `1px solid ${col}50`,
                              }}
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              {p.name}
                            </motion.div>
                            <div style={{ color: col }} className="text-xs leading-none mt-0.5">↓</div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Node box: [value | →] */}
                  <motion.div
                    className="flex rounded-xl border-2 overflow-hidden"
                    animate={{
                      boxShadow: dominantColor
                        ? `0 0 18px ${dominantColor}55`
                        : 'none',
                      scale: ptrsHere.length > 0 ? 1.06 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                      borderColor: dominantColor ?? '#1e293b',
                      background: dominantColor
                        ? `${dominantColor}18`
                        : 'rgba(15,23,42,0.85)',
                    }}
                  >
                    {/* Value cell */}
                    <div
                      className="px-4 py-3 font-mono font-bold text-sm min-w-[44px] flex items-center justify-center border-r"
                      style={{
                        color: dominantColor ?? '#94a3b8',
                        borderColor: dominantColor ? `${dominantColor}30` : '#1e293b',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${stepNumber}-${node.id}-${String(node.value)}`}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {String(node.value)}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    {/* Next pointer field */}
                    <div className="px-2 py-3 font-mono text-[11px] text-slate-500 flex items-center">
                      next
                    </div>
                  </motion.div>

                  {/* Index label */}
                  <div className="text-[9px] text-slate-700 font-mono mt-1">{i}</div>
                </div>

                {/* Arrow to next node, or → null at the end */}
                {!isLast ? (
                  <div className="flex items-center px-1" style={{ paddingBottom: '30px' }}>
                    <motion.svg
                      width="36" height="20"
                      viewBox="0 0 36 20"
                      className="overflow-visible"
                    >
                      <motion.line
                        x1="2" y1="10" x2="30" y2="10"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{
                          stroke: edgeHighlighted ? '#ec4899' : '#334155',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.polygon
                        points="30,6 36,10 30,14"
                        animate={{
                          fill: edgeHighlighted ? '#ec4899' : '#334155',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.svg>
                  </div>
                ) : (
                  /* null terminator */
                  <div className="flex items-center gap-1.5 px-2" style={{ paddingBottom: '30px' }}>
                    <svg width="24" height="20" viewBox="0 0 24 20">
                      <line x1="2" y1="10" x2="18" y2="10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                      <polygon points="18,6 24,10 18,14" fill="#1e293b" />
                    </svg>
                    <div className="px-2 py-1 rounded border border-slate-700/40 bg-slate-900/60 text-[10px] font-mono text-slate-600">
                      null
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {uniqueNames.length > 0 && (
        <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
          {uniqueNames.map(name => {
            const p = pointers.find(p => p.name === name)!;
            const col = pointerColor(p);
            return (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: col }} />
                <span style={{ color: col }}>{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
