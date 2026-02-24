'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { StackQueueState } from '@/types';

interface StackQueueVisualizerProps {
  state: StackQueueState;
  stepNumber: number;
}

export default function StackQueueVisualizer({ state, stepNumber }: StackQueueVisualizerProps) {
  const { items, type, operation, operationValue } = state;

  if (type === 'stack') {
    return (
      <div className="flex flex-col items-center gap-6 p-6 w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-slate-400">Stack (LIFO)</span>
        </div>

        {operation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-mono px-3 py-1.5 rounded-md border ${
              operation === 'push'
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : 'bg-red-500/15 border-red-500/40 text-red-400'
            }`}
          >
            {operation === 'push' ? `push(${operationValue})` : `pop() → ${operationValue}`}
          </motion.div>
        )}

        <div className="flex flex-col-reverse gap-1.5 items-center" style={{ minHeight: '200px' }}>
          {/* Stack base */}
          <div className="w-40 h-1.5 bg-slate-600 rounded-full mt-1" />

          {/* Stack items */}
          <AnimatePresence>
            {items.map((item, i) => {
              const isTop = i === items.length - 1;
              return (
                <motion.div
                  key={`stack-${stepNumber}-${i}-${item}`}
                  initial={isTop && operation === 'push' ? { y: -30, opacity: 0, scale: 0.8 } : { opacity: 1 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    w-36 h-12 flex items-center justify-between px-4 rounded-lg font-mono text-sm font-bold
                    border-2 cursor-default
                    ${isTop
                      ? 'bg-orange-500/30 border-orange-400 text-orange-200'
                      : 'bg-slate-700/60 border-slate-600 text-slate-300'}
                  `}
                  style={{
                    boxShadow: isTop ? '0 0 15px rgba(249, 115, 22, 0.4)' : 'none',
                  }}
                >
                  <span>{String(item)}</span>
                  {isTop && (
                    <span className="text-xs text-orange-400/70 font-normal">← top</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-slate-600 text-sm font-mono italic">Empty stack</div>
          )}
        </div>

        <div className="text-xs text-slate-600 font-mono mt-2">
          Size: {items.length}
        </div>
      </div>
    );
  }

  // Queue
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-violet-500" />
        <span className="text-sm text-slate-400">Queue (FIFO)</span>
      </div>

      {operation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs font-mono px-3 py-1.5 rounded-md border ${
            operation === 'enqueue'
              ? 'bg-green-500/15 border-green-500/40 text-green-400'
              : 'bg-red-500/15 border-red-500/40 text-red-400'
          }`}
        >
          {operation === 'enqueue' ? `enqueue(${operationValue})` : `dequeue() → ${operationValue}`}
        </motion.div>
      )}

      <div className="flex flex-col gap-3 items-center w-full">
        {/* Labels */}
        {items.length > 0 && (
          <div className="flex gap-2 items-center w-full justify-center">
            <div className="text-xs text-red-400/70 font-mono">dequeue ←</div>
            <div className="flex-1" />
            <div className="text-xs text-green-400/70 font-mono">→ enqueue</div>
          </div>
        )}

        {/* Queue items */}
        <div className="flex gap-1.5 items-center min-h-[60px] flex-wrap justify-center">
          <AnimatePresence>
            {items.map((item, i) => {
              const isFront = i === 0;
              const isBack = i === items.length - 1;
              return (
                <motion.div
                  key={`queue-${stepNumber}-${i}-${item}`}
                  initial={isBack && operation === 'enqueue' ? { x: 30, opacity: 0, scale: 0.8 } : { opacity: 1 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -30, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    w-14 h-14 flex flex-col items-center justify-center rounded-lg font-mono text-sm font-bold
                    border-2
                    ${isFront
                      ? 'bg-red-500/25 border-red-400 text-red-200'
                      : isBack
                      ? 'bg-green-500/25 border-green-400 text-green-200'
                      : 'bg-slate-700/60 border-slate-600 text-slate-300'}
                  `}
                  style={{
                    boxShadow: isFront
                      ? '0 0 12px rgba(239, 68, 68, 0.4)'
                      : isBack
                      ? '0 0 12px rgba(34, 197, 94, 0.4)'
                      : 'none',
                  }}
                >
                  <span>{String(item)}</span>
                  {isFront && <span className="text-[9px] text-red-400/60 mt-0.5">front</span>}
                  {isBack && items.length > 1 && <span className="text-[9px] text-green-400/60 mt-0.5">back</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-slate-600 text-sm font-mono italic">Empty queue</div>
          )}
        </div>

        {/* Queue rail */}
        {items.length > 0 && (
          <div className="w-full max-w-xs h-0.5 bg-gradient-to-r from-red-500/40 via-slate-600 to-green-500/40 rounded-full" />
        )}
      </div>

      <div className="text-xs text-slate-600 font-mono">
        Size: {items.length}
      </div>
    </div>
  );
}
