'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { HashMapState } from '@/types';

interface HashMapVisualizerProps {
  state: HashMapState;
  stepNumber: number;
}

const OP_COLORS = {
  insert: { border: '#22d3ee', bg: 'rgba(34,211,238,0.18)', text: '#67e8f9', label: 'INSERT' },
  lookup: { border: '#a855f7', bg: 'rgba(168,85,247,0.18)', text: '#d8b4fe', label: 'LOOKUP' },
  delete: { border: '#ef4444', bg: 'rgba(239,68,68,0.15)',  text: '#fca5a5', label: 'DELETE' },
};

export default function HashMapVisualizer({ state, stepNumber }: HashMapVisualizerProps) {
  const { entries = [], currentKey, operation, result } = state;

  const opStyle = operation ? OP_COLORS[operation] : null;

  return (
    <div className="flex flex-col items-center gap-5 p-5 w-full select-none">
      {/* Operation banner */}
      {opStyle && (
        <motion.div
          key={`${stepNumber}-op`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold border"
          style={{ color: opStyle.text, borderColor: opStyle.border, background: opStyle.bg }}
        >
          <span>{opStyle.label}</span>
          {currentKey !== undefined && (
            <>
              <span className="opacity-50">key=</span>
              <span className="font-mono">{String(currentKey)}</span>
            </>
          )}
          {result !== undefined && result !== null && (
            <>
              <span className="opacity-50 ml-1">→</span>
              <span className="font-mono">{String(result)}</span>
            </>
          )}
        </motion.div>
      )}

      {/* Hash map grid */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="grid grid-cols-2 gap-0 mb-1 px-1">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center">KEY</div>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center">VALUE</div>
        </div>

        {/* Entries */}
        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {entries.length === 0 ? (
              <div className="text-slate-600 text-sm text-center py-6 font-mono italic">
                (empty)
              </div>
            ) : (
              entries.map((entry, i) => {
                const isHighlighted = entry.highlighted || String(entry.key) === String(currentKey);
                const isNew = entry.isNew;

                const borderColor = isNew
                  ? '#22d3ee'
                  : isHighlighted
                  ? '#a855f7'
                  : '#1e293b';
                const bgColor = isNew
                  ? 'rgba(34,211,238,0.12)'
                  : isHighlighted
                  ? 'rgba(168,85,247,0.15)'
                  : 'rgba(15,23,42,0.6)';
                const textColor = isNew
                  ? '#67e8f9'
                  : isHighlighted
                  ? '#d8b4fe'
                  : '#94a3b8';
                const glow = isNew
                  ? '0 0 14px rgba(34,211,238,0.4)'
                  : isHighlighted
                  ? '0 0 12px rgba(168,85,247,0.35)'
                  : 'none';

                return (
                  <motion.div
                    key={`${entry.key}`}
                    layout
                    initial={{ opacity: 0, x: -16, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 16, scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: isNew ? 0 : i * 0.02 }}
                    className="grid grid-cols-2 rounded-lg border overflow-hidden"
                    style={{
                      borderColor,
                      background: bgColor,
                      boxShadow: glow,
                    }}
                  >
                    {/* Key cell */}
                    <div
                      className="px-4 py-2.5 font-mono text-sm font-bold border-r flex items-center justify-center"
                      style={{ color: textColor, borderColor }}
                    >
                      {String(entry.key)}
                      {isNew && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(34,211,238,0.2)', color: '#67e8f9' }}
                        >
                          NEW
                        </motion.span>
                      )}
                    </div>

                    {/* Value cell */}
                    <div
                      className="px-4 py-2.5 font-mono text-sm font-bold flex items-center justify-center"
                      style={{ color: textColor }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${stepNumber}-${entry.key}-${String(entry.value)}`}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {entry.value === null || entry.value === undefined ? '∅' : String(entry.value)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center mt-1">
        {[
          { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', label: 'Just inserted' },
          { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', label: 'Current lookup' },
          { color: '#475569', bg: 'rgba(15,23,42,0.6)',    label: 'Stored' },
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
