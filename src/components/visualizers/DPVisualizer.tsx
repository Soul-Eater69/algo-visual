'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { DPState } from '@/types';

interface DPVisualizerProps {
  state: DPState;
  stepNumber: number;
}

function getCell1D(table: (number | string | null)[][], col: number) {
  return table[0]?.[col];
}

export default function DPVisualizer({ state, stepNumber }: DPVisualizerProps) {
  const { table, currentCell, dimension, headers, dependencies } = state;

  const isCurrentCell = (r: number, c: number) =>
    currentCell?.[0] === r && currentCell?.[1] === c;

  const isDependency = (r: number, c: number) =>
    dependencies?.some(([dr, dc]) => dr === r && dc === c) ?? false;

  const isFilled = (val: number | string | null) =>
    val !== null && val !== undefined && val !== '';

  if (dimension === '1d') {
    const row = table[0] ?? [];
    return (
      <div className="flex flex-col items-center gap-6 p-6 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-sm text-slate-400">DP Table (1D)</span>
        </div>

        {/* Column headers */}
        {headers?.cols && (
          <div className="flex gap-1 items-center">
            <div className="w-10" />
            {headers.cols.map((h, i) => (
              <div key={i} className="w-12 text-center text-xs text-slate-500 font-mono">
                {h}
              </div>
            ))}
          </div>
        )}

        {/* 1D Array cells */}
        <div className="flex gap-1 items-center flex-wrap justify-center">
          {row.map((val, i) => {
            const isCurrent = currentCell?.[1] === i || (currentCell?.[0] === 0 && currentCell?.[1] === i);
            const isDep = isDependency(0, i);
            const filled = isFilled(val);

            return (
              <motion.div
                key={`${stepNumber}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="text-xs text-slate-600 font-mono">{i}</div>
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    boxShadow: isCurrent
                      ? '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4)'
                      : isDep
                      ? '0 0 10px rgba(34, 211, 238, 0.5)'
                      : 'none',
                  }}
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm font-bold
                    border-2 transition-colors
                    ${isCurrent
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                      : isDep
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : filled
                      ? 'bg-slate-700/60 border-slate-600 text-slate-200'
                      : 'bg-slate-800/40 border-slate-700 text-slate-600'}
                  `}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={String(val)}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {val !== null && val !== undefined ? String(val) : '∅'}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-slate-500 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-400" />
            <span>Current cell</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-400" />
            <span>Dependency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-700/60 border border-slate-600" />
            <span>Filled</span>
          </div>
        </div>
      </div>
    );
  }

  // 2D DP Table
  return (
    <div className="flex flex-col items-center gap-4 p-6 w-full overflow-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-purple-500" />
        <span className="text-sm text-slate-400">DP Table (2D)</span>
      </div>

      <div className="overflow-auto max-w-full">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-8" />
              {(headers?.cols ?? table[0]?.map((_, i) => String(i)) ?? []).map((h, i) => (
                <th key={i} className="w-12 text-center text-xs text-slate-500 font-mono pb-2 px-1">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, ri) => (
              <tr key={ri}>
                <td className="text-xs text-slate-500 font-mono pr-2 text-right">
                  {headers?.rows?.[ri] ?? String(ri)}
                </td>
                {row.map((val, ci) => {
                  const isCurrent = isCurrentCell(ri, ci);
                  const isDep = isDependency(ri, ci);
                  const filled = isFilled(val);

                  return (
                    <td key={ci} className="p-0.5">
                      <motion.div
                        key={`${stepNumber}-${ri}-${ci}`}
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: isCurrent ? 1.1 : 1,
                          boxShadow: isCurrent
                            ? '0 0 15px rgba(168, 85, 247, 0.8)'
                            : isDep
                            ? '0 0 10px rgba(34, 211, 238, 0.5)'
                            : 'none',
                        }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`
                          w-11 h-11 flex items-center justify-center rounded-md font-mono text-xs font-bold
                          border transition-colors
                          ${isCurrent
                            ? 'bg-purple-500/40 border-purple-400 text-purple-100'
                            : isDep
                            ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                            : filled
                            ? 'bg-slate-700/60 border-slate-600/80 text-slate-200'
                            : 'bg-slate-800/30 border-slate-700/40 text-slate-600'}
                        `}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={String(val)}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {val !== null && val !== undefined ? String(val) : '∅'}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-xs text-slate-500 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-400" />
          <span>Dependency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-700/60 border border-slate-600" />
          <span>Computed</span>
        </div>
      </div>
    </div>
  );
}
