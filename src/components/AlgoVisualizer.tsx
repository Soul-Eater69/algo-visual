'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, VisualizationStep } from '@/types';
import DPVisualizer from './visualizers/DPVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import RecursionTreeVisualizer from './visualizers/RecursionTreeVisualizer';
import HashMapVisualizer from './visualizers/HashMapVisualizer';
import GridVisualizer from './visualizers/GridVisualizer';
import GenericVisualizer from './visualizers/GenericVisualizer';

interface AlgoVisualizerProps {
  step: VisualizationStep;
  result: AnalysisResult;
}

/** Split view: input data on top, auxiliary memory on bottom. */
function DualPane({
  top, bottom, topLabel, bottomLabel,
}: {
  top: React.ReactNode;
  bottom: React.ReactNode;
  topLabel: string;
  bottomLabel: string;
}) {
  return (
    <div className="flex flex-col w-full divide-y divide-white/5">
      <div className="w-full">
        <div className="px-4 pt-2.5 pb-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 border border-slate-700/60 rounded px-1.5 py-0.5">
            {topLabel}
          </span>
        </div>
        {top}
      </div>
      <div className="w-full">
        <div className="px-4 pt-2.5 pb-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 border border-slate-700/60 rounded px-1.5 py-0.5">
            {bottomLabel}
          </span>
        </div>
        {bottom}
      </div>
    </div>
  );
}

function VisualizerContent({ step, result }: AlgoVisualizerProps) {
  const { category } = result;

  // Primary routing by category
  switch (category) {
    case 'dynamic-programming':
      if (step.dpState) return <DPVisualizer state={step.dpState} stepNumber={step.stepNumber} />;
      break;
    case 'tree':
      if (step.treeState) return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      break;
    case 'graph':
      if (step.graphState) return <GraphVisualizer nodes={step.graphState.nodes ?? []} edges={step.graphState.edges ?? []} stepNumber={step.stepNumber} />;
      break;
    case 'grid':
      if (step.gridState) return <GridVisualizer state={step.gridState} stepNumber={step.stepNumber} />;
      break;
    case 'divide-and-conquer':
      if (step.recursionTreeState) return <RecursionTreeVisualizer state={step.recursionTreeState} stepNumber={step.stepNumber} />;
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      break;
    case 'array':
    case 'greedy':
    case 'string':
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      break;
    case 'two-pointers':
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="two-pointers" />;
      break;
    case 'sliding-window':
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="sliding-window" />;
      break;
    case 'binary-search':
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="binary-search" />;
      break;

    case 'stack':
    case 'queue': {
      const sqState = step.stackQueueState
        ? { ...step.stackQueueState, type: category as 'stack' | 'queue' }
        : null;
      // Dual view: input array being iterated + stack/queue memory
      if (sqState && step.arrayState) {
        return (
          <DualPane
            topLabel="Input — iterating"
            bottomLabel={category === 'stack' ? 'Stack memory' : 'Queue memory'}
            top={<ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />}
            bottom={<StackQueueVisualizer state={sqState} stepNumber={step.stepNumber} />}
          />
        );
      }
      if (sqState) return <StackQueueVisualizer state={sqState} stepNumber={step.stepNumber} />;
      break;
    }

    case 'heap':
      if (step.treeState) return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      break;
    case 'linked-list':
      if (step.arrayState) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      break;
    case 'backtracking':
      if (step.treeState) return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      break;

    case 'hash-map': {
      // Dual view: input array being iterated + hash map memory
      if (step.hashMapState && step.arrayState) {
        return (
          <DualPane
            topLabel="Input — iterating"
            bottomLabel="HashMap memory"
            top={<ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />}
            bottom={<HashMapVisualizer state={step.hashMapState} stepNumber={step.stepNumber} />}
          />
        );
      }
      if (step.hashMapState) return <HashMapVisualizer state={step.hashMapState} stepNumber={step.stepNumber} />;
      break;
    }
  }

  // Smart fallback: use any available state, regardless of category mismatch.
  if (step.recursionTreeState) return <RecursionTreeVisualizer state={step.recursionTreeState} stepNumber={step.stepNumber} />;
  if (step.gridState?.grid?.length) return <GridVisualizer state={step.gridState} stepNumber={step.stepNumber} />;
  if (step.graphState?.nodes?.length) return <GraphVisualizer nodes={step.graphState.nodes} edges={step.graphState.edges ?? []} stepNumber={step.stepNumber} />;
  if (step.treeState) return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
  if (step.dpState?.table) return <DPVisualizer state={step.dpState} stepNumber={step.stepNumber} />;
  // Dual fallback: hashMap + array
  if (step.hashMapState && step.arrayState) {
    return (
      <DualPane
        topLabel="Input — iterating"
        bottomLabel="HashMap memory"
        top={<ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />}
        bottom={<HashMapVisualizer state={step.hashMapState} stepNumber={step.stepNumber} />}
      />
    );
  }
  // Dual fallback: stack/queue + array
  if (step.stackQueueState && step.arrayState) {
    return (
      <DualPane
        topLabel="Input — iterating"
        bottomLabel={`${step.stackQueueState.type} memory`}
        top={<ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />}
        bottom={<StackQueueVisualizer state={step.stackQueueState} stepNumber={step.stepNumber} />}
      />
    );
  }
  if (step.hashMapState) return <HashMapVisualizer state={step.hashMapState} stepNumber={step.stepNumber} />;
  if (step.stackQueueState) return <StackQueueVisualizer state={step.stackQueueState} stepNumber={step.stepNumber} />;
  if (step.arrayState?.array) return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;

  return <GenericVisualizer step={step} category={category} />;
}

export default function AlgoVisualizer({ step, result }: AlgoVisualizerProps) {
  return (
    <div className="relative w-full">
      <AnimatePresence mode="sync">
        <motion.div
          key={step.stepNumber}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="w-full flex items-center justify-center"
        >
          <VisualizerContent step={step} result={result} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
