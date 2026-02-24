# ⚡ AlgoViz — AI-Powered Algorithm Visualizer

Paste any LeetCode algorithm code and watch it come alive with beautiful step-by-step visualizations powered by GPT-4o and LangChain.

## Features

- **AI Categorization** — Automatically detects: Dynamic Programming, Trees, Graphs, Arrays, Two Pointers, Sliding Window, Stack, Queue, Binary Search, Backtracking, Greedy, and more
- **Category-specific visualizations:**
  - 📊 **DP** — 1D/2D table walkthrough, cell-by-cell computation with dependency highlighting
  - 🌳 **Trees** — Node tree with traversal path, current/visited/highlighted states
  - 🕸️ **Graphs** — Auto-layout graph with BFS queue / DFS stack states
  - 👆 **Arrays / Two Pointers** — Pointer animations, swap highlighting, comparison tracking
  - 🪟 **Sliding Window** — Visual window with range tracking
  - 📚 **Stack / Queue** — Push/pop/enqueue/dequeue animations
- **Step-by-step playback** with variable inspection at each step
- **Keyboard navigation** — arrow keys + space bar
- **Adjustable playback speed** (1x, 2x, 3x)
- **Code highlighting** — active lines highlighted in sync with visualization steps
- Beautiful dark UI with glassmorphism and Framer Motion animations

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — animations
- **LangChain + GPT-4o** — AI code analysis, categorization, step extraction
- **Custom SVG visualizers** for Trees and Graphs

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### API Key Setup

You need an OpenAI API key (GPT-4o access). You can:
1. Enter it in the UI when prompted (saved to localStorage)
2. Or set it as an environment variable:

```bash
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY=sk-...
```

## Usage

1. Paste your LeetCode algorithm code into the editor
2. Click **Visualize Algorithm**
3. The AI will categorize and generate visualization steps
4. Use the step controls to walk through the execution
5. Watch your algorithm come to life!
