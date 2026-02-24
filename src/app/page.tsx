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
    category: 'Hash Map',
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
    category: 'Dynamic Programming',
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
    label: 'Binary Tree Inorder',
    category: 'Tree',
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
    label: 'BFS Graph',
    category: 'Graph',
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
    label: 'Sliding Window Max',
    category: 'Sliding Window',
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
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-t-purple-400 border-r-purple-400 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-b-cyan-400 border-l-cyan-400 border-t-transparent border-r-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-purple-400"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      <div className="text-center">
        <motion.p
          className="text-slate-300 font-medium text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          AI is analyzing your algorithm...
        </motion.p>
        <div className="flex gap-1 justify-center mt-3">
          {['Categorizing', 'Extracting steps', 'Building visualization'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
              className="text-xs text-purple-400/60 font-mono"
            >
              {i > 0 && <span className="mx-1 text-slate-700">·</span>}
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiKeyModal({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) setSaved(stored);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalKey = key || saved;
    if (finalKey) {
      localStorage.setItem('openai_api_key', finalKey);
      onSubmit(finalKey);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="glass rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/20"
        style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.15)' }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔑</div>
          <h2 className="text-xl font-bold text-white mb-2">OpenAI API Key Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            AlgoViz uses GPT-4o to analyze and visualize your algorithms.
            Your key is stored locally and never sent to our servers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={saved ? '●●●●●●●●●●●●●● (saved)' : 'sk-...'}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 font-mono text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!key && !saved}
            className="w-full btn-primary text-white font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved && !key ? 'Use Saved Key' : 'Save & Continue'}
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-4">
          Your key is encrypted in localStorage. Get one at platform.openai.com
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [code, setCode] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'visualization'>('editor');

  // Load API key from storage
  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) setApiKey(stored);
  }, []);

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

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please paste your algorithm code first.');
      return;
    }
    const key = apiKey ?? localStorage.getItem('openai_api_key');
    if (!key) {
      setShowApiModal(true);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, apiKey: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data);
      setActiveTab('visualization');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = useCallback(() => {
    setCurrentStep(s => Math.max(0, s - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!result) return;
    setCurrentStep(s => Math.min(result.totalSteps - 1, s + 1));
  }, [result]);

  const handleJump = useCallback((step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  const step = result?.steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal
          onSubmit={(key) => {
            setApiKey(key);
            setShowApiModal(false);
            setTimeout(handleAnalyze, 100);
          }}
        />
      )}

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl"
            >
              ⚡
            </motion.div>
            <div>
              <h1 className="text-lg font-bold gradient-text leading-tight">AlgoViz</h1>
              <p className="text-[10px] text-slate-600 leading-none">AI Algorithm Visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {apiKey ? (
              <div className="flex items-center gap-1.5 text-xs text-green-400/70 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>GPT-4o Connected</span>
              </div>
            ) : (
              <button
                onClick={() => setShowApiModal(true)}
                className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full hover:bg-amber-500/20 transition-colors"
              >
                Set API Key
              </button>
            )}

            <button
              onClick={() => {
                localStorage.removeItem('openai_api_key');
                setApiKey(null);
              }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              title="Clear API key"
            >
              {apiKey ? '×' : ''}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Hero section — shown only when no result */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold gradient-text mb-3">
              Visualize Any Algorithm
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Paste your LeetCode code. AI categorizes it and brings it to life with step-by-step animations.
            </p>
          </motion.div>
        )}

        {/* Example code buttons */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            <span className="text-xs text-slate-600 self-center mr-1">Try an example:</span>
            {EXAMPLE_CODES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setCode(ex.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
              >
                {ex.label}
                <span className="ml-1.5 text-slate-600">{ex.category}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Main layout */}
        <div className={`flex gap-6 ${result ? 'flex-col lg:flex-row' : 'flex-col max-w-3xl mx-auto'}`}>

          {/* Mobile tab switcher */}
          {result && (
            <div className="flex lg:hidden rounded-xl border border-slate-800 overflow-hidden mb-2">
              {(['editor', 'visualization'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all capitalize ${
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

          {/* Left: Code Editor Panel */}
          <motion.div
            className={`
              flex flex-col gap-4
              ${result ? 'lg:w-[420px] lg:flex-shrink-0' : 'w-full'}
              ${result && activeTab !== 'editor' ? 'hidden lg:flex' : 'flex'}
            `}
            layout
          >
            <div className="glass rounded-2xl p-4 flex flex-col gap-4">
              {/* Code editor */}
              <div className="h-[350px] sm:h-[420px]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  highlightedLines={step?.codeHighlight ?? []}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2"
                  >
                    <span className="mt-0.5">⚠</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze button */}
              <motion.button
                onClick={handleAnalyze}
                disabled={loading || !code.trim()}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full py-3.5 rounded-xl text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Analyzing...
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

            {/* Result summary panel */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{result.problemName}</h3>
                    <div className="mt-1.5">
                      <CategoryBadge category={result.category} label={result.categoryLabel} />
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">{result.explanation}</p>

                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-800/60 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Time</div>
                    <div className="font-mono text-sm font-bold text-purple-300">{result.complexity.time}</div>
                  </div>
                  <div className="flex-1 bg-slate-800/60 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Space</div>
                    <div className="font-mono text-sm font-bold text-cyan-300">{result.complexity.space}</div>
                  </div>
                  <div className="flex-1 bg-slate-800/60 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Steps</div>
                    <div className="font-mono text-sm font-bold text-green-300">{result.totalSteps}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Visualization Panel */}
          {(result || loading) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                flex-1 flex flex-col gap-4 min-w-0
                ${result && activeTab !== 'visualization' ? 'hidden lg:flex' : 'flex'}
              `}
            >
              {loading ? (
                <div className="glass rounded-2xl flex items-center justify-center min-h-[500px]">
                  <LoadingSpinner />
                </div>
              ) : result && step ? (
                <>
                  {/* Visualization canvas */}
                  <div className="glass rounded-2xl flex-1 overflow-hidden min-h-[400px] flex flex-col">
                    {/* Canvas header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-sm font-medium text-slate-300">Visualization</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        Step {currentStep + 1}/{result.totalSteps}
                      </div>
                    </div>

                    {/* Visualizer */}
                    <div className="flex-1 overflow-auto p-2">
                      <AlgoVisualizer step={step} result={result} />
                    </div>
                  </div>

                  {/* Step description */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-xs font-bold">{currentStep + 1}</span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">{step.description}</p>
                    </div>

                    {/* Variables */}
                    {Object.keys(step.variables).length > 0 && (
                      <div>
                        <div className="text-xs text-slate-600 font-mono mb-2 uppercase tracking-wider">Variables</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(step.variables).map(([key, val]) => (
                            <motion.div
                              key={key}
                              layout
                              className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/80 rounded-lg px-3 py-1.5 font-mono text-xs"
                            >
                              <span className="text-cyan-400">{key}</span>
                              <span className="text-slate-600">=</span>
                              <span className="text-amber-300">{String(val)}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

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

        {/* Empty state */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: '📊', label: 'Dynamic Programming', desc: '1D/2D table walkthrough with cell-by-cell computation' },
              { icon: '🌳', label: 'Trees & Graphs', desc: 'Node traversal with BFS/DFS path visualization' },
              { icon: '👆', label: 'Two Pointers', desc: 'Pointer movement with array state at each step' },
              { icon: '🔍', label: 'Binary Search', desc: 'Range narrowing with mid-point tracking' },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass rounded-2xl p-5 text-center cursor-default"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-semibold text-slate-300 text-sm mb-1.5">{item.label}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center">
        <p className="text-xs text-slate-700">
          AlgoViz — Powered by GPT-4o & LangChain • Made for LeetCode learners
        </p>
      </footer>
    </div>
  );
}
