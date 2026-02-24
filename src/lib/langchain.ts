import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import type { AnalysisResult, AlgoCategory } from '@/types';

const CATEGORY_COLORS: Record<AlgoCategory, string> = {
  'dynamic-programming': '#a855f7',
  'tree': '#22c55e',
  'graph': '#3b82f6',
  'array': '#f59e0b',
  'two-pointers': '#ec4899',
  'sliding-window': '#14b8a6',
  'stack': '#f97316',
  'queue': '#8b5cf6',
  'linked-list': '#06b6d4',
  'binary-search': '#84cc16',
  'backtracking': '#ef4444',
  'greedy': '#eab308',
  'string': '#6366f1',
  'heap': '#10b981',
  'divide-and-conquer': '#f97316',
  'unknown': '#6b7280',
};

export { CATEGORY_COLORS };

const SYSTEM_PROMPT = `You are an expert algorithm analyst and computer science educator.
Your job is to analyze LeetCode algorithm code, categorize it, and generate detailed step-by-step visualization data.

You must respond with ONLY valid JSON matching the exact schema provided. No markdown, no explanation outside the JSON.`;

const ANALYSIS_PROMPT = `Analyze this algorithm code and generate visualization data.

Code:
\`\`\`
{code}
\`\`\`

Return a JSON object with this EXACT structure:
{{
  "category": one of ["dynamic-programming", "tree", "graph", "array", "two-pointers", "sliding-window", "stack", "queue", "linked-list", "binary-search", "backtracking", "greedy", "string", "heap", "divide-and-conquer", "unknown"],
  "categoryLabel": human readable category name,
  "problemName": inferred problem name or "Algorithm Analysis",
  "complexity": {{
    "time": "O(...)",
    "space": "O(...)"
  }},
  "explanation": "2-3 sentence explanation of what this algorithm does and its approach",
  "totalSteps": number,
  "steps": [
    {{
      "stepNumber": 1,
      "description": "Clear description of what happens in this step",
      "codeHighlight": [array of 1-indexed line numbers to highlight],
      "variables": {{"varName": value, ...}},

      // Include ONLY the relevant state for the category:

      // For dynamic-programming:
      "dpState": {{
        "dimension": "1d" or "2d",
        "table": [[values]] (1d = [[row]], 2d = [[row1], [row2]...]),
        "currentCell": [row, col] or null,
        "headers": {{"rows": [...], "cols": [...]}},
        "dependencies": [[row,col], ...] optional
      }},

      // For tree:
      "treeState": {{
        "id": "root",
        "value": value,
        "current": true/false,
        "visited": true/false,
        "highlighted": true/false,
        "children": [...]
      }},

      // For graph:
      "graphState": {{
        "nodes": [{{"id": "0", "label": "0", "visited": false, "current": false, "inQueue": false}},...],
        "edges": [{{"from": "0", "to": "1", "directed": true, "highlighted": false}}...]
      }},

      // For array, two-pointers, sliding-window, binary-search:
      "arrayState": {{
        "array": [values],
        "pointers": [{{"name": "left", "index": 0, "color": "#ec4899"}}, ...],
        "highlighted": [indices],
        "window": [start, end] or null,
        "comparing": [i, j] or [],
        "swapping": [i, j] or null
      }},

      // For stack, queue:
      "stackQueueState": {{
        "type": "stack" or "queue",
        "items": [values],
        "operation": "push"/"pop"/"enqueue"/"dequeue"/"peek" or null,
        "operationValue": value or null
      }},

      // For divide-and-conquer (merge sort, quick sort, etc.):
      "recursionTreeState": {{
        "phase": "dividing" or "merging",
        "root": {{
          "id": "unique-string-id",
          "array": [values in this subarray],
          "phase": "splitting" or "merging" or "sorted",
          "current": true or false,
          "children": [
            {{ same node structure, recursively }}
          ]
        }}
      }}
    }}
  ]
}}

IMPORTANT RULES:
1. Generate 8-14 meaningful steps that show the algorithm executing on a SMALL example input
2. For DP: use a small input like nums=[1,2,3,4,5] or s="abcde"
3. For Trees: show a tree with 5-7 nodes
4. For Graphs: show a graph with 4-6 nodes
5. For Arrays: use a small array of 5-8 elements
6. Each step must show actual state changes, not just descriptions
7. Make the visualization educational and show exactly HOW the algorithm works
8. codeHighlight lines must be valid 1-indexed line numbers from the actual code
9. variables should show the key variables at each step with their current values
10. The steps should tell a complete story of the algorithm execution
11. DIVIDE-AND-CONQUER RULES (merge sort, quick sort, etc.):
    - Always use category "divide-and-conquer"
    - Always use "recursionTreeState" (NOT arrayState) to show the recursion tree
    - Use input array of exactly 6-7 elements (e.g. [38, 27, 43, 3, 9, 82, 10] for merge sort)
    - Build the tree step by step: first show just the root, then add children as splits happen
    - Each node "id" must be unique (e.g. "root", "left", "right", "left-left", "left-right", etc.)
    - Mark the node currently being processed as "current": true; all others "current": false
    - Phase of root recursionTreeState: "dividing" during splits, "merging" during combines
    - Node phase: "splitting" while being split, "merging" while being merged, "sorted" when complete
    - Show at least 4 splitting steps and 4 merging steps so users see both phases clearly`;

export async function analyzeAlgorithm(code: string, apiKey: string): Promise<AnalysisResult> {
  const model = new ChatOpenAI({
    apiKey,
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 8000,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['human', ANALYSIS_PROMPT],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({ code });

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as AnalysisResult;
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
