import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import type { AnalysisResult, AlgoCategory } from '@/types';

const CATEGORY_COLORS: Record<AlgoCategory, string> = {
  'dynamic-programming': '#a855f7',
  'tree': '#22c55e',
  'graph': '#3b82f6',
  'grid': '#f97316',
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
  'hash-map': '#06b6d4',
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
  "category": one of ["dynamic-programming", "tree", "graph", "grid", "array", "two-pointers", "sliding-window", "stack", "queue", "linked-list", "binary-search", "backtracking", "greedy", "string", "heap", "divide-and-conquer", "hash-map", "unknown"],
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
      "dpState": {{ "dimension": "1d" or "2d", "table": [[values]], "currentCell": [row,col] or null, "headers": {{"rows":[...],"cols":[...]}}, "dependencies": [[row,col],...] }},
      "treeState": {{ "id": "root", "value": value, "current": true/false, "visited": true/false, "highlighted": true/false, "children": [...] }},
      "graphState": {{ "nodes": [{{"id":"0","label":"0","visited":false,"current":false,"inQueue":false}},...], "edges": [{{"from":"0","to":"1","directed":true,"highlighted":false}},...] }},
      "gridState": {{ "grid": [[{{"value":0,"state":"default","label":""}},...],...],"queue":[[r,c],...] or [],"legend":[{{"value":"0","label":"Empty","color":"#475569"}},{{"value":"1","label":"Fresh","color":"#22c55e"}},{{"value":"2","label":"Rotten","color":"#ef4444"}}] }},
      "arrayState": {{ "array": [values], "pointers": [{{"name":"left","index":0,"color":"#ec4899"}},...], "highlighted": [indices], "window": [start,end] or null, "comparing": [i,j] or [], "swapping": [i,j] or null }},
      "stackQueueState": {{ "type": "stack" or "queue", "items": [values], "operation": "push"/"pop"/"enqueue"/"dequeue"/"peek" or null, "operationValue": value or null }},
      "recursionTreeState": {{ "phase": "dividing" or "merging", "root": {{ "id": "unique-id", "array": [values], "phase": "splitting"/"merging"/"sorted", "current": true/false, "children": [...] }} }},
      "hashMapState": {{ "entries": [{{"key": key, "value": value, "highlighted": true/false, "isNew": true/false}},...], "currentKey": key or null, "operation": "insert"/"lookup"/"delete" or null, "result": value or null }}
    }}
  ]
}}

IMPORTANT RULES:
1. Generate 6-10 meaningful steps total — keep the response compact
2. For DP: use a small input like nums=[1,2,3,4,5] or s="abcde"
3. For Trees: show a tree with 5-7 nodes
4. For Graphs (non-grid): use AT MOST 6 nodes and 6 steps total. NEVER use "graph" for grid/matrix problems.
4b. GRID PROBLEMS (Rotting Oranges, Number of Islands, Unique Paths, Word Search, Flood Fill, etc.):
    - Always use category "grid" and always use "gridState" (NOT graphState)
    - Use a tiny example grid of at most 3 rows x 4 cols
    - Each cell: {{"value": 0/1/2/..., "state": "default"/"visited"/"current"/"queued"/"source"/"highlighted"/"blocked", "label": ""}}
    - States: "source" = rotten/start, "queued" = in BFS queue, "visited" = processed, "current" = being processed now
    - "queue" field = [[r,c],...] array of cells currently in the BFS queue
    - "legend" = explain what each numeric value means (e.g. 0=empty, 1=fresh, 2=rotten)
    - Show 6-8 steps: initial grid, each BFS wave, final result
5. For Arrays: use a small array of 5-8 elements
6. Each step must show actual state changes, not just descriptions
7. Make the visualization educational and show exactly HOW the algorithm works
8. codeHighlight lines must be valid 1-indexed line numbers from the actual code
9. variables should show the key variables at each step with their current values
10. The steps should tell a complete story of the algorithm execution
11. OUTPUT ONLY THE JSON OBJECT — no // comments, no prose before or after
12. HASH-MAP RULES (Two Sum, Group Anagrams, Subarray Sum, Valid Anagram, Longest Consecutive, etc.):
    - Always use category "hash-map"
    - ALWAYS include BOTH "arrayState" AND "hashMapState" in every step — the UI shows them side by side
    - "arrayState": the input array with a pointer "i" at the current index being processed
    - "hashMapState": the map contents at that moment
    - Show entries accumulating as the algorithm runs (start empty, add one-by-one)
    - For each step, set "isNew": true only on the entry just inserted that step; all others false
    - Set "highlighted": true and "operation": "lookup" on the entry being checked/matched
    - Set "currentKey" to the key being processed; "result" to the found value when a match occurs
    - Use a small example: nums=[2,7,11,15], target=9 for Two Sum
    - Show at least 6 steps: initial state, each insertion with lookup check
