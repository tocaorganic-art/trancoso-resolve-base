import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, Paperclip, User, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

// â”€â”€ Base de conhecimento RAG inline (evita alucinaÃ§Ãµes, reduz latÃªncia) â”€â”€â”€â”€â”€â”€â”€â”€
const KNOWLEDGE_BASE = `
PLATAFORMA TRANCOSO RESOLVE â€” BASE DE CONHECIMENTO OFICIAL

COMO FUNCIONA:
Clientes encontram prestadores verificados â†’ agendam serviÃ§os â†’ pagam com seguranÃ§a (escrow 48h) â†’ confirmam conclusÃ£o â†’ pagamento liberado ao prestador.

CATEGORIAS DE SERVIÃ‡O: Limpeza, GarÃ§om, Pedreiro, Jardinagem, BabÃ¡, Eletricista, Encanador, Pintor, Cozinheiro.

PAGAMENTOS:
- Método: Mercado Pago (cartão, boleto, Pix)
- CustÃ³dia: valor fica retido por 48h apÃ³s o serviÃ§o
- Divisão: 100% para o prestador (sem comissão da plataforma)
- LiberaÃ§Ã£o: automÃ¡tica apÃ³s 48h ou quando cliente confirmar conclusÃ£o

CANCELAMENTO: Gratuito antes do prestador confirmar a solicitaÃ§Ã£o.

PRESTADORES:
- Cadastro: menu superior â†’ "Seja um Prestador"
- VerificaÃ§Ã£o: envio de documento (CNH/RG) obrigatÃ³rio
- Recebimento: apÃ³s configurar conta bancÃ¡ria no painel Financeiro

CLIENTES:
- Pedidos: seÃ§Ã£o "Meus Pedidos" no menu
- AvaliaÃ§Ãµes: disponÃ­veis apÃ³s conclusÃ£o de cada serviÃ§o
- ComunicaÃ§Ã£o: chat interno com o prestador

SEGURANÃ‡A:
- Todos os prestadores passam por verificaÃ§Ã£o de identidade
- Pagamentos em custÃ³dia protegem o cliente
- Dados pessoais protegidos conforme LGPD

SUPORTE HUMANO: suporte@trancosoresolve.com.br

TRANCOSO LOCAL:
- Praias: Coqueiros, Nativos, Rio da Barra, TaÃ­pe, Itapororoca, Patimirim, Itaquena, Espelho
- Gastronomia: El Gordo, Capim Santo, Silvana & Cia, Maritaca, JacarÃ© do Brasil
- Ponto cultural: Quadrado HistÃ³rico de Trancoso
`;

// â”€â”€ Cache de respostas para FAQs frequentes (reduz custos de API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FAQ_CACHE = {
  'como funciona': `A **Trancoso Resolve** funciona em 4 passos simples:\n\n1. **Encontre** um prestador verificado na busca\n2. **Agende** o serviÃ§o na data e hora desejada\n3. **Pague** com cartÃ£o â€” o valor fica em custÃ³dia segura por 48h\n4. **Confirme** a conclusÃ£o para liberar o pagamento ao prestador\n\nPrecisa de mais alguma informaÃ§Ã£o?`,
  'como agendar': `Para agendar um serviÃ§o:\n\n1. Acesse o perfil do prestador desejado\n2. Clique em **Agendar ServiÃ§o**\n3. Preencha data, horÃ¡rio e localizaÃ§Ã£o\n4. O prestador receberÃ¡ a solicitaÃ§Ã£o e confirmarÃ¡\n\nGostaria de buscar um prestador agora?`,
  'como funciona o pagamento': `O pagamento Ã© **100% seguro**:\n\n- Aceito via **Mercado Pago** (cartão, boleto, Pix)\n- Valor fica em **custÃ³dia por 48h** apÃ³s o serviÃ§o\n- O prestador recebe **100%** do valor (sem comissão)\n- Cancelamento **gratuito** antes da confirmaÃ§Ã£o\n\nAlguma dÃºvida sobre pagamentos?`,
  'quero ser um prestador': `Para se cadastrar como prestador:\n\n1. Clique em **"Seja um Prestador"** no menu superior\n2. Preencha seus dados e especialidade\n3. Envie um documento (CNH ou RG) para verificaÃ§Ã£o\n4. Configure sua conta bancÃ¡ria no painel Financeiro\n\nQuer saber mais sobre como funciona para prestadores?`,
};

const findCachedAnswer = (text) => {
  const lower = text.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ_CACHE)) {
    if (lower.includes(key)) return answer;
  }
  return null;
};

// â”€â”€ Filtro de conteÃºdo (LGPD + seguranÃ§a) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BLOCKED_PATTERNS = [
  /cpf|rg|cnpj|senha|password|credit.?card|cartÃ£o/i,
  /nÃºmero.?do.?cartÃ£o|cvv|validade.?cartÃ£o/i,
];

const containsSensitiveData = (text) =>
  BLOCKED_PATTERNS.some(p => p.test(text));

