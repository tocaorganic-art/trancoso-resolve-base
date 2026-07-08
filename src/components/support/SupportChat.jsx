import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, Paperclip, User, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

// ── Base de conhecimento RAG inline (evita alucinações, reduz latência) ────────
const KNOWLEDGE_BASE = `
PLATAFORMA TRANCOSO RESOLVE — BASE DE CONHECIMENTO OFICIAL

COMO FUNCIONA:
Clientes encontram prestadores verificados → agendam serviços → pagam com segurança (escrow 48h) → confirmam conclusão → pagamento liberado ao prestador.

CATEGORIAS DE SERVIÇO: Limpeza, Garçom, Pedreiro, Jardinagem, Babá, Eletricista, Encanador, Pintor, Cozinheiro.

PAGAMENTOS:
- Método: Pix ou cartão de crédito via Mercado Pago
- Custódia: valor fica retido por 48h após o serviço
- Divisão: 80% prestador / 20% plataforma (taxa de serviço)
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

// ── Cache de respostas para FAQs frequentes (reduz custos de API) ──────────────
const FAQ_CACHE = {
  'como funciona': `A **Trancoso Resolve** funciona em 4 passos simples:\n\n1. **Encontre** um prestador verificado na busca\n2. **Agende** o serviço na data e hora desejada\n3. **Pague** com cartão — o valor fica em custódia segura por 48h\n4. **Confirme** a conclusão para liberar o pagamento ao prestador\n\nPrecisa de mais alguma informação?`,
  'como agendar': `Para agendar um serviço:\n\n1. Acesse o perfil do prestador desejado\n2. Clique em **Agendar Serviço**\n3. Preencha data, horário e localização\n4. O prestador receberá a solicitação e confirmará\n\nGostaria de buscar um prestador agora?`,
  'como funciona o pagamento': `O pagamento é **100% seguro**:\n\n- Aceito por **Pix ou cartão de crédito** via Mercado Pago\n- Valor fica em **custódia por 48h** após o serviço\n- O prestador recebe **80%** após confirmação\n- Cancelamento **gratuito** antes da confirmação\n\nAlguma dúvida sobre pagamentos?`,
  'quero ser um prestador': `Para se cadastrar como prestador:\n\n1. Clique em **"Seja um Prestador"** no menu superior\n2. Preencha seus dados e especialidade\n3. Envie um documento (CNH ou RG) para verificação\n4. Configure sua conta bancária no painel Financeiro\n\nQuer saber mais sobre como funciona para prestadores?`,
};

const findCachedAnswer = (text) => {
  const lower = text.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ_CACHE)) {
    if (lower.includes(key)) return answer;
  }
  return null;
};

// ── Filtro de conteúdo (LGPD + segurança) ─────────────────────────────────────
const BLOCKED_PATTERNS = [
  /cpf|rg|cnpj|senha|password|credit.?card|cartão/i,
  /número.?do.?cartão|cvv|validade.?cartão/i,
];

const containsSensitiveData = (text) =>
  BLOCKED_PATTERNS.some(p => p.test(text));

const SYSTEM_PROMPT = `Você é a **Toca**, Assistente IA da **Trancoso Resolve**. Responda APENAS com base na base de conhecimento fornecida. Se não souber, diga honestamente e indique suporte@trancosoresolve.com.br.

TOM: Profissional, amigável, empático, baiano-chic. Respostas concisas (máx 3 parágrafos).
LIMITES: Nunca forneça conselhos legais, médicos ou financeiros pessoais. Nunca solicite dados sensíveis (CPF, senha, dados de cartão).
LGPD: Se o usuário compartilhar dados pessoais desnecessários, oriente gentilmente a não fazê-lo.
ENCERRAMENTO: Sempre pergunte se há mais alguma dúvida.`;

// ── Componentes de UI ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 mb-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
      }`}>
        {/* Imagem anexada */}
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="Imagem enviada" className="rounded-lg mb-2 max-w-full max-h-40 object-cover" />
        )}
        {isUser ? (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

const quickActions = [
  'Como funciona a plataforma?',
  'Como agendar um serviço?',
  'Como funciona o pagamento?',
  'Quero ser um prestador',
];

// ── Componente principal ───────────────────────────────────────────────────────
export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou a **Toca**, assistente inteligente da Trancoso Resolve. Como posso ajudar você hoje?\n\nPosso tirar dúvidas sobre a plataforma, agendamentos, pagamentos, prestadores e muito mais.',
      timestamp: new Date().toISOString(),
    }
  ]);

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

    return `${SYSTEM_PROMPT}

--- BASE DE CONHECIMENTO ---
${KNOWLEDGE_BASE}${userContext}${requestsContext}

--- HISTÓRICO DA CONVERSA ---
${historyText}

${imageUrl ? `[O usuário enviou uma imagem para análise: ${imageUrl}]\n` : ''}Responda à última mensagem de forma concisa e útil.`;
  }, [user, userRequests]);

  const sendMessage = useCallback(async (text, imageUrl = null) => {
    const content = text || inputMessage;
    if (!content.trim() || isTyping) return;

    // Filtro de conteúdo — LGPD
    if (containsSensitiveData(content)) {
      const warnMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Por segurança, **não compartilhe dados sensíveis** como CPF, número de cartão ou senhas no chat. Para questões que envolvam dados pessoais, entre em contato por suporte@trancosoresolve.com.br.',
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
    const cached = findCachedAnswer(content);
    if (cached && !imageUrl) {
      await new Promise(r => setTimeout(r, 600)); // simula latência natural
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
      `${m.role === 'user' ? 'Usuário' : 'Toca'}: ${m.content}`
    ).join('\n');

    const prompt = buildContextualPrompt(content, historyText, imageUrl);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      ...(imageUrl ? { file_urls: [imageUrl] } : {}),
    });

    const responseText = typeof result === 'string' ? result : (result?.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente ou contate suporte@trancosoresolve.com.br.');

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
  }, [inputMessage, isTyping, conversationHistory, isOpen, buildContextualPrompt]);

  // Multimodalidade — upload de imagem
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadingImage(false);
    await sendMessage(inputMessage || 'Analisando esta imagem...', file_url);
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setUnreadCount(0); }}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 flex items-center justify-center transition-all hover:scale-105 relative"
        aria-label="Abrir chat de suporte"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'} max-w-[calc(100vw-2rem)]`}>
      <Card className="shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Toca — Assistente IA</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80">Online • IA avançada</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fechar chat"
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
                <p className="text-xs text-slate-500 font-medium mb-2">Perguntas frequentes:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-700"
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
                  aria-label="Enviar imagem ou documento"
                  title="Enviar imagem ou documento"
                >
                  <Paperclip className="w-4 h-4 text-slate-500" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder={uploadingImage ? 'Enviando arquivo...' : 'Digite sua mensagem...'}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping || uploadingImage}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:opacity-50 bg-slate-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping || uploadingImage}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-400">Protegido por LGPD · Trancoso Resolve</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}