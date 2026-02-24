'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedLines?: number[];
  readOnly?: boolean;
}

const PLACEHOLDER = `# Paste your LeetCode algorithm here
# Example: Two Sum

def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

export default function CodeEditor({
  value,
  onChange,
  highlightedLines = [],
  readOnly = false,
}: CodeEditorProps) {
  const lines = value.split('\n');

  return (
    <div className="relative h-full flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117]">
      {/* Editor header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-[#0a0e17]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-slate-600 font-mono">algorithm.py</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="select-none sticky left-0 bg-[#0a0e17] border-r border-slate-800/60 px-3 py-4 text-right min-w-[44px]">
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightedLines.includes(lineNum);
              return (
                <div
                  key={i}
                  className={`text-xs font-mono leading-6 transition-colors ${
                    isHighlighted ? 'text-purple-400' : 'text-slate-700'
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>

          {/* Code with highlights */}
          <div className="flex-1 relative">
            {/* Highlight overlays */}
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightedLines.includes(lineNum);
              if (!isHighlighted) return null;
              return (
                <motion.div
                  key={`hl-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top: `${16 + i * 24}px`,
                    height: '24px',
                    background: 'rgba(168, 85, 247, 0.12)',
                    borderLeft: '2px solid rgba(168, 85, 247, 0.7)',
                  }}
                />
              );
            })}

            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              readOnly={readOnly}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              className="w-full min-h-full bg-transparent text-slate-200 font-mono text-[13px] leading-6 p-4 outline-none resize-none border-none placeholder:text-slate-700 relative z-10"
              style={{
                caretColor: '#a855f7',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
