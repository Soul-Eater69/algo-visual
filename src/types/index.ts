export type AlgoCategory =
  | 'dynamic-programming'
  | 'tree'
  | 'graph'
  | 'array'
  | 'two-pointers'
  | 'sliding-window'
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'binary-search'
  | 'backtracking'
  | 'greedy'
  | 'string'
  | 'heap'
  | 'divide-and-conquer'
  | 'unknown';

export interface DPState {
  table: (number | string | null)[][];
  currentCell?: [number, number];
  dimension: '1d' | '2d';
  headers?: {
    rows?: string[];
    cols?: string[];
  };
  dependencies?: Array<[number, number]>;
}

export interface TreeNodeData {
  id: string;
  value: string | number;
  children?: TreeNodeData[];
  highlighted?: boolean;
  visited?: boolean;
  current?: boolean;
  color?: string;
}

export interface GraphNodeData {
  id: string;
  label: string;
  x?: number;
  y?: number;
  visited?: boolean;
  current?: boolean;
  inQueue?: boolean;
}

export interface GraphEdgeData {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  highlighted?: boolean;
}

export interface ArrayState {
  array: (number | string)[];
  pointers?: {
    name: string;
    index: number;
    color?: string;
  }[];
  highlighted?: number[];
  window?: [number, number];
  sorted?: number[];
  comparing?: number[];
  swapping?: [number, number];
}

export interface StackQueueState {
  items: (number | string)[];
  type: 'stack' | 'queue';
  operation?: 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek';
  operationValue?: number | string;
}

export interface RecursionNode {
  id: string;
  array: (number | string)[];
  phase: 'splitting' | 'merging' | 'sorted';
  current?: boolean;
  children?: RecursionNode[];
}

export interface RecursionTreeState {
  root: RecursionNode;
  phase: 'dividing' | 'merging';
}

export interface VisualizationStep {
  stepNumber: number;
  description: string;
  codeHighlight: number[];
  variables: Record<string, string | number | boolean | null>;
  dpState?: DPState;
  treeState?: TreeNodeData;
  graphState?: { nodes: GraphNodeData[]; edges: GraphEdgeData[] };
  arrayState?: ArrayState;
  stackQueueState?: StackQueueState;
  recursionTreeState?: RecursionTreeState;
}

export interface AnalysisResult {
  category: AlgoCategory;
  categoryLabel: string;
  problemName: string;
  complexity: {
    time: string;
    space: string;
  };
  explanation: string;
  steps: VisualizationStep[];
  totalSteps: number;
}
