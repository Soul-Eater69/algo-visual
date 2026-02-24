'use client';
import { motion } from 'framer-motion';
import type { AlgoCategory } from '@/types';

interface CategoryBadgeProps {
  category: AlgoCategory;
  label: string;
}

const CATEGORY_CONFIG: Record<AlgoCategory, { color: string; bg: string; border: string; icon: string }> = {
  'dynamic-programming': { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', icon: '📊' },
  'tree':               { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)',  border: 'rgba(34, 197, 94, 0.4)',  icon: '🌳' },
  'graph':              { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', icon: '🕸️' },
  'array':              { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', icon: '📋' },
  'two-pointers':       { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', icon: '👆' },
  'sliding-window':     { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)', icon: '🪟' },
  'stack':              { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', icon: '📚' },
  'queue':              { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', icon: '🎫' },
  'linked-list':        { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)',  border: 'rgba(6, 182, 212, 0.4)',  icon: '🔗' },
  'binary-search':      { color: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)', border: 'rgba(132, 204, 22, 0.4)', icon: '🔍' },
  'backtracking':       { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)',  border: 'rgba(239, 68, 68, 0.4)',  icon: '🔄' },
  'greedy':             { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)',  border: 'rgba(234, 179, 8, 0.4)',  icon: '💰' },
  'string':             { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', icon: '📝' },
  'heap':               { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', icon: '⛰️' },
  'divide-and-conquer': { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', icon: '⚔️' },
  'unknown':            { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)',border: 'rgba(107, 114, 128, 0.4)',icon: '❓' },
};

export default function CategoryBadge({ category, label }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['unknown'];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: `0 0 20px ${config.bg}`,
      }}
    >
      <span>{config.icon}</span>
      <span>{label}</span>
    </motion.div>
  );
}
