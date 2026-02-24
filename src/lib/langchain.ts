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
      "dpState": {{ "dimension": "1d" or "2d", "table": [[values]], "currentCell": [row,col] or null, "headers": {{"rows":[...],"cols":[...]}}, "dependencies": [[row,col],...] }},
      "treeState": {{ "id": "root", "value": value, "current": true/false, "visited": true/false, "highlighted": true/false, "children": [...] }},
      "graphState": {{ "nodes": [{{"id":"0","label":"0","visited":false,"current":false,"inQueue":false}},...], "edges": [{{"from":"0","to":"1","directed":true,"highlighted":false}},...] }},
      "arrayState": {{ "array": [values], "pointers": [{{"name":"left","index":0,"color":"#ec4899"}},...], "highlighted": [indices], "window": [start,end] or null, "comparing": [i,j] or [], "swapping": [i,j] or null }},
      "stackQueueState": {{ "type": "stack" or "queue", "items": [values], "operation": "push"/"pop"/"enqueue"/"dequeue"/"peek" or null, "operationValue": value or null }},
      "recursionTreeState": {{ "phase": "dividing" or "merging", "root": {{ "id": "unique-id", "array": [values], "phase": "splitting"/"merging"/"sorted", "current": true/false, "children": [...] }} }}
    }}
  ]
}}

IMPORTANT RULES:
1. Generate 6-10 meaningful steps total — keep the response compact
2. For DP: use a small input like nums=[1,2,3,4,5] or s="abcde"
3. For Trees: show a tree with 5-7 nodes
4. For Graphs: use AT MOST 6 nodes — for grid problems (e.g. Rotting Oranges) model only a 2x3 sub-grid; label cells "r0c0","r0c1", etc. Maximum 6 steps for graph problems.
5. For Arrays: use a small array of 5-8 elements
6. Each step must show actual state changes, not just descriptions
7. Make the visualization educational and show exactly HOW the algorithm works
8. codeHighlight lines must be valid 1-indexed line numbers from the actual code
9. variables should show the key variables at each step with their current values
10. The steps should tell a complete story of the algorithm execution
11. OUTPUT ONLY THE JSON OBJECT — no // comments, no prose before or after
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
    maxTokens: 16000,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['human', ANALYSIS_PROMPT],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const raw = await chain.invoke({ code });

  try {
    const json = extractJSON(raw);
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
      if (depth === 0) return s.slice(start, i + 1);
    }
  }

  throw new Error('Unterminated JSON object (response may have been cut off)');
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
