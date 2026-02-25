'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { HashMapState } from '@/types';

interface HashMapVisualizerProps {
  state: HashMapState;
  stepNumber: number;
}

// ─── colour palette per entry state ─────────────────────────────────────────
const C = {
  new:    { border: '#22d3ee', bg: 'rgba(34,211,238,0.12)', keyClr: '#67e8f9', valClr: '#a5f3fc', glow: '0 0 18px rgba(34,211,238,0.5)',  badgeBg: '#22d3ee', badgeFg: '#0c4a6e' },
  lookup: { border: '#a855f7', bg: 'rgba(168,85,247,0.12)', keyClr: '#d8b4fe', valClr: '#e9d5ff', glow: '0 0 15px rgba(168,85,247,0.45)', badgeBg: '#a855f7', badgeFg: '#3b0764' },
  match:  { border: '#22c55e', bg: 'rgba(34,197,94,0.15)',  keyClr: '#86efac', valClr: '#bbf7d0', glow: '0 0 22px rgba(34,197,94,0.55)', badgeBg: '#22c55e', badgeFg: '#052e16' },
  idle:   { border: '#1e293b', bg: 'rgba(15,23,42,0.7)',    keyClr: '#7dd3fc', valClr: '#64748b', glow: 'none',                            badgeBg: '#1e293b', badgeFg: '#64748b' },
} as const;
type EntryState = keyof typeof C;

const BADGE: Record<EntryState, string | null> = {
  new: 'NEW', lookup: 'SEARCH', match: '✓ MATCH', idle: null,
};

// ─── sub-components ───────────────────────────────────────────────────────────

