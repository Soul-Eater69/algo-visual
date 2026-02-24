'use client';
import { useRef, useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { motion } from 'framer-motion';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedLines?: number[];
}

const PLACEHOLDER = `# Paste your LeetCode algorithm here

def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

function detectLanguage(code: string): string {
  if (!code.trim()) return 'python';
  if (code.includes('#include') || code.includes('int main') || code.includes('vector<')) return 'cpp';
  if (code.includes('public class') || code.includes('public static void main')) return 'java';
  if (code.includes('const ') || code.includes('function ') || code.includes('=>') || code.includes('let ') || code.includes('var ')) return 'javascript';
  return 'python';
}

const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace";
const FONT_SIZE = 13;
const LINE_HEIGHT = 22;
const PADDING = 16;

// Theme tweaks on top of atomOneDark
const codeStyle = {
  ...atomOneDark,
  'hljs': {
    ...atomOneDark['hljs'],
    background: 'transparent',
    padding: 0,
    margin: 0,
    overflow: 'visible',
  },
};

export default function CodeEditor({
  value,
  onChange,
  highlightedLines = [],
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  const language = detectLanguage(value);
  const displayCode = value || PLACEHOLDER;
  const isPlaceholder = !value;

  useEffect(() => {
    setLineCount((displayCode).split('\n').length);
  }, [displayCode]);

  const syncScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
    }
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = ta.scrollTop;
    }
  };

  // Tab key support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newVal);
      // restore caret after state update
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="relative h-full flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117]">
      {/* Mac-style titlebar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-[#0a0e17] flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-slate-600 font-mono">
            {language === 'java' ? 'Solution.java' : language === 'cpp' ? 'solution.cpp' : language === 'javascript' ? 'solution.js' : 'solution.py'}
          </span>
        </div>
        <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded-md font-mono uppercase">
          {language}
        </span>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers column */}
        <div
          ref={lineNumRef}
          className="flex-shrink-0 overflow-hidden bg-[#0a0e17] border-r border-slate-800/60 select-none"
          style={{ width: '44px' }}
        >
          <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
            {lines.map((num) => {
              const isHighlighted = highlightedLines.includes(num);
              return (
                <div
                  key={num}
                  style={{
                    height: LINE_HEIGHT,
                    lineHeight: `${LINE_HEIGHT}px`,
                    fontSize: FONT_SIZE,
                    fontFamily: FONT_FAMILY,
                    textAlign: 'right',
                    paddingRight: '10px',
                    color: isHighlighted ? '#a855f7' : '#374151',
                    transition: 'color 0.15s',
                    fontWeight: isHighlighted ? '600' : '400',
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>

        {/* Code area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Syntax-highlighted background layer */}
          <div
            ref={highlightRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            {/* Per-line highlight overlays */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: PADDING,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {lines.map((num) => {
                const isHighlighted = highlightedLines.includes(num);
                if (!isHighlighted) return null;
                return (
                  <motion.div
                    key={`hl-${num}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: (num - 1) * LINE_HEIGHT + PADDING,
                      left: 0,
                      right: 0,
                      height: LINE_HEIGHT,
                      background: 'rgba(168, 85, 247, 0.18)',
                      borderLeft: '3px solid rgba(168, 85, 247, 0.9)',
                    }}
                  />
                );
              })}
            </div>

            {/* Syntax highlighted code */}
            <div
              style={{
                padding: `${PADDING}px`,
                fontSize: FONT_SIZE,
                lineHeight: `${LINE_HEIGHT}px`,
                fontFamily: FONT_FAMILY,
                opacity: isPlaceholder ? 0.35 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <SyntaxHighlighter
                language={language}
                style={codeStyle}
                PreTag="div"
                CodeTag="div"
                useInlineStyles
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  fontSize: FONT_SIZE,
                  lineHeight: `${LINE_HEIGHT}px`,
                  fontFamily: FONT_FAMILY,
                  whiteSpace: 'pre',
                }}
              >
                {displayCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Transparent editing textarea — on top */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="absolute inset-0 w-full h-full resize-none outline-none border-none overflow-auto"
            style={{
              background: 'transparent',
              color: 'transparent',
              caretColor: '#c084fc',
              padding: PADDING,
              fontSize: FONT_SIZE,
              lineHeight: `${LINE_HEIGHT}px`,
              fontFamily: FONT_FAMILY,
              zIndex: 10,
              tabSize: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
}
