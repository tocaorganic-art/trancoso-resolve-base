import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Send, X, Minimize2, Maximize2, Bot, Paperclip, User, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import StickyChatWidget from './StickyChatWidget';
import { useApp } from '@/contexts/AppContext';
import { LANGUAGES } from '@/i18n/translations';

// ── Base de conhecimento RAG inline (evita alucinações, reduz latência) ────────
// Mantida em português: o prompt instrui a IA a responder no idioma do visitante.
const KNOWLEDGE_BASE = `
PLATAFORMA TRANCOSO RESOLVE | BASE DE CONHECIMENTO OFICIAL

COMO FUNCIONA:
Clientes encontram prestadores verificados → agendam serviços → pagam com segurança (custódia 48h) → confirmam conclusão → pagamento liberado ao prestador.

CATEGORIAS DE SERVIÇO: Limpeza, Garçom, Pedreiro, Jardinagem, Babá, Eletricista, Encanador, Pintor, Cozinheiro.

PAGAMENTOS:
- Método: Asaas (cartão, Pix)
- Custódia: valor fica retido por 48h após o serviço
- Divisão: 100% para o prestador (sem comissão da plataforma)
- Liberação: automática após 48h ou quando cliente confirmar conclusão

CANCELAMENTO: Gratuito antes do prestador confirmar a solicitação.

PRESTADORES:
- Cadastro: menu superior → "Seja um Prestador"
- Verificação: envio de documento (CNH/RG) obrigatório
- Recebimento: após configurar conta bancária no painel Financeiro

CLIENTES:
- Pedidos: seção "Meus Pedidos" no menu
- Avaliações: disponíveis após conclusão de cada serviço
- Comunicação: chat interno com o prestador

SEGURANÇA:
- Todos os prestadores passam por verificação de identidade
- Pagamentos em custódia protegem o cliente
- Dados pessoais protegidos conforme LGPD

SUPORTE HUMANO: suporte@trancosoresolve.com.br

TRANCOSO LOCAL:
- Praias: Coqueiros, Nativos, Rio da Barra, Taípe, Itapororoca, Patimirim, Itaquena, Espelho
- Gastronomia: El Gordo, Capim Santo, Silvana & Cia, Maritaca, Jacaré do Brasil
- Ponto cultural: Quadrado Histórico de Trancoso
`;

// ── Intenções de FAQ por idioma (evita chamada de API e responde no idioma) ────
// A ordem importa: "como funciona o pagamento" deve cair em pagamento, não em visão geral.
const FAQ_INTENTS = [
  {
    key: 'payment',
    match: {
      pt: ['formas de pagamento', 'pagamento', 'pagar', 'pix', 'cartão'],
      es: ['formas de pago', 'pago', 'pagar', 'pix', 'tarjeta'],
      en: ['payment', 'pay', 'pix', 'card'],
      fr: ['paiement', 'payer', 'pix', 'carte'],
    },
  },
  {
    key: 'howToBook',
    match: {
      pt: ['agendar', 'contratar', 'solicitar serviço'],
      es: ['agendar', 'reservar', 'contratar'],
      en: ['book', 'booking', 'hire'],
      fr: ['réserver', 'reservation', 'engager'],
    },
  },
  {
    key: 'provider',
    match: {
      pt: ['ser prestador', 'ser um prestador', 'prestador', 'cadastrar', 'me cadastrar'],
      es: ['ser profesional', 'ser proveedor', 'prestador', 'registrarme'],
      en: ['be a provider', 'become a provider', 'provider', 'register'],
      fr: ['devenir prestataire', 'prestataire', 'inscrire', 'inscription'],
    },
  },
  {
    key: 'howItWorks',
    match: {
      pt: ['como funciona'],
      es: ['cómo funciona', 'como funciona'],
      en: ['how it works', 'how does it work', 'how does the platform work', 'how does the platform', 'how do you work', 'how does trancoso'],
      fr: ['comment ça marche', 'comment fonctionne'],
    },
  },
];

