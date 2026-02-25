export type AlgoCategory =
  | 'dynamic-programming'
  | 'tree'
  | 'graph'
  | 'grid'
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
  | 'hash-map'
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

export type GridCellState = 'default' | 'visited' | 'current' | 'queued' | 'source' | 'highlighted' | 'blocked';

export interface GridCell {
  value: number | string;
  state?: GridCellState;
  label?: string;
}

export interface GridState {
  grid: GridCell[][];
  queue?: [number, number][];
  legend?: { value: string; label: string; color: string }[];
}

export interface HashMapEntry {
  key: string | number;
  value: string | number | null;
  highlighted?: boolean;  // currently being accessed/compared
  isNew?: boolean;         // just inserted this step
}

export interface HashMapState {
  entries: HashMapEntry[];
  currentKey?: string | number;
  operation?: 'insert' | 'lookup' | 'delete';
  result?: string | number | null;
}

export interface MergePointers {
  leftArray: (number | string)[];
  rightArray: (number | string)[];
  leftIdx: number;   // L pointer — current read position in leftArray
  rightIdx: number;  // R pointer — current read position in rightArray
  merged: (number | string)[];  // elements placed into result so far
}

export interface RecursionNode {
  id: string;
  array: (number | string)[];
  phase: 'splitting' | 'merging' | 'sorted';
  current?: boolean;
  children?: RecursionNode[];
  mergePointers?: MergePointers;
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
  gridState?: GridState;
  arrayState?: ArrayState;
  stackQueueState?: StackQueueState;
  recursionTreeState?: RecursionTreeState;
  hashMapState?: HashMapState;
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