const SYSTEM_PROMPT = `VocÃª Ã© a **Toca**, Assistente IA da **Trancoso Resolve**. Responda APENAS com base na base de conhecimento fornecida. Se nÃ£o souber, diga honestamente e indique suporte@trancosoresolve.com.br.

TOM: Profissional, amigÃ¡vel, empÃ¡tico, baiano-chic. Respostas concisas (mÃ¡x 3 parÃ¡grafos).
LIMITES: Nunca forneÃ§a conselhos legais, mÃ©dicos ou financeiros pessoais. Nunca solicite dados sensÃ­veis (CPF, senha, dados de cartÃ£o).
LGPD: Se o usuÃ¡rio compartilhar dados pessoais desnecessÃ¡rios, oriente gentilmente a nÃ£o fazÃª-lo.
ENCERRAMENTO: Sempre pergunte se hÃ¡ mais alguma dÃºvida.`;

// â”€â”€ Componentes de UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#E8571A] flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E8571A] flex items-center justify-center shrink-0 mb-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isUser
          ? 'bg-[#E8571A] text-white rounded-br-sm'
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
        <p className={`text-xs mt-1 ${isUser ? 'text-[#E8571A]/60' : 'text-slate-400'}`}>
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
  'Como agendar um serviÃ§o?',
  'Como funciona o pagamento?',
  'Quero ser um prestador',
];

// â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      content: 'OlÃ¡! ðŸ‘‹ Sou a **Toca**, assistente inteligente da Trancoso Resolve. Como posso ajudar vocÃª hoje?\n\nPosso tirar dÃºvidas sobre a plataforma, agendamentos, pagamentos, prestadores e muito mais.',
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

  // Busca pedidos do usuÃ¡rio para contexto transacional
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
    // Contexto transacional: Ãºltimos pedidos do usuÃ¡rio logado
    const requestsContext = userRequests?.length > 0
      ? `\nPEDIDOS RECENTES DO USUÃRIO:\n${userRequests.map(r =>
          `- ServiÃ§o #${r.id?.slice(-6)}: Status "${r.status}", Data ${r.date || 'nÃ£o definida'}`
        ).join('\n')}`
      : '';

    const userContext = user
      ? `\nUSUÃRIO LOGADO: ${user.full_name} (${user.email})`
      : '\nUSUÃRIO: nÃ£o autenticado';

    return `${SYSTEM_PROMPT}

--- BASE DE CONHECIMENTO ---
${KNOWLEDGE_BASE}${userContext}${requestsContext}

--- HISTÃ“RICO DA CONVERSA ---
${historyText}

${imageUrl ? `[O usuÃ¡rio enviou uma imagem para anÃ¡lise: ${imageUrl}]\n` : ''}Responda Ã  Ãºltima mensagem de forma concisa e Ãºtil.`;
  }, [user, userRequests]);

  const sendMessage = useCallback(async (text, imageUrl = null) => {
    const content = text || inputMessage;
    if (!content.trim() || isTyping) return;

    // Filtro de conteÃºdo â€” LGPD
    if (containsSensitiveData(content)) {
      const warnMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'âš ï¸ Por seguranÃ§a, **nÃ£o compartilhe dados sensÃ­veis** como CPF, nÃºmero de cartÃ£o ou senhas no chat. Para questÃµes que envolvam dados pessoais, entre em contato por suporte@trancosoresolve.com.br.',
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

    // Cache de FAQ â€” evita chamada de API desnecessÃ¡ria
    const cached = findCachedAnswer(content);
    if (cached && !imageUrl) {
      await new Promise(r => setTimeout(r, 600)); // simula latÃªncia natural
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
      `${m.role === 'user' ? 'UsuÃ¡rio' : 'Toca'}: ${m.content}`
    ).join('\n');

    const prompt = buildContextualPrompt(content, historyText, imageUrl);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      ...(imageUrl ? { file_urls: [imageUrl] } : {}),
    });

    const responseText = typeof result === 'string' ? result : (result?.response || 'Desculpe, nÃ£o consegui processar sua mensagem. Tente novamente ou contate suporte@trancosoresolve.com.br.');

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

  // Multimodalidade â€” upload de imagem
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
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 z-50 flex items-center justify-center transition-all hover:scale-105 relative"
        style={{ touchAction: 'manipulation' }}
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
    <>
      {/* Backdrop opcional - apenas visual, nÃ£o bloqueador */}
      <div
        className="fixed inset-0 z-40 bg-black/0 transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
        aria-label="Fechar chat"
      />
      <div className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'} max-w-[calc(100vw-2rem)]`}>
      <Card className="shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E8571A] to-[#C1440E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Toca â€” Assistente IA</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80">Online â€¢ IA avanÃ§ada</span>
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
                {/* Upload de imagem â€” multimodalidade */}
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
                  className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 disabled:opacity-50 bg-slate-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping || uploadingImage}
                  className="w-9 h-9 rounded-xl bg-[#E8571A] hover:bg-[#C1440E] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-400">Protegido por LGPD Â· Trancoso Resolve</p>
              </div>
            </div>
          </>
        )}
      </Card>
      </div>
    </>
  );
}

