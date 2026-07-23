import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, X, ArrowUp } from 'lucide-react';
import TrIAMessageBubble from './TrIAMessageBubble.jsx';

const QUICK_PROMPTS = {
  pt: [
    { label: 'Encontrar eletricista', icon: '⚡' },
    { label: 'Limpar minha casa', icon: '🏠' },
    { label: 'Reformar banheiro', icon: '🔧' },
    { label: 'Jardinagem e paisagismo', icon: '🌿' },
  ],
  en: [
    { label: 'Find an electrician', icon: '⚡' },
    { label: 'House cleaning', icon: '🏠' },
    { label: 'Bathroom renovation', icon: '🔧' },
    { label: 'Gardening and landscaping', icon: '🌿' },
  ],
  es: [
    { label: 'Encontrar electricista', icon: '⚡' },
    { label: 'Limpiar mi casa', icon: '🏠' },
    { label: 'Reformar el baño', icon: '🔧' },
    { label: 'Jardinería y paisajismo', icon: '🌿' },
  ],
  fr: [
    { label: 'Trouver un électricien', icon: '⚡' },
    { label: 'Nettoyer ma maison', icon: '🏠' },
    { label: 'Rénover la salle de bain', icon: '🔧' },
    { label: 'Jardinage et paysagisme', icon: '🌿' },
  ],
};

const WELCOME_TITLE = {
  pt: 'Como posso resolver pra você hoje?',
  en: 'How can I help you today?',
  es: '¿Cómo puedo ayudarte hoy?',
  fr: 'Comment puis-je vous aider aujourd\'hui?',
};

const PLACEHOLDER = {
  pt: 'Escreva aqui o que você precisa resolver…',
  en: 'Write here what you need to solve…',
  es: 'Escribe aquí lo que necesitas resolver…',
  fr: 'Écrivez ici ce dont vous avez besoin…',
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0 shadow-brand">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-[#1E1208] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 ml-2">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function TrIAChatArea({
  messages,
  onSendMessage,
  isLoading,
  error,
  onErrorDismiss,
  language = 'pt',
  streamingId,
  onStreamComplete,
}) {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState(1);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    const newRows = Math.min(Math.ceil(e.target.scrollHeight / 24), 5);
    setRows(newRows);
    e.target.style.height = '';
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    setRows(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = QUICK_PROMPTS[language] || QUICK_PROMPTS.pt;
  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-950/60 border border-red-800/40 rounded-xl flex items-start gap-3 text-sm text-red-300 animate-fade-in">
          <span className="flex-1">{error}</span>
          <button onClick={onErrorDismiss} className="shrink-0 text-red-500 hover:text-red-300 transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-1">
        {isEmpty && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary mx-auto mb-5 flex items-center justify-center shadow-brand">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#F0D8B0] mb-2 max-w-xs leading-snug">
              {WELCOME_TITLE[language]}
            </h2>
            <p className="text-[#6A5040] text-sm max-w-xs mb-8">
              O TryA conecta você aos melhores profissionais de Trancoso.
            </p>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickPrompts.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => onSendMessage(label)}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-left text-xs p-3 rounded-xl bg-white/4 hover:bg-orange-900/30 text-[#C8A882] hover:text-[#F2DEC4] transition-all border border-white/5 hover:border-orange-700/40 active:scale-95 disabled:opacity-50"
                >
                  <span>{icon}</span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <TrIAMessageBubble
                key={message.id || idx}
                message={message}
                isStreaming={message.id === streamingId}
                onStreamComplete={onStreamComplete}
              />
            ))}
            {isLoading && <TypingDots />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 md:px-8 pb-6 pt-3">
        <div className="relative max-w-3xl mx-auto">
          <div className={`flex items-end gap-3 bg-[#1A1008] border rounded-2xl px-4 py-3 transition-all ${
            isLoading ? 'border-white/5' : 'border-white/8 focus-within:border-orange-600/50 focus-within:shadow-lg focus-within:shadow-orange-900/20'
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={rows}
              placeholder={PLACEHOLDER[language]}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[#F2DEC4] placeholder-[#4A3828] text-sm leading-6 resize-none focus:outline-none disabled:opacity-50 max-h-[120px]"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-brand-primary hover:bg-orange-700 text-white rounded-full transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-brand mb-0.5"
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[9px] text-[#3A2818] mt-2">
            Trancoso Resolve · A gente resolve. · Enter para enviar, Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
