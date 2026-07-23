import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, RotateCcw, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const AGENT_NAME = 'recomendador';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function RecomendadorChat() {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  // Cria a conversa uma única vez
  const createConversation = useCallback(async () => {
    try {
      const convo = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: 'Recomendação de Prestador', description: 'Sugestões personalizadas' },
      });
      setConversation(convo);
    } catch (err) {
      console.error('[Recomendador] erro ao criar conversa:', err);
    }
  }, []);

  useEffect(() => {
    createConversation();
  }, [createConversation]);

  // Assina atualizações da conversa
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      // Para de mostrar "digitando" quando há resposta do assistente
      const last = (data.messages || []).slice(-1)[0];
      if (last?.role === 'assistant' && last?.content) {
        setIsTyping(false);
      }
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversation || isTyping) return;
    setInput('');
    setIsTyping(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (err) {
      console.error('[Recomendador] erro ao enviar:', err);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    setMessages([]);
    createConversation();
  };

  const suggestions = [
    'Qual prestador combina comigo?',
    'Recomende um eletricista',
    'Quem eu devo contratar para limpeza?',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-3 md:px-4 bg-card">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">Recomendador</p>
              <p className="text-xs text-muted-foreground truncate">
                {isTyping ? 'Analisando seu histórico…' : 'Sugestões personalizadas'}
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRestart} aria-label="Nova conversa">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-4">
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-4">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recomendador de Prestadores</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Com base nos seus pedidos, favoritos e avaliações, sugiro o prestador ideal pra você.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-left text-sm px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id || genId()}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="text-sm prose prose-sm max-w-none dark:prose-invert">
                  {msg.content || ''}
                </ReactMarkdown>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.tool_calls?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {msg.tool_calls.map((tc, i) => (
                    <div key={i} className="text-xs text-muted-foreground italic">
                      ⚙ {tc.name || 'ferramenta'}…
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card p-3 md:p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte qual prestador combina com você…"
            disabled={isTyping || !conversation}
            className="flex-1 min-h-[44px]"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || !conversation}
            size="icon"
            className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}