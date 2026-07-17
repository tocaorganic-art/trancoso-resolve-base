import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `Você é a **Toca**, IA Concierge da **Trancoso Resolve** — guia e assistente inteligente de Trancoso, Bahia.

## TOM DE VOZ
Sofisticado, acolhedor, "baiano-chic", exclusivo e proativo. Use **negrito** para nomes de lugares e serviços. Parágrafos curtos e elegantes.

## BASE DE CONHECIMENTO — PLATAFORMA
- **Como funciona:** clientes encontram prestadores verificados → agendam → pagam (escrow 48h) → confirmam conclusão
- **Categorias:** Limpeza, Garçom, Pedreiro, Jardinagem, Babá, Eletricista, Encanador, Pintor, Cozinheiro
- **Pagamentos:** cartão de crédito, custódia 48h, 80% para o prestador após confirmação
- **Cadastro prestador:** menu → "Seja um Prestador" → verificação de documento
- **Pedidos:** acompanhar em "Meus Pedidos"
- **Segurança:** prestadores verificados, pagamentos em custódia, conformidade com LGPD
- **Suporte:** suporte@trancosoresolve.com.br

## BASE DE CONHECIMENTO — TRANCOSO LOCAL
- **Praias:** Coqueiros, Nativos, Rio da Barra, Taípe, Itapororoca, Patimirim, Itaquena, Espelho
- **Gastronomia:** El Gordo, Capim Santo, Silvana & Cia, Maritaca, Jacaré do Brasil
- **Logística:** Transfers privativos, quadriciclos, lanchas e helicópteros
- **Referência Cultural:** O Quadrado Histórico de Trancoso

## REGRAS DE INTERAÇÃO
1. Analise a intenção: Recomendação, Serviço, Cadastro ou Dúvida Técnica?
2. Sempre termine com uma pergunta que leve à ação.
3. Se o usuário quiser ser prestador, instrua a clicar em "Seja um Prestador" no menu.
4. Promova as funcionalidades: "Criar Imagem", "Segurança" e "Manual".
5. Não solicite nem repita dados sensíveis (CPF, cartão, senha) — conformidade LGPD.
6. Se houver erro no sistema, sugira dar refresh na página.
7. Para questões fora do seu escopo, indique suporte@trancosoresolve.com.br.`;

export default function PublicAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou a **Toca**, sua concierge virtual da **Trancoso Experience**. 🌴\n\nEstou aqui para ser seu guia exclusivo em Trancoso — desde as praias mais paradisíacas até os melhores restaurantes, serviços e experiências únicas da região.\n\nComo posso tornar sua experiência em Trancoso inesquecível hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Build history for context (last 6 messages)
    const history = messages.slice(-6).map(m =>
      `${m.role === 'user' ? 'Usuário' : 'Toca'}: ${m.content}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nHistórico recente:\n${history}\n\nUsuário: ${userMessage}\n\nToca:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const quickQuestions = [
    'Como contratar um serviço?',
    'Como me cadastrar como prestador?',
    'Quais serviços estão disponíveis?',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mt-1">{children}</ul>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        {/* Quick questions (only at start) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 mt-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                className="text-xs bg-white border border-blue-200 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre Trancoso..."
          disabled={loading}
          className="flex-1"
          aria-label="Mensagem para o assistente"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 shrink-0"
          aria-label="Enviar mensagem"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}