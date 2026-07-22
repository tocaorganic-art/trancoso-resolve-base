import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `Você é a Toca, assistente de onboarding da plataforma Trancoso Resolve.
Responda dúvidas de quem quer se tornar prestador parceiro.
Seja animada, acolhedora e objetiva.
Temas: como se cadastrar, mensalidade (R$ 29,90/mês no lançamento, sem comissão sobre serviços — o prestador fica com 100% do valor recebido), visibilidade, tipos de serviço aceitos (Limpeza, Garçom, Pedreiro, Jardinagem, Babá, Eletricista, Encanador, Pintor, Cozinheiro), como melhorar o perfil, diferenciais da Trancoso Resolve vs trabalhar sozinho.
Use português brasileiro, tom "baiano-chic" — caloroso mas profissional.
Mantenha respostas curtas e diretas (máximo 3 parágrafos).
IMPORTANTE: Nunca mencione "Trancoso Experience" — o nome correto é sempre "Trancoso Resolve".`;

const quickQuestions = [
  'Como me cadastro?',
  'Quanto custa?',
  'Quais serviços posso oferecer?',
  'Como recebo os pagamentos?',
];

export default function ChatOnboarding() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou a **Toca** 🌴\n\nTem dúvidas sobre como ser um parceiro? Estou aqui para ajudar!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const content = text || input;
    if (!content.trim() || loading) return;
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const history = newMessages.map(m => `${m.role === 'user' ? 'Usuário' : 'Toca'}: ${m.content}`).join('\n');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nHistórico:\n${history}\n\nResponda à última mensagem do usuário:`,
    });
    setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    setLoading(false);
  };

  return (
    <section className="container mx-auto px-4 max-w-2xl pb-10">
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Toca — Assistente de Parceiros</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-amber-100 text-xs">Online agora</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-amber-50/40">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-amber-700 text-white rounded-br-none'
                  : 'bg-white border border-amber-100 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                ) : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-amber-100 rounded-xl px-3 py-2">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 py-3 bg-white border-t border-amber-50">
            <p className="text-xs text-slate-500 font-medium mb-2">Perguntas frequentes:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-left px-3 py-2 rounded-lg border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-colors text-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-amber-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Tire sua dúvida sobre como ser parceiro..."
            className="flex-1 text-sm border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-amber-50/30"
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-amber-700 hover:bg-amber-800 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
