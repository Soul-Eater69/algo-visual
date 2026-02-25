'use client';
import { motion } from 'framer-motion';
import type { GridState, GridCellState } from '@/types';

interface GridVisualizerProps {
  state: GridState;
  stepNumber: number;
}

const CELL_STYLES: Record<GridCellState, { bg: string; border: string; text: string; glow?: string }> = {
  default:     { bg: 'rgba(30,41,59,0.8)',    border: '#334155', text: '#94a3b8' },
  blocked:     { bg: 'rgba(15,23,42,0.9)',    border: '#1e293b', text: '#475569' },
  visited:     { bg: 'rgba(34,197,94,0.2)',   border: '#22c55e', text: '#86efac', glow: '0 0 10px rgba(34,197,94,0.3)' },
  current:     { bg: 'rgba(234,179,8,0.25)',  border: '#eab308', text: '#fef08a', glow: '0 0 14px rgba(234,179,8,0.5)' },
  queued:      { bg: 'rgba(249,115,22,0.2)',  border: '#f97316', text: '#fdba74', glow: '0 0 10px rgba(249,115,22,0.35)' },
  source:      { bg: 'rgba(239,68,68,0.25)',  border: '#ef4444', text: '#fca5a5', glow: '0 0 14px rgba(239,68,68,0.45)' },
  highlighted: { bg: 'rgba(168,85,247,0.2)',  border: '#a855f7', text: '#d8b4fe', glow: '0 0 12px rgba(168,85,247,0.4)' },
};

export default function GridVisualizer({ state, stepNumber }: GridVisualizerProps) {
  const { grid = [], queue = [], legend } = state;

  if (!grid.length || !grid[0]?.length) {
    return <div className="text-slate-600 text-sm p-8 text-center">No grid data</div>;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  // Cell size scales down for larger grids
  const cellSize = cols <= 4 ? 64 : cols <= 6 ? 52 : 44;

  return (
    <div className="flex flex-col items-center gap-5 p-5 w-full select-none">
      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((cell, c) => {
              const cellState: GridCellState = cell.state ?? 'default';
              const style = CELL_STYLES[cellState] ?? CELL_STYLES.default;

              return (
                <motion.div
                  key={`${r}-${c}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    borderColor: style.border,
                    backgroundColor: style.bg,
                    boxShadow: style.glow ?? 'none',
                  }}
                  transition={{ duration: 0.25, delay: (r * cols + c) * 0.02 }}
                  className="flex flex-col items-center justify-center rounded-xl border font-mono font-bold"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderColor: style.border,
                    background: style.bg,
                    boxShadow: style.glow,
                    color: style.text,
                    fontSize: cellSize > 52 ? 18 : 14,
                  }}
                >
                  <span>{String(cell.value)}</span>
                  {cell.label && (
                    <span className="text-[9px] opacity-70 font-normal mt-0.5">{cell.label}</span>
                  )}
                  {/* row,col coordinates */}
                  <span className="text-[8px] opacity-30 font-normal">{r},{c}</span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* BFS Queue */}
      {queue.length > 0 && (
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">BFS Queue</div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {queue.map(([qr, qc], i) => (
              <motion.div
                key={`q-${i}-${qr}-${qc}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold"
                style={{
                  borderColor: '#f97316',
                  background: 'rgba(249,115,22,0.15)',
                  color: '#fdba74',
                }}
              >
                [{qr},{qc}]
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {legend && legend.length > 0 ? (
        <div className="flex flex-wrap gap-3 justify-center">
          {legend.map(({ value, label, color }) => (
            <div key={value} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <div
                className="w-4 h-4 rounded border font-mono text-[8px] flex items-center justify-center font-bold"
                style={{ borderColor: color, background: `${color}30`, color }}
              >
                {value}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {(Object.entries(CELL_STYLES) as [GridCellState, typeof CELL_STYLES[GridCellState]][])
            .filter(([s]) => s !== 'default' && s !== 'blocked')
            .map(([s, style]) => (
              <div key={s} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <div className="w-3 h-3 rounded border" style={{ borderColor: style.border, background: style.bg }} />
                <span className="capitalize">{s}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
