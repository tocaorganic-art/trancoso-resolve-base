import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TrIAStreamingMessage({ content, isComplete, onComplete }) {
  const [displayed, setDisplayed] = useState(isComplete ? content : '');
  const [done, setDone] = useState(isComplete);
  const idxRef = useRef(isComplete ? (content?.length || 0) : 0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isComplete) {
      setDisplayed(content || '');
      setDone(true);
      return;
    }
    if (!content) return;

    // Streaming character by character
    const tick = () => {
      const idx = idxRef.current;
      if (idx >= content.length) {
        setDone(true);
        onComplete?.();
        return;
      }
      // Batch multiple characters per frame for longer messages
      const batchSize = content.length > 500 ? 4 : 2;
      const next = Math.min(idx + batchSize, content.length);
      idxRef.current = next;
      setDisplayed(content.slice(0, next));
      timerRef.current = setTimeout(tick, 12);
    };

    timerRef.current = setTimeout(tick, 12);
    return () => clearTimeout(timerRef.current);
  }, [content, isComplete]);

  return (
    <div className="bg-[#1A1008] rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl border border-white/6 shadow-sm">
      <div className="text-sm text-[#EDD8B0] leading-relaxed">
        <ReactMarkdown
          className="prose prose-sm max-w-none"
          components={{
            p: ({ children }) => <p className="my-1.5 text-[#EDD8B0]">{children}</p>,
            ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-[#EDD8B0]">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-[#EDD8B0]">{children}</ol>,
            li: ({ children }) => <li className="text-[#EDD8B0]">{children}</li>,
            h1: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1.5 text-[#F2DEC4]">{children}</h3>,
            h2: ({ children }) => <h4 className="text-sm font-bold mt-3 mb-1 text-[#F2DEC4]">{children}</h4>,
            h3: ({ children }) => <h5 className="text-xs font-bold mt-2 mb-1 text-[#F2DEC4]">{children}</h5>,
            strong: ({ children }) => <strong className="font-semibold text-[#F2DEC4]">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-orange-600/60 pl-3 my-2 text-[#B89A72] italic">
                {children}
              </blockquote>
            ),
            code: ({ inline, children }) =>
              inline ? (
                <code className="bg-black/30 px-1.5 py-0.5 rounded text-orange-300 font-mono text-xs">{children}</code>
              ) : (
                <pre className="bg-black/30 border border-white/6 rounded-xl p-3 my-2 overflow-x-auto">
                  <code className="text-orange-300 font-mono text-xs">{children}</code>
                </pre>
              ),
            a: ({ href, children }) => (
              <a href={href} className="text-orange-400 hover:text-orange-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {displayed}
        </ReactMarkdown>

        {!done && (
          <span className="inline-block w-0.5 h-4 bg-orange-400 ml-0.5 align-middle animate-pulse rounded-full" />
        )}
      </div>
    </div>
  );
}