/** A single key→value pill with pointer arrow and badge above it. */
function EntryPill({
  entryKey, entryValue, entryState, index, stepNumber,
}: {
  entryKey: string | number;
  entryValue: string | number | null;
  entryState: EntryState;
  index: number;
  stepNumber: number;
}) {
  const c = C[entryState];
  const badge = BADGE[entryState];
  const isActive = entryState !== 'idle';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -22, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.78, y: 14 }}
      transition={{ type: 'spring', stiffness: 310, damping: 22, delay: isActive ? 0 : index * 0.04 }}
      className="flex flex-col items-center"
    >
      {/* Badge row */}
      <div className="h-5 flex items-center justify-center mb-0.5">
        <AnimatePresence>
          {badge && (
            <motion.span
              key={badge}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full tracking-wide"
              style={{ background: c.badgeBg, color: c.badgeFg }}
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Bouncing pointer arrow */}
      <div className="h-5 flex items-center justify-center">
        {isActive && (
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm leading-none"
            style={{ color: c.border }}
          >
            ▼
          </motion.span>
        )}
      </div>

      {/* The pill itself */}
      <motion.div
        animate={{ boxShadow: c.glow, scale: isActive ? 1.07 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 font-mono font-bold text-sm cursor-default"
        style={{ borderColor: c.border, background: c.bg }}
      >
        {/* Key */}
        <span style={{ color: c.keyClr }}>{String(entryKey)}</span>

        {/* Arrow separator */}
        <span className="text-slate-600 text-xs font-normal">→</span>

        {/* Value — animates when it changes */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`${stepNumber}-${entryKey}-${String(entryValue)}`}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.14 }}
            style={{ color: c.valClr }}
          >
            {entryValue === null || entryValue === undefined ? '∅' : String(entryValue)}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/** Full-width operation context banner. */
function OperationBanner({
  operation, currentKey, result, hasResult, isNotFound, stepNumber,
}: {
  operation?: 'insert' | 'lookup' | 'delete';
  currentKey?: string | number;
  result?: string | number | null;
  hasResult: boolean;
  isNotFound: boolean;
  stepNumber: number;
}) {
  const OP = {
    insert: { icon: '↓', label: 'INSERT', color: '#22d3ee', border: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.07)' },
    lookup: { icon: '?', label: 'LOOKUP', color: '#a855f7', border: 'rgba(168,85,247,0.35)', bg: 'rgba(168,85,247,0.07)' },
    delete: { icon: '✕', label: 'DELETE', color: '#ef4444', border: 'rgba(239,68,68,0.35)',  bg: 'rgba(239,68,68,0.07)'  },
  };
  const op = operation ? OP[operation] : null;

  if (!op && currentKey === undefined) {
    return (
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
        hashmap memory
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${stepNumber}-banner`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border w-full"
        style={{ borderColor: op?.border ?? '#1e293b', background: op?.bg ?? 'transparent' }}
      >
        {/* Op type chip */}
        {op && (
          <span
            className="shrink-0 text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg tracking-widest"
            style={{ color: op.color, background: `${op.color}20`, border: `1px solid ${op.color}40` }}
          >
            {op.icon} {op.label}
          </span>
        )}

        {/* Key being operated on */}
        {currentKey !== undefined && (
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-slate-500 text-xs">key</span>
            <span className="text-slate-500 text-xs">=</span>
            <span
              className="font-bold px-2 py-0.5 rounded-lg text-xs"
              style={{ color: op?.color ?? '#94a3b8', background: `${op?.color ?? '#94a3b8'}18` }}
            >
              {String(currentKey)}
            </span>
          </div>
        )}

        {/* Right side: found result OR not-found badge */}
        <div className="ml-auto flex items-center">
          {hasResult && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(34,197,94,0.15)',
                color: '#86efac',
                border: '1px solid rgba(34,197,94,0.4)',
                boxShadow: '0 0 12px rgba(34,197,94,0.2)',
              }}
            >
              ✓&nbsp;found: {String(result)}
            </motion.span>
          )}
          {isNotFound && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              ✗&nbsp;not in map
            </motion.span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Shown when there are no entries yet. */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center h-20 rounded-2xl border border-dashed font-mono text-sm tracking-wide"
      style={{ borderColor: '#1e293b', color: '#334155', background: 'rgba(15,23,42,0.4)' }}
    >
      &#123;&nbsp;&nbsp;&#125;&ensp;— empty map
    </motion.div>
  );
}

/** Colour-coded legend at the bottom. */
function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 justify-center">
      {[
        { key: 'new'    as EntryState, label: 'Just inserted' },
        { key: 'lookup' as EntryState, label: 'Being searched' },
        { key: 'match'  as EntryState, label: 'Match found'   },
        { key: 'idle'   as EntryState, label: 'Stored'        },
      ].map(({ key, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="w-3.5 h-3.5 rounded border-2"
            style={{ borderColor: C[key].border, background: C[key].bg }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function HashMapVisualizer({ state, stepNumber }: HashMapVisualizerProps) {
  const { entries = [], currentKey, operation, result } = state;
  const hasResult = result !== undefined && result !== null;
  // Show "not in map" only when a lookup explicitly yielded no result
  const isNotFound = operation === 'lookup' && currentKey !== undefined && !hasResult;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full select-none">

      {/* ── Operation context ── */}
      <OperationBanner
        operation={operation}
        currentKey={currentKey}
        result={result}
        hasResult={hasResult}
        isNotFound={isNotFound}
        stepNumber={stepNumber}
      />

      {/* ── HashMap entries — horizontal pills ── */}
      <div className="w-full min-h-[88px] flex items-center justify-center">
        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div layout className="flex flex-row flex-wrap gap-4 justify-center items-end px-2">
            <AnimatePresence>
              {entries.map((entry, i) => {
                const isNew     = !!entry.isNew;
                const isMatch   = hasResult && String(entry.key) === String(currentKey);
                const isLookedUp = !isNew && !isMatch && (
                  !!entry.highlighted || String(entry.key) === String(currentKey)
                );
                const entryState: EntryState =
                  isMatch ? 'match' : isNew ? 'new' : isLookedUp ? 'lookup' : 'idle';

                return (
                  <EntryPill
                    key={String(entry.key)}
                    entryKey={entry.key}
                    entryValue={entry.value}
                    entryState={entryState}
                    index={i}
                    stepNumber={stepNumber}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Legend ── */}
      <Legend />
    </div>
  );
}
