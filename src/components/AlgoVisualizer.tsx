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
import GenericVisualizer from './visualizers/GenericVisualizer';

interface AlgoVisualizerProps {
  step: VisualizationStep;
  result: AnalysisResult;
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
      if (step.stackQueueState) return <StackQueueVisualizer state={{ ...step.stackQueueState, type: 'stack' }} stepNumber={step.stepNumber} />;
      break;
    case 'queue':
      if (step.stackQueueState) return <StackQueueVisualizer state={{ ...step.stackQueueState, type: 'queue' }} stepNumber={step.stepNumber} />;
      break;
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
    case 'hash-map':
      if (step.hashMapState) return <HashMapVisualizer state={step.hashMapState} stepNumber={step.stepNumber} />;
      break;
  }

  // Smart fallback: use any available state, regardless of category mismatch.
  // This prevents a blank canvas when GPT returns the right data under the wrong key.
  if (step.recursionTreeState) return <RecursionTreeVisualizer state={step.recursionTreeState} stepNumber={step.stepNumber} />;
  if (step.graphState?.nodes?.length) return <GraphVisualizer nodes={step.graphState.nodes} edges={step.graphState.edges ?? []} stepNumber={step.stepNumber} />;
  if (step.treeState) return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
  if (step.dpState?.table) return <DPVisualizer state={step.dpState} stepNumber={step.stepNumber} />;
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
