import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TrIAStreamingMessage({ content, isComplete }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!content) return;

    // Se a mensagem está completa, mostrar tudo de uma vez
    if (isComplete) {
      setDisplayedContent(content);
      setCharIndex(content.length);
      return;
    }

    // Streaming: mostrar caracteres progressivamente
    if (charIndex < content.length) {
      const timer = setTimeout(() => {
        setCharIndex(charIndex + 1);
        setDisplayedContent(content.slice(0, charIndex + 1));
      }, 15); // Velocidade de digitação (ms por caractere)

      return () => clearTimeout(timer);
    }
  }, [charIndex, content, isComplete]);

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-4 py-3 max-w-2xl border border-slate-700 shadow-lg">
        <div className="text-sm text-slate-100 leading-relaxed">
          <ReactMarkdown
            className="prose prose-sm prose-slate dark max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-cyan-400 [&_a]:hover:text-cyan-300 [&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_pre]:bg-slate-900 [&_pre]:border [&_pre]:border-slate-700"
            components={{
              p: ({ children }) => <p className="my-2">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-1">{children}</li>,
              h1: ({ children }) => <h3 className="text-base font-bold mt-3 mb-2">{children}</h3>,
              h2: ({ children }) => <h4 className="text-sm font-bold mt-3 mb-2">{children}</h4>,
              h3: ({ children }) => <h5 className="text-xs font-bold mt-2 mb-1">{children}</h5>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-cyan-400 pl-3 my-2 text-slate-300 italic">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) => (
                inline ? (
                  <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-slate-900 border border-slate-700 rounded-lg p-3 my-2 overflow-x-auto">
                    <code className="text-cyan-300 font-mono text-xs">{children}</code>
                  </pre>
                )
              ),
            }}
          >
            {displayedContent}
          </ReactMarkdown>

          {/* Cursor piscando durante digitação */}
          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}