'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult } from '@/types';
import CodeEditor from '@/components/CodeEditor';
import AlgoVisualizer from '@/components/AlgoVisualizer';
import CategoryBadge from '@/components/CategoryBadge';
import StepControls from '@/components/StepControls';

const EXAMPLE_CODES = [
  {
    label: 'Two Sum',
    tag: 'Hash Map',
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  },
  {
    label: 'Fibonacci DP',
    tag: 'DP',
    code: `def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
  },
  {
    label: 'Inorder Traversal',
    tag: 'Tree',
    code: `def inorderTraversal(root):
    result = []
    def dfs(node):
        if not node:
            return
        dfs(node.left)
        result.append(node.val)
        dfs(node.right)
    dfs(root)
    return result`,
  },
  {
    label: 'BFS',
    tag: 'Graph',
    code: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result`,
  },
  {
    label: 'Sliding Window',
    tag: 'Window',
    code: `def maxSumSubarray(nums, k):
    if not nums or k <= 0:
        return 0
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
  },
];

function LoadingSpinner() {
  const stages = ['Categorizing algorithm', 'Extracting execution steps', 'Building visualization data'];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage(s => (s + 1) % stages.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-24 h-24">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: i === 0 ? 'rgba(168,85,247,0.3)' : i === 1 ? 'rgba(168,85,247,0.6)' : 'transparent',
              borderTopColor: i === 2 ? '#22d3ee' : undefined,
              borderRightColor: i === 2 ? '#22d3ee' : undefined,
              inset: i * 6,
            }}
            animate={{ rotate: i === 2 ? -360 : 360 }}
            transition={{ duration: 1.2 + i * 0.4, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full"
            style={{ background: 'radial-gradient(circle, #a855f7, #7c3aed)' }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      <div className="text-center space-y-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-slate-300 font-medium text-sm"
          >
            {stages[stage]}...
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5 justify-center">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              animate={{ width: i === stage ? 24 : 6, background: i === stage ? '#a855f7' : '#1e293b' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Stable eye icon components
function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function formatVar(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return `[${(v as unknown[]).map(x => x === null ? 'null' : String(x)).join(', ')}]`;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v as string | number | boolean);
}

/** One bordered section card — matches the VISITED / COMPONENTS COUNT style. */
function VarCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700/70 overflow-hidden bg-slate-900/50">
      <p className="text-[9px] font-bold font-mono uppercase tracking-widest text-slate-400 px-3 pt-2.5 pb-1.5">
        {label}
      </p>
      <div className="px-3 pb-3">{children}</div>
    </div>
  );
}

/** Renders algorithm variables as section cards.
 *  - Each array  → its own labelled card with indexed horizontal cells
 *  - All scalars → one labelled card with a row of name=value chips
 */
function VariablesDisplay({ variables }: { variables: Record<string, unknown> }) {
  const entries = Object.entries(variables).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return null;

  const arrays  = entries.filter(([, v]) => Array.isArray(v));
  const scalars = entries.filter(([, v]) => !Array.isArray(v));

  return (
    <div className="flex flex-col gap-2">

      {/* ── Scalars card ── */}
      {scalars.length > 0 && (
        <VarCard label="State">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {scalars.map(([k, v]) => {
              const str = v === null || v === undefined ? 'null' : String(v as string | number | boolean);
              const isBool = typeof v === 'boolean';
              const valColor = isBool
                ? ((v as boolean) ? '#86efac' : '#f87171')
                : typeof v === 'number' ? '#fcd34d' : '#7dd3fc';
              return (
                <div key={k} className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">{k}</span>
                  <span className="text-slate-700 text-xs">=</span>
                  <span className="font-bold text-sm" style={{ color: valColor }}>{str}</span>
                </div>
              );
            })}
          </div>
        </VarCard>
      )}

      {/* ── One card per array variable ── */}
      {arrays.map(([k, rawV]) => {
        const arr = rawV as unknown[];
        return (
          <VarCard key={k} label={k}>
            <div className="flex flex-wrap gap-1.5">
              {arr.map((cell, i) => {
                const isBool = typeof cell === 'boolean';
                const isTrue  = isBool && (cell as boolean) === true;
                const isFalse = isBool && (cell as boolean) === false;
                const str = cell === null || cell === undefined ? '∅' : String(cell);
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className="min-w-[36px] h-9 px-1.5 rounded-lg border-2 font-mono text-xs font-bold flex items-center justify-center"
                      style={{
                        borderColor: isTrue ? '#22c55e' : isFalse ? '#1e293b' : '#1e3a5f',
                        background:  isTrue ? 'rgba(34,197,94,0.15)' : isFalse ? 'rgba(15,23,42,0.7)' : 'rgba(15,35,60,0.8)',
                        color:       isTrue ? '#86efac' : isFalse ? '#334155' : '#93c5fd',
                      }}
                    >
                      {str}
                    </div>
                    <span className="text-[9px] text-slate-700 font-mono">{i}</span>
                  </div>
                );
              })}
            </div>
          </VarCard>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [code, setCode] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'empty' | 'set'>('empty');
  const apiKeyRef = useRef('');

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'visualization'>('editor');

  // Load saved key on mount
  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key') ?? '';
    if (stored) {
      apiKeyRef.current = stored;
      setApiKeyInput(stored);
      setKeyStatus('set');
    }
  }, []);

  // Handle key field change — save immediately, update ref immediately
  const handleKeyChange = (val: string) => {
    const trimmed = val.trim();
    setApiKeyInput(val); // keep raw in the input
    apiKeyRef.current = trimmed;
    if (trimmed) {
      localStorage.setItem('openai_api_key', trimmed);
      setKeyStatus('set');
    } else {
      localStorage.removeItem('openai_api_key');
      setKeyStatus('empty');
    }
  };

  // Auto-play
  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (isPlaying && result) {
      const delay = 1500 / speed;
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= result.totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, result, speed]);

  const handleAnalyze = useCallback(async () => {
    const key = apiKeyRef.current; // always current — no stale closure

    if (!code.trim()) {
      setError('Please paste your algorithm code into the editor first.');
      return;
    }
    if (!key) {
      setError('Please enter your OpenAI API key in the field below.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setActiveTab('visualization'); // show spinner immediately on mobile

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), apiKey: key }),
      });
      const data = await res.json() as AnalysisResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data);
      setActiveTab('visualization');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }, [code]); // only re-create when code changes; key is read from ref

  const handlePrev = useCallback(() => {
    setCurrentStep(s => Math.max(0, s - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(s => {
      if (!result) return s;
      return Math.min(result.totalSteps - 1, s + 1);
    });
  }, [result]);

  const handleJump = useCallback((step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const step = result?.steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, 8, 0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ⚡
            </motion.span>
            <div>
              <span className="text-base font-extrabold gradient-text tracking-tight">AlgoViz</span>
              <span className="ml-2 text-[10px] text-slate-600 hidden sm:inline">AI Algorithm Visualizer</span>
            </div>
          </div>

          {/* Compact key indicator in header */}
          <div className="flex items-center gap-2">
            {keyStatus === 'set' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GPT-4o ready
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                API key needed
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">

        {/* ── Hero (pre-analysis) ──────────────────────── */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold gradient-text mb-3 leading-tight">
              Visualize Any Algorithm
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
              Paste your LeetCode code — AI categorizes it and creates a live step-by-step visualization.
            </p>
          </motion.div>
        )}

        {/* ── Example buttons ──────────────────────────── */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            <span className="text-xs text-slate-600 self-center">Try:</span>
            {EXAMPLE_CODES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setCode(ex.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
              >
                {ex.label}
                <span className="ml-1 text-slate-600 text-[10px]">{ex.tag}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Mobile tab switcher ──────────────────────── */}
        {(result || loading) && (
          <div className="flex lg:hidden rounded-xl overflow-hidden border border-slate-800 mb-4">
            {(['editor', 'visualization'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Main two-column layout ───────────────────── */}
        <div className={`flex gap-5 ${(result || loading) ? 'flex-col lg:flex-row' : 'flex-col max-w-3xl mx-auto'}`}>

          {/* ── LEFT: Editor panel ───────────────────── */}
          <div
            className={`
              flex flex-col gap-3
              ${(result || loading) ? 'lg:w-[430px] lg:flex-shrink-0' : 'w-full'}
              ${(result || loading) && activeTab !== 'editor' ? 'hidden lg:flex' : 'flex'}
            `}
          >
            {/* Code editor */}
            <div className="glass rounded-2xl p-3 flex flex-col gap-3">
              <div className="h-[340px] sm:h-[400px]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  highlightedLines={step?.codeHighlight ?? []}
                />
              </div>

              {/* ── API Key field ── always visible ────── */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/40">
                  <span className="text-sm">🔑</span>
                  <span className="text-xs font-semibold text-slate-400">OpenAI API Key</span>
                  {keyStatus === 'set' && (
                    <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder="sk-proj-... or sk-..."
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-slate-200 outline-none placeholder:text-slate-600 min-w-0"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(s => !s)}
                    className="px-3 py-2.5 text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={() => handleKeyChange('')}
                      className="px-3 py-2.5 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 text-sm"
                      title="Clear key"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2"
                  >
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze button */}
              <motion.button
                onClick={handleAnalyze}
                disabled={loading || !code.trim()}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="btn-primary w-full py-3.5 rounded-xl text-white font-bold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Visualize Algorithm
                  </>
                )}
              </motion.button>
            </div>

            {/* Result summary */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 flex flex-col gap-4"
              >
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{result.problemName}</h3>
                  <CategoryBadge category={result.category} label={result.categoryLabel} />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{result.explanation}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Time', value: result.complexity.time, color: 'text-purple-300' },
                    { label: 'Space', value: result.complexity.space, color: 'text-cyan-300' },
                    { label: 'Steps', value: String(result.totalSteps), color: 'text-emerald-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{label}</div>
                      <div className={`font-mono text-sm font-bold ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Visualization panel ───────────── */}
          {(result || loading) && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                flex-1 flex flex-col gap-3 min-w-0
                ${(result || loading) && activeTab !== 'visualization' ? 'hidden lg:flex' : 'flex'}
              `}
            >
              {loading ? (
                <div className="glass rounded-2xl flex items-center justify-center min-h-[480px]">
                  <LoadingSpinner />
                </div>
              ) : result && step ? (
                <>
                  {/* Visualizer canvas */}
                  <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-purple-400"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm font-semibold text-slate-300">Visualization</span>
                      </div>
                      <span className="text-xs text-slate-600 font-mono">
                        {currentStep + 1} / {result.totalSteps}
                      </span>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <AlgoVisualizer step={step} result={result} />
                    </div>
                  </div>

                  {/* Step description + variables */}
                  <div className="relative">
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="glass rounded-2xl overflow-hidden"
                    >
                      {/* Description — left accent border like a blockquote */}
                      <div className="px-5 py-4 flex items-start gap-4">
                        <div
                          className="shrink-0 self-stretch w-0.5 rounded-full mt-0.5"
                          style={{ background: 'linear-gradient(to bottom, #a855f7, #22d3ee)' }}
                        />
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <span
                            className="text-[9px] font-bold font-mono uppercase tracking-widest"
                            style={{ color: '#a855f7' }}
                          >
                            Step {currentStep + 1} / {result.totalSteps}
                          </span>
                          <p className="text-slate-100 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>

                      {/* Variables — section cards, only when present */}
                      {Object.keys(step.variables).length > 0 && (
                        <>
                          <div className="h-px bg-white/5" />
                          <div className="px-5 py-4">
                            <VariablesDisplay variables={step.variables as Record<string, unknown>} />
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  </div>

                  {/* Step controls */}
                  <div className="glass rounded-2xl p-4">
                    <StepControls
                      currentStep={currentStep}
                      totalSteps={result.totalSteps}
                      onPrev={handlePrev}
                      onNext={handleNext}
                      onJump={handleJump}
                      isPlaying={isPlaying}
                      onTogglePlay={handleTogglePlay}
                      speed={speed}
                      onSpeedChange={setSpeed}
                    />
                  </div>
                </>
              ) : null}
            </motion.div>
          )}
        </div>

        {/* ── Feature cards (empty state) ─────────────── */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {[
              { icon: '📊', label: 'Dynamic Programming', desc: '1D / 2D table walkthrough, cell-by-cell' },
              { icon: '🌳', label: 'Trees & Graphs', desc: 'BFS / DFS with node state animations' },
              { icon: '👆', label: 'Two Pointers', desc: 'Pointer movement over arrays, swap tracking' },
              { icon: '🪟', label: 'Sliding Window', desc: 'Live window range with sum tracking' },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass rounded-2xl p-4 text-center cursor-default"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-slate-300 text-xs mb-1">{item.label}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-white/5 py-4 text-center">
        <p className="text-xs text-slate-700">
          AlgoViz · GPT-4o + LangChain · Built for LeetCode learners
        </p>
      </footer>
    </div>
  );
}
