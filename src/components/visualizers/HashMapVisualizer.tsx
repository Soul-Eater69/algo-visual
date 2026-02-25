'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { HashMapState } from '@/types';

interface HashMapVisualizerProps {
  state: HashMapState;
  stepNumber: number;
}

const OP_CONFIG = {
  insert: { icon: '➕', label: 'INSERT', border: '#22d3ee', bg: 'rgba(34,211,238,0.12)', text: '#67e8f9' },
  lookup: { icon: '🔍', label: 'LOOKUP', border: '#a855f7', bg: 'rgba(168,85,247,0.12)', text: '#d8b4fe' },
  delete: { icon: '🗑️', label: 'DELETE', border: '#ef4444', bg: 'rgba(239,68,68,0.10)', text: '#fca5a5' },
};

export default function HashMapVisualizer({ state, stepNumber }: HashMapVisualizerProps) {
  const { entries = [], currentKey, operation, result } = state;
  const op = operation ? OP_CONFIG[operation] : null;
  const hasResult = result !== undefined && result !== null;

  return (
    <div className="flex flex-col items-center gap-5 p-5 w-full select-none">

      {/* ── Operation context banner ── */}
      <AnimatePresence mode="wait">
        {op ? (
          <motion.div
            key={`${stepNumber}-op`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 25 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border"
            style={{ borderColor: op.border, background: op.bg }}
          >
            <span className="text-lg">{op.icon}</span>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="font-bold tracking-wide" style={{ color: op.text }}>{op.label}</span>
              {currentKey !== undefined && (
                <>
                  <span className="text-slate-600">key =</span>
                  <span className="font-bold px-2 py-0.5 rounded-lg border text-xs"
                    style={{ borderColor: op.border, background: `${op.border}20`, color: op.text }}>
                    {String(currentKey)}
                  </span>
                </>
              )}
              {hasResult && (
                <>
                  <span className="text-slate-600 ml-1">→</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="font-bold px-2 py-0.5 rounded-lg border text-xs"
                    style={{ borderColor: '#22c55e', background: 'rgba(34,197,94,0.15)', color: '#86efac' }}
                  >
                    {String(result)} ✓
                  </motion.span>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-slate-600 font-mono tracking-widest uppercase"
          >
            HashMap Memory
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Memory cards ── */}
      <div className="w-full">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-28 rounded-2xl border border-dashed border-slate-700 text-slate-600 font-mono text-sm"
          >
            empty map  &#123;&#125;
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-wrap gap-3 justify-center">
            <AnimatePresence>
              {entries.map((entry, i) => {
                const isNew = !!entry.isNew;
                const isMatch = hasResult && String(entry.key) === String(currentKey);
                const isLookedUp = !isNew && (!!entry.highlighted || (!isMatch && String(entry.key) === String(currentKey)));

                // Style priority: match > new > looked-up > stored
                const cardStyle = isMatch
                  ? { border: '#22c55e', bg: 'rgba(34,197,94,0.15)',  keyColor: '#86efac', valColor: '#bbf7d0', glow: '0 0 20px rgba(34,197,94,0.35)' }
                  : isNew
                  ? { border: '#22d3ee', bg: 'rgba(34,211,238,0.12)', keyColor: '#67e8f9', valColor: '#a5f3fc', glow: '0 0 20px rgba(34,211,238,0.4)' }
                  : isLookedUp
                  ? { border: '#a855f7', bg: 'rgba(168,85,247,0.12)', keyColor: '#d8b4fe', valColor: '#e9d5ff', glow: '0 0 16px rgba(168,85,247,0.35)' }
                  : { border: '#334155', bg: 'rgba(15,23,42,0.7)',    keyColor: '#7dd3fc', valColor: '#94a3b8', glow: 'none' };

                return (
                  <motion.div
                    key={String(entry.key)}
                    layout
                    initial={{ opacity: 0, y: -24, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22, delay: isNew ? 0 : i * 0.025 }}
                    className="relative flex flex-col rounded-2xl border overflow-hidden"
                    style={{
                      borderColor: cardStyle.border,
                      background: cardStyle.bg,
                      boxShadow: cardStyle.glow,
                      minWidth: 80,
                    }}
                  >
                    {/* Slot index */}
                    <div
                      className="text-[9px] font-mono text-center py-0.5 font-bold"
                      style={{ background: `${cardStyle.border}20`, color: cardStyle.border }}
                    >
                      slot {i}
                    </div>

                    {/* Key section */}
                    <div className="flex flex-col items-center px-4 pt-3 pb-1.5 border-b"
                      style={{ borderColor: `${cardStyle.border}30` }}>
                      <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mb-1">key</div>
                      <div className="font-mono font-bold text-base" style={{ color: cardStyle.keyColor }}>
                        {String(entry.key)}
                      </div>
                    </div>

                    {/* Value section */}
                    <div className="flex flex-col items-center px-4 pt-1.5 pb-3">
                      <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mb-1">value</div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${stepNumber}-${entry.key}-${String(entry.value)}`}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="font-mono font-bold text-base"
                          style={{ color: cardStyle.valColor }}
                        >
                          {entry.value === null || entry.value === undefined ? '∅' : String(entry.value)}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* NEW badge */}
                    {isNew && (
                      <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#22d3ee', color: '#0c4a6e' }}
                      >
                        NEW
                      </motion.div>
                    )}

                    {/* MATCH badge */}
                    {isMatch && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#22c55e', color: '#052e16' }}
                      >
                        ✓ MATCH
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
        {[
          { border: '#22d3ee', bg: 'rgba(34,211,238,0.12)', label: 'Just inserted' },
          { border: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'Lookup target' },
          { border: '#22c55e', bg: 'rgba(34,197,94,0.15)',  label: 'Match found' },
          { border: '#334155', bg: 'rgba(15,23,42,0.7)',    label: 'Stored' },
        ].map(({ border, bg, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border" style={{ borderColor: border, background: bg }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
