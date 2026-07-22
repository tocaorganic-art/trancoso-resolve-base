import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TrIASidebar from './TrIASidebar.jsx';
import TrIAChatArea from './TrIAChatArea.jsx';
import LanguageSelector from './LanguageSelector.jsx';

const STORAGE_KEY = 'tria_conversations_v2';

const SYSTEM_PROMPT = `Você é a TryA, assistente virtual inteligente do Trancoso Resolve — o marketplace de serviços locais em Trancoso, Bahia.

Sua missão é resolver os problemas dos usuários de forma rápida, calorosa e eficiente.

Você ajuda:
- Moradores a encontrar prestadores de serviço (elétrica, limpeza, jardinagem, reformas, pintura, encanamento, etc.)
- Empresários e donos de imóveis a contratar profissionais verificados
- Turistas a resolver necessidades durante a estadia em Trancoso
- Prestadores a entender como funciona a plataforma e seus planos

O que você sabe fazer:
- Recomendar categorias de serviço e explicar o processo de solicitação de orçamento
- Orientar sobre agendamentos e como funciona o match com prestadores
- Explicar os planos (Básico, Profissional, Elite) e benefícios de cada um
- Responder dúvidas sobre verificação de identidade e antecedentes dos profissionais
- Dar informações sobre Trancoso, o Quadrado, e a região da Costa do Descobrimento
- Auxiliar com roteiros e recomendações locais para turistas

Tom de voz:
- Descontraído e profissional — como um vizinho prestativo e confiante
- Use sempre "você" (nunca "sr." ou "sra.")
- Seja direto e objetivo, mas caloroso
- Nunca corporativo ou robotizado
- Lembre-se da promessa da marca: "A gente resolve."

Regras importantes:
- Responda SEMPRE em português do Brasil (pt-BR)
- Nunca invente informações sobre prestadores específicos ou preços exatos
- Se não souber algo, reconheça e ofereça como alternativa buscar na plataforma
- Use markdown para formatar respostas longas (listas, negrito para termos importantes)
- Seja conciso — respostas de 2-4 parágrafos são ideais`;

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveConversations(convos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
  } catch {
    // quota exceeded — ignore
  }
}

export default function TocaTrIAPremium() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('pt');
  const [streamingId, setStreamingId] = useState(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  useEffect(() => {
    const convos = loadConversations();
    if (convos.length > 0) {
      setConversations(convos);
      setActiveId(convos[0].id);
      setMessages(convos[0].messages || []);
    } else {
      handleNewConversation(true);
    }
  }, []);

  const handleNewConversation = useCallback((silent = false) => {
    const newConvo = {
      id: genId(),
      name: 'Nova Conversa',
      createdAt: new Date().toISOString(),
      preview: '',
      messages: []
    };
    setConversations(prev => {
      const updated = [newConvo, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveId(newConvo.id);
    setMessages([]);
    if (!silent) setError(null);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setConversations(prev => {
      const convo = prev.find(c => c.id === id);
      if (convo) setMessages(convo.messages || []);
      return prev;
    });
    setActiveId(id);
    setError(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback((id) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveConversations(updated);
      if (activeIdRef.current === id) {
        if (updated.length > 0) {
          setActiveId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          handleNewConversation(true);
        }
      }
      return updated;
    });
  }, [handleNewConversation]);

  const updateConversation = useCallback((id, newMessages) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const lastMsg = newMessages[newMessages.length - 1];
        const preview = lastMsg ? lastMsg.content.slice(0, 60) : '';
        const name = c.name === 'Nova Conversa' && newMessages.length >= 1
          ? newMessages[0].content.slice(0, 40) + (newMessages[0].content.length > 40 ? '…' : '')
          : c.name;
        return { ...c, name, preview, messages: newMessages };
      });
      saveConversations(updated);
      return updated;
    });
  }, []);

  const handleSendMessage = useCallback(async (content) => {
    if (!activeId || !content.trim()) return;

    const userMsg = {
      id: genId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    updateConversation(activeId, nextMessages);
    setIsLoading(true);
    setError(null);

    try {
      let textToSend = content.trim();

      // Traduzir para pt-BR se necessário
      if (language !== 'pt') {
        try {
          const res = await base44.functions.invoke('tocaTriaTranslator', {
            text: textToSend,
            sourceLanguage: language,
            targetLanguage: 'pt'
          });
          textToSend = res?.data?.translated || res?.translated || textToSend;
        } catch {
          // continua com original
        }
      }

      // Montar histórico para o Claude (máx 20 mensagens para economizar tokens)
      const historyMsgs = nextMessages.slice(-20).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      // Substitui a última mensagem do usuário pela versão traduzida
      if (historyMsgs.length > 0) {
        historyMsgs[historyMsgs.length - 1] = { role: 'user', content: textToSend };
      }

      const result = await base44.functions.invoke('callClaude', {
        messages: historyMsgs,
        systemPrompt: SYSTEM_PROMPT
      });

      const responseText = result?.message || result?.data?.message || '';
      if (!responseText) throw new Error('Resposta vazia do assistente');

      // Se idioma não é pt, traduzir resposta de volta
      let displayText = responseText;
      if (language !== 'pt') {
        try {
          const res = await base44.functions.invoke('tocaTriaTranslator', {
            text: responseText,
            sourceLanguage: 'pt',
            targetLanguage: language
          });
          displayText = res?.data?.translated || res?.translated || responseText;
        } catch {
          // usa pt mesmo
        }
      }

      const assistantMsg = {
        id: genId(),
        role: 'assistant',
        content: displayText,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      updateConversation(activeId, finalMessages);
      setStreamingId(assistantMsg.id);
    } catch (err) {
      console.error('[TrIA] Erro ao enviar:', err);
      const isAuthError = err?.status === 401 || err?.message?.includes('autenticad') || err?.message?.includes('401');
      setError(
        isAuthError
          ? 'Você precisa estar logado para usar a TryA. Faça login e tente novamente.'
          : 'Não consegui processar sua mensagem. Tente novamente em instantes.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeId, messages, language, updateConversation]);

  const handleStreamComplete = useCallback(() => {
    setStreamingId(null);
  }, []);

  return (
    <div className="flex h-screen bg-[#120C05] overflow-hidden font-nunito">
      <TrIASidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-4 bg-[#1A1208]/60 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#C8A882]"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-orange-400 animate-pulse' : 'bg-[#6B7C3A]'}`} />
            <span className="text-sm font-semibold text-[#E8C99A]">
              {isLoading ? 'TryA está pensando…' : 'TryA · Online'}
            </span>
          </div>

          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>

        {/* Chat */}
        <TrIAChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          onErrorDismiss={() => setError(null)}
          language={language}
          streamingId={streamingId}
          onStreamComplete={handleStreamComplete}
        />
      </div>
    </div>
  );
}