const findIntent = (text, lang) => {
  const lower = text.toLowerCase();
  for (const intent of FAQ_INTENTS) {
    const terms = intent.match[lang] || intent.match.pt;
    if (terms.some(term => lower.includes(term))) return intent.key;
  }
  return null;
};

// ── Filtro de conteúdo (LGPD + segurança) ─────────────────────────────────────
const BLOCKED_PATTERNS = [
  /cpf|rg|cnpj|senha|password|credit.?card|cartão|tarjeta/i,
  /número.?do.?cartão|cvv|validade.?cartão|numero.?de.?tarjeta/i,
];

const containsSensitiveData = (text) =>
  BLOCKED_PATTERNS.some(p => p.test(text));

const buildSystemPrompt = (languageName) => `Você é a **Toca**, Assistente IA da **Trancoso Resolve**. Responda APENAS com base na base de conhecimento fornecida. Se não souber, diga honestamente e indique suporte@trancosoresolve.com.br.

IDIOMA: responda SEMPRE em ${languageName}, mesmo que a base de conhecimento e o histórico estejam em português. Traduza também nomes de menus, seções e mensagens citados na resposta.

TOM: Profissional, amigável, empático, baiano-chic. Respostas concisas (máx 3 parágrafos).
LIMITES: Nunca forneça conselhos legais, médicos ou financeiros pessoais. Nunca solicite dados sensíveis (CPF, senha, dados de cartão).
LGPD: Se o usuário compartilhar dados pessoais desnecessários, oriente gentilmente a não fazê-lo.
ENCERRAMENTO: Sempre pergunte se há mais alguma dúvida.
FORMATAÇÃO: Nunca use travessão (—), meia risca (–) nem hífen como separador de frase nas respostas. Use vírgula, ponto, dois pontos ou parênteses.`;

