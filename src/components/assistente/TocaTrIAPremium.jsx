import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TrIASidebar from './TrIASidebar.jsx';
import TrIAChatArea from './TrIAChatArea.jsx';
import LanguageSelector from './LanguageSelector.jsx';

export default function TocaTrIAPremium() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('pt');
  const [translationLoading, setTranslationLoading] = useState(false);

  // Inicializar ou carregar conversa
  useEffect(() => {
    const initializeConversations = async () => {
      try {
        const convos = await base44.agents.listConversations({ agent_name: 'toca' });
        if (convos && convos.length > 0) {
          setConversations(convos);
          setActiveConversationId(convos[0].id);
          const convo = await base44.agents.getConversation(convos[0].id);
          setMessages(convo.messages || []);
        } else {
          // Criar primeira conversa
          const newConvo = await base44.agents.createConversation({
            agent_name: 'toca',
            metadata: { name: 'Primeira Conversa' }
          });
          setConversations([newConvo]);
          setActiveConversationId(newConvo.id);
          setMessages([]);
        }
      } catch (err) {
        console.error('Erro ao carregar conversas:', err);
        setError('Erro ao carregar histórico');
      }
    };
    
    initializeConversations();
  }, []);

  // Subscriber para atualizações em tempo real
  useEffect(() => {
    if (!activeConversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(activeConversationId, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [activeConversationId]);

  const handleSendMessage = async (content) => {
    if (!activeConversationId) return;

    try {
      setError(null);
      setIsLoading(true);
      setTranslationLoading(true);

      // Se idioma não é português, traduzir mensagem antes de enviar
      let messageToSend = content;
      if (language !== 'pt') {
        try {
          const translationRes = await base44.functions.invoke('tocaTriaTranslator', {
            text: content,
            sourceLanguage: language,
            targetLanguage: 'pt'
          });
          messageToSend = translationRes.data?.translated || translationRes.translated || content;
          console.log(`[CHAT] Traduzido ${language}→pt: "${messageToSend}"`);
        } catch (err) {
          console.warn('[CHAT] Falha na tradução, usando original:', err);
        }
      }

      setTranslationLoading(false);

      // Adicionar mensagem do usuário
      try {
        const convo = await base44.agents.getConversation(activeConversationId);
        await base44.agents.addMessage(convo, {
          role: 'user',
          content: messageToSend,
          metadata: { language, originalContent: content }
        });
      } catch (addErr) {
        console.error('[CHAT] Erro ao adicionar mensagem:', addErr);
        // Continuar mesmo se falhar (mensagem pode ter sido adicionada)
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Desculpe, ocorreu um erro ao processar sua solicitação.');
      setIsLoading(false);
      setTranslationLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      setError(null);
      const newConvo = await base44.agents.createConversation({
        agent_name: 'toca',
        metadata: { name: `Conversa de ${new Date().toLocaleString('pt-BR')}` }
      });
      setConversations(prev => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      setMessages([]);
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      setError('Erro ao criar nova conversa');
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <TrIASidebar 
        isOpen={sidebarOpen} 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-black via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLoading || translationLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-sm font-semibold text-slate-200">
              {translationLoading ? 'Traduzindo...' : isLoading ? 'Toca TrIA está pensando...' : 'Toca TrIA Online'}
            </span>
          </div>
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>

        {/* Chat Content */}
        <TrIAChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isLoading={isLoading || translationLoading}
          error={error}
          onErrorDismiss={() => setError(null)}
          language={language}
        />
      </div>
    </div>
  );
}