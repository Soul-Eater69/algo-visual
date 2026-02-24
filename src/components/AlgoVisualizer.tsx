'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, VisualizationStep } from '@/types';
import DPVisualizer from './visualizers/DPVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import GenericVisualizer from './visualizers/GenericVisualizer';

interface AlgoVisualizerProps {
  step: VisualizationStep;
  result: AnalysisResult;
}

function VisualizerContent({ step, result }: AlgoVisualizerProps) {
  const { category } = result;

  switch (category) {
    case 'dynamic-programming':
      if (step.dpState) {
        return <DPVisualizer state={step.dpState} stepNumber={step.stepNumber} />;
      }
      break;

    case 'tree':
      if (step.treeState) {
        return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      }
      break;

    case 'graph':
      if (step.graphState) {
        return (
          <GraphVisualizer
            nodes={step.graphState.nodes}
            edges={step.graphState.edges}
            stepNumber={step.stepNumber}
          />
        );
      }
      break;

    case 'array':
    case 'greedy':
    case 'string':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      }
      break;

    case 'two-pointers':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="two-pointers" />;
      }
      break;

    case 'sliding-window':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="sliding-window" />;
      }
      break;

    case 'binary-search':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="binary-search" />;
      }
      break;

    case 'stack':
      if (step.stackQueueState) {
        return <StackQueueVisualizer state={{ ...step.stackQueueState, type: 'stack' }} stepNumber={step.stepNumber} />;
      }
      break;

    case 'queue':
      if (step.stackQueueState) {
        return <StackQueueVisualizer state={{ ...step.stackQueueState, type: 'queue' }} stepNumber={step.stepNumber} />;
      }
      break;

    case 'heap':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      }
      if (step.treeState) {
        return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      }
      break;

    case 'linked-list':
      if (step.arrayState) {
        return <ArrayVisualizer state={step.arrayState} stepNumber={step.stepNumber} mode="array" />;
      }
      break;

    case 'backtracking':
      if (step.treeState) {
        return <TreeVisualizer treeData={step.treeState} stepNumber={step.stepNumber} />;
      }
      break;
  }

  return <GenericVisualizer step={step} category={category} />;
}

export default function AlgoVisualizer({ step, result }: AlgoVisualizerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.stepNumber}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full h-full flex items-center justify-center"
      >
        <VisualizerContent step={step} result={result} />
      </motion.div>
    </AnimatePresence>
  );
}