// ── Componentes de UI ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#E8571A] flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 rounded-full bg-[#E8571A] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#E8571A] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#E8571A] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const { t, locale } = useApp();
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E8571A] flex items-center justify-center shrink-0 mb-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-xs ${
        isUser
          ? 'bg-[#E8571A] text-white rounded-br-sm'
          : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
      }`}>
        {/* Imagem anexada */}
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt={t('support.imageAlt')} className="rounded-lg mb-2 max-w-full max-h-40 object-cover" />
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-[#E8571A]/60' : 'text-slate-400'}`}>
          {new Date(msg.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mb-1">
          <User className="w-4 h-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function SupportChat() {
  const { t, lang } = useApp();
  const languageName = LANGUAGES.find(l => l.code === lang)?.aiName || 'português do Brasil';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const welcomeMessage = useCallback(() => ({
    id: '1',
    role: 'assistant',
    content: t('support.welcome'),
    timestamp: new Date().toISOString(),
  }), [t]);

  const [messages, setMessages] = useState([welcomeMessage()]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Busca pedidos do usuário para contexto transacional
  const { data: userRequests } = useQuery({
    queryKey: ['userRequests', user?.id],
    queryFn: () => base44.entities.ServiceRequest.filter({ client_email: user?.email }, '-created_date', 3),
    enabled: !!user?.email,
    initialData: [],
  });

  // Se o visitante troca o idioma antes de conversar, a saudação acompanha o idioma.
  useEffect(() => {
    setMessages(prev => (prev.length === 1 && prev[0].id === '1' ? [welcomeMessage()] : prev));
  }, [welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const buildContextualPrompt = useCallback((userText, historyText, imageUrl) => {
    // Contexto transacional: últimos pedidos do usuário logado
    const requestsContext = userRequests?.length > 0
      ? `\nPEDIDOS RECENTES DO USUÁRIO:\n${userRequests.map(r =>
          `- Serviço #${r.id?.slice(-6)}: Status "${r.status}", Data ${r.date || 'não definida'}`
        ).join('\n')}`
      : '';

    const userContext = user
      ? `\nUSUÁRIO LOGADO: ${user.full_name} (${user.email})`
      : '\nUSUÁRIO: não autenticado';

    return `${buildSystemPrompt(languageName)}

--- BASE DE CONHECIMENTO ---
${KNOWLEDGE_BASE}${userContext}${requestsContext}

--- HISTÓRICO DA CONVERSA ---
${historyText}

${imageUrl ? `[O usuário enviou uma imagem para análise: ${imageUrl}]\n` : ''}Responda à última mensagem de forma concisa e útil, em ${languageName}.`;
  }, [user, userRequests, languageName]);

  const sendMessage = useCallback(async (text, imageUrl = null) => {
    const content = text || inputMessage;
    if (!content.trim() || isTyping) return;

    // Filtro de conteúdo — LGPD
    if (containsSensitiveData(content)) {
      const warnMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content: t('support.sensitive'),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, warnMsg]);
      setInputMessage('');
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content,
      imageUrl,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...conversationHistory, { role: 'user', content }];
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    setConversationHistory(newHistory);

    // Cache de FAQ — evita chamada de API desnecessária
    const intent = findIntent(content, lang);
    if (intent && !imageUrl) {
      await new Promise(r => setTimeout(r, 600)); // simula latência natural
      const cached = t(`support.answers.${intent}`);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cached,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: cached }]);
      setIsTyping(false);
      return;
    }

    const historyText = newHistory.slice(-10).map(m =>
      `${m.role === 'user' ? 'User' : 'Toca'}: ${m.content}`
    ).join('\n');

    const prompt = buildContextualPrompt(content, historyText, imageUrl);

    let responseText = t('support.fallback');
    try {
      const resp = await base44.functions.invoke('iaCreditada', {
        operacao: 'conversa',
        prompt,
        lang,
        ...(imageUrl ? { file_urls: [imageUrl] } : {}),
      });
      responseText = typeof resp === 'string' ? resp : (resp?.resposta || resp?.response || responseText);
    } catch {
      // falha de rede ou limite de cota: mantém a conversa viva com o aviso localizado
      responseText = t('support.fallback');
    }

    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setConversationHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
    setIsTyping(false);

    if (!isOpen) setUnreadCount(prev => prev + 1);
  }, [inputMessage, isTyping, conversationHistory, isOpen, buildContextualPrompt, t, lang]);

  // Multimodalidade — upload de imagem
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadingImage(false);
    await sendMessage(inputMessage || t('support.analyzing'), file_url);
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = t('support.quickActions');

  if (!isOpen) {
    // StickyChatWidget: position fixed no viewport, portal em document.body,
    // z-index 99999 — nunca é engolido por wrappers com overflow/transform.
    return (
      <StickyChatWidget
        onClick={() => { setIsOpen(true); setUnreadCount(0); }}
        unreadCount={unreadCount}
      />
    );
  }

  return (
    <>
      {/* Backdrop opcional - apenas visual, não bloqueador */}
      <div
        className="fixed inset-0 z-40 bg-black/0 transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
        aria-label={t('support.close')}
      />
      <div className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'} max-w-[calc(100vw-2rem)]`}>
      <Card className="shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#E8571A] to-[#C1440E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t('support.title')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80">{t('support.status')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={isMinimized ? t('support.maximize') : t('support.minimize')}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={t('support.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 py-3 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">{t('support.faqTitle')}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-slate-700"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex gap-2 items-center">
                {/* Upload de imagem — multimodalidade */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping || uploadingImage}
                  className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
                  aria-label={t('support.attach')}
                  title={t('support.attach')}
                >
                  <Paperclip className="w-4 h-4 text-slate-500" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder={uploadingImage ? t('support.uploading') : t('support.placeholder')}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping || uploadingImage}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-400 focus:ring-1 focus:ring-orange-200 disabled:opacity-50 bg-slate-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping || uploadingImage}
                  className="w-9 h-9 rounded-xl bg-[#E8571A] hover:bg-[#C1440E] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  aria-label={t('support.send')}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-400">{t('support.privacy')}</p>
              </div>
            </div>
          </>
        )}
      </Card>
      </div>
    </>
  );
}
