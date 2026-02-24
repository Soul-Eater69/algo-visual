'use client';
import { motion } from 'framer-motion';
import type { VisualizationStep, AlgoCategory } from '@/types';

interface GenericVisualizerProps {
  step: VisualizationStep;
  category: AlgoCategory;
}

const CATEGORY_ICONS: Record<AlgoCategory, string> = {
  'dynamic-programming': '📊',
  'tree': '🌳',
  'graph': '🕸️',
  'array': '📋',
  'two-pointers': '👆',
  'sliding-window': '🪟',
  'stack': '📚',
  'queue': '🎫',
  'linked-list': '🔗',
  'binary-search': '🔍',
  'backtracking': '🔄',
  'greedy': '💰',
  'string': '📝',
  'heap': '⛰️',
  'divide-and-conquer': '⚔️',
  'hash-map': '🗂️',
  'unknown': '❓',
};

export default function GenericVisualizer({ step, category }: GenericVisualizerProps) {
  const icon = CATEGORY_ICONS[category] ?? '💡';

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-6xl"
      >
        {icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <p className="text-slate-300 font-medium text-base leading-relaxed">
          {step.description}
        </p>
      </motion.div>

      {Object.keys(step.variables).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm"
        >
          {Object.entries(step.variables).map(([key, val]) => (
            <div
              key={key}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center"
            >
              <div className="text-xs text-slate-500 font-mono">{key}</div>
              <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                {String(val)}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
