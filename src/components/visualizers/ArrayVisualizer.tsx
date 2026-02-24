'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayState } from '@/types';

interface ArrayVisualizerProps {
  state: ArrayState;
  stepNumber: number;
  mode?: 'array' | 'two-pointers' | 'sliding-window' | 'binary-search';
}

const POINTER_COLORS: Record<string, string> = {
  left: '#ec4899',
  right: '#22d3ee',
  mid: '#a855f7',
  slow: '#f97316',
  fast: '#22c55e',
  i: '#ec4899',
  j: '#22d3ee',
  start: '#ec4899',
  end: '#22d3ee',
  default: '#a855f7',
};

function getPointerColor(name: string, provided?: string): string {
  if (provided) return provided;
  const lname = name.toLowerCase();
  return POINTER_COLORS[lname] ?? POINTER_COLORS.default;
}

function getCellStyle(
  index: number,
  state: ArrayState
): { bg: string; border: string; text: string; glow?: string } {
  const { highlighted = [], window, comparing = [], swapping, sorted = [], pointers = [] } = state;

  if (swapping && (swapping[0] === index || swapping[1] === index)) {
    return { bg: 'rgba(234, 179, 8, 0.4)', border: '#eab308', text: '#fef08a', glow: '0 0 15px rgba(234, 179, 8, 0.7)' };
  }
  if (comparing.includes(index)) {
    return { bg: 'rgba(168, 85, 247, 0.3)', border: '#a855f7', text: '#e9d5ff', glow: '0 0 12px rgba(168, 85, 247, 0.6)' };
  }
  if (window && index >= window[0] && index <= window[1]) {
    return { bg: 'rgba(34, 211, 238, 0.2)', border: '#22d3ee', text: '#a5f3fc', glow: '0 0 10px rgba(34, 211, 238, 0.4)' };
  }
  if (highlighted.includes(index)) {
    return { bg: 'rgba(34, 197, 94, 0.25)', border: '#22c55e', text: '#bbf7d0', glow: '0 0 8px rgba(34, 197, 94, 0.4)' };
  }
  if (sorted.includes(index)) {
    return { bg: 'rgba(34, 197, 94, 0.15)', border: '#166534', text: '#86efac' };
  }

  // Pointer cell check
  const isPointerCell = pointers.some(p => p.index === index);
  if (isPointerCell) {
    return { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', text: '#fbcfe8' };
  }

  return { bg: 'rgba(15, 23, 42, 0.7)', border: '#1e293b', text: '#64748b' };
}

export default function ArrayVisualizer({ state, stepNumber, mode = 'array' }: ArrayVisualizerProps) {
  const { array = [], pointers = [], window } = state;

  if (array.length === 0) {
    return <div className="flex items-center justify-center p-8 text-slate-500 text-sm">Empty array</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 p-6 w-full">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="text-sm text-slate-400">
          {mode === 'sliding-window' ? 'Sliding Window' : mode === 'two-pointers' ? 'Two Pointers' : mode === 'binary-search' ? 'Binary Search' : 'Array'}
        </span>
      </div>

      {/* Sliding window range indicator */}
      {window && (
        <div className="text-xs text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/30 rounded-md px-3 py-1.5">
          Window: [{window[0]}...{window[1]}] — length {window[1] - window[0] + 1}
        </div>
      )}

      {/* Array cells */}
      <div className="flex gap-2 items-end flex-wrap justify-center relative">
        {/* Sliding window bracket */}
        {window && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {array.map((val, i) => {
          const cellStyle = getCellStyle(i, state);
          const pointerHere = pointers.filter(p => p.index === i);
          const barHeight = typeof val === 'number' ? Math.max(20, Math.min(80, Math.abs(val) * 8)) : 40;

          return (
            <motion.div
              key={`arr-${stepNumber}-${i}`}
              className="flex flex-col items-center gap-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
            >
              {/* Pointer labels above */}
              <div className="flex flex-col items-center gap-0.5 min-h-[28px] justify-end">
                {pointerHere.map(p => (
                  <motion.div
                    key={p.name}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                    style={{
                      color: getPointerColor(p.name, p.color),
                      background: `${getPointerColor(p.name, p.color)}20`,
                      border: `1px solid ${getPointerColor(p.name, p.color)}50`,
                    }}
                  >
                    {p.name}
                  </motion.div>
                ))}
              </div>

              {/* Pointer arrow */}
              {pointerHere.length > 0 && (
                <motion.div
                  className="text-lg"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ color: getPointerColor(pointerHere[0].name, pointerHere[0].color) }}
                >
                  ↓
                </motion.div>
              )}

              {/* Cell */}
              <motion.div
                animate={{
                  boxShadow: cellStyle.glow ?? 'none',
                  scale: pointerHere.length > 0 ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm font-bold border-2 transition-colors"
                style={{
                  background: cellStyle.bg,
                  borderColor: cellStyle.border,
                  color: cellStyle.text,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${stepNumber}-${i}-${String(val)}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {val === null || val === undefined ? '∅' : String(val)}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* Index */}
              <div className="text-[10px] text-slate-600 font-mono">{i}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 justify-center">
        {window && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-cyan-500/20 border border-cyan-400" />
            <span>Window</span>
          </div>
        )}
        {state.comparing && state.comparing.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400" />
            <span>Comparing</span>
          </div>
        )}
        {state.swapping && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/40 border border-yellow-500" />
            <span>Swapping</span>
          </div>
        )}
        {state.highlighted && state.highlighted.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/25 border border-green-500" />
            <span>Highlighted</span>
          </div>
        )}
        {pointers.map(p => (
          <div key={p.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: getPointerColor(p.name, p.color) }}
            />
            <span style={{ color: getPointerColor(p.name, p.color) }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