13. STACK/QUEUE RULES:
    - ALWAYS include BOTH "arrayState" AND "stackQueueState" in every step — the UI shows them side by side
    - "arrayState": the input array with a pointer "i" at the current index being processed
    - "stackQueueState": the current stack/queue contents with the operation being performed
14. DIVIDE-AND-CONQUER RULES (merge sort, quick sort, etc.):
    - Always use category "divide-and-conquer"
    - Always use "recursionTreeState" (NOT arrayState) to show the recursion tree
    - Use input array of exactly 6-7 elements (e.g. [38, 27, 43, 3, 9, 82, 10] for merge sort)
    - Build the tree step by step: first show just the root, then add children as splits happen
    - Each node "id" must be unique (e.g. "root", "left", "right", "left-left", "left-right", etc.)
    - Mark the node currently being processed as "current": true; all others "current": false
    - Phase of root recursionTreeState: "dividing" during splits, "merging" during combines
    - Node phase: "splitting" while being split, "merging" while being merged, "sorted" when complete
    - DURING EVERY MERGE STEP: the current merging node MUST include "mergePointers":
        "mergePointers": {
          "leftArray": [...],    // sorted values from left child
          "rightArray": [...],   // sorted values from right child
          "leftIdx": N,          // L pointer — which index we are currently reading from leftArray
          "rightIdx": N,         // R pointer — which index we are currently reading from rightArray
          "merged": [...]        // elements already placed into the merged result so far
        }
    - Show one step per element placed: advance leftIdx or rightIdx by 1 each step, append taken value to merged
    - Show at least 4 splitting steps then at least 6 merging steps (one per element comparison) so users watch L/R pointers move`;

export async function analyzeAlgorithm(code: string, apiKey: string): Promise<AnalysisResult> {
  const model = new ChatOpenAI({
    apiKey,
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 16000,
    modelKwargs: { response_format: { type: 'json_object' } },
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['human', ANALYSIS_PROMPT],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const raw = await chain.invoke({ code });

  try {
    const json = sanitizeJSON(extractJSON(raw));
    const parsed = JSON.parse(json) as AnalysisResult;
    return parsed;
  } catch (e) {
    const preview = raw.slice(0, 300);
    throw new Error(`Failed to parse AI response. Preview: ${preview}`);
  }
}

/**
 * Extract the outermost JSON object from a string that may contain
 * markdown fences, surrounding text, or // comments from the prompt template.
 */
function extractJSON(raw: string): string {
  // Strip markdown code fences
  let s = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Strip // line-comments (GPT sometimes echoes them from the prompt template).
  // Walk char-by-char to avoid stripping // that appear inside string values.
  s = stripLineComments(s);

  // Find first '{'
  const start = s.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');

  // Walk forward counting braces, respecting strings
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        // Strip trailing commas before ] or } — invalid JSON GPT sometimes emits
        return s.slice(start, i + 1).replace(/,(\s*[}\]])/g, '$1');
      }
    }
  }

  throw new Error('Unterminated JSON object (response may have been cut off)');
}

/**
 * Replace literal control characters (real newlines, tabs, etc.) that appear
 * INSIDE JSON strings with their proper JSON escape sequences.
 * GPT sometimes emits "description": "line1\nline2" with actual newlines,
 * which is invalid JSON.
 */
function sanitizeJSON(s: string): string {
  let out = '';
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const code = s.charCodeAt(i);
    if (escape) { out += ch; escape = false; continue; }
    if (ch === '\\' && inString) { out += ch; escape = true; continue; }
    if (ch === '"') { inString = !inString; out += ch; continue; }
    if (inString) {
      if (code === 10) { out += '\\n'; continue; }
      if (code === 13) { out += '\\r'; continue; }
      if (code === 9)  { out += '\\t'; continue; }
      if (code < 0x20) { out += `\\u${code.toString(16).padStart(4, '0')}`; continue; }
    }
    out += ch;
  }
  return out;
}

/** Remove // single-line comments while respecting quoted strings. */
function stripLineComments(s: string): string {
  let out = '';
  let inString = false;
  let escape = false;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (escape) { out += ch; escape = false; i++; continue; }
    if (ch === '\\' && inString) { out += ch; escape = true; i++; continue; }
    if (ch === '"') { inString = !inString; out += ch; i++; continue; }
    // Outside a string: check for // comment
    if (!inString && ch === '/' && s[i + 1] === '/') {
      // Skip everything to end of line
      while (i < s.length && s[i] !== '\n') i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}
