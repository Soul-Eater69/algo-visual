'use client';
import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function StepControls({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onJump,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
}: StepControlsProps) {
  const progress = totalSteps > 1 ? ((currentStep) / (totalSteps - 1)) * 100 : 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'l') onNext();
      if (e.key === 'ArrowLeft' || e.key === 'h') onPrev();
      if (e.key === ' ') { e.preventDefault(); onTogglePlay(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext, onPrev, onTogglePlay]);

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onJump(Math.round(ratio * (totalSteps - 1)));
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-purple-400 border-2 border-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ left: `calc(${progress}% - 7px)` }}
          transition={{ duration: 0.2 }}
          style={{ boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)' }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Step counter */}
        <div className="text-xs text-slate-500 font-mono min-w-[60px]">
          <span className="text-purple-400 font-semibold">{currentStep + 1}</span>
          <span className="text-slate-600"> / </span>
          <span>{totalSteps}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous step (←)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Play/Pause */}
          <motion.button
            onClick={onTogglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 flex items-center justify-center rounded-xl btn-primary text-white font-bold shadow-lg"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Next step (→)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          <span className="text-xs text-slate-600">Speed</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                  speed === s
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-700 font-mono">
        ← → arrow keys to navigate • space to play/pause
      </div>
    </div>
  );
}
