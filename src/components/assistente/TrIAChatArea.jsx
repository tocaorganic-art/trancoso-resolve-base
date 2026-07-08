import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import TrIAMessageBubble from './TrIAMessageBubble.jsx';

/**
 * TrIAChatArea - INTERFACE PURA
 * 
 * Responsabilidade ÚNICA:
 * - Renderizar UI do chat (input, bubbles, status)
 * - Passar mensagem do usuário para Toca TrIA
 * - Exibir resposta que Toca TrIA retorna
 * 
 * O que NÃO faz:
 * - ❌ Detectar intenção
 * - ❌ Validar dados complexos
 * - ❌ Chamar APIs externas
 * - ❌ Tomar decisão de lógica de negócio
 * 
 * Toda lógica de negócio = Toca TrIA (agente)
 */

export default function TrIAChatArea({ messages, onSendMessage, isLoading, error, onErrorDismiss, language = 'pt' }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Sugestões localizadas para cada idioma
  const getLocalizedPrompts = () => {
    const prompts = {
      pt: [
        '🗺️ Monte um roteiro turístico em Trancoso',
        '📋 Resuma dados',
        '💬 Responda cliente',
        '🔍 Pesquise algo'
      ],
      en: [
        '🗺️ Create a tourist itinerary in Trancoso',
        '📋 Summarize data',
        '💬 Reply to client',
        '🔍 Search for something'
      ],
      es: [
        '🗺️ Crear un itinerario turístico en Trancoso',
        '📋 Resumir datos',
        '💬 Responder al cliente',
        '🔍 Buscar algo'
      ],
      fr: [
        '🗺️ Créer un itinéraire touristique à Trancoso',
        '📋 Résumer les données',
        '💬 Répondre au client',
        '🔍 Rechercher quelque chose'
      ]
    };
    return prompts[language] || prompts.pt;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleQuickPrompt = (prompt) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-between text-sm text-red-200">
          <span>{error}</span>
          <button 
            onClick={onErrorDismiss}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {language === 'en' && 'Welcome to Toca TrIA'}
                {language === 'es' && 'Bienvenido a Toca TrIA'}
                {language === 'fr' && 'Bienvenue à Toca TrIA'}
                {language === 'pt' && 'Bem-vindo à Toca TrIA'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                {language === 'en' && 'Your AI assistant that executes tasks autonomously in Trancoso'}
                {language === 'es' && 'Tu asistente de IA que ejecuta tareas de forma autónoma en Trancoso'}
                {language === 'fr' && 'Votre assistant IA qui exécute des tâches de manière autonome à Trancoso'}
                {language === 'pt' && 'Sua assistente de IA que executa tarefas de forma autônoma em Trancoso'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => {
              const isLastMessage = idx === messages.length - 1;
              const isStreaming = isLoading && isLastMessage && message.role === 'assistant';
              
              return (
                <TrIAMessageBubble 
                  key={message.id} 
                  message={message}
                  isStreaming={isStreaming}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && !isLoading && (
        <div className="px-4 md:px-6 pb-4 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getLocalizedPrompts().map(prompt => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
                className="text-xs p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-black/40 backdrop-blur-md border-t border-slate-800">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              language === 'en' ? 'Chat with Toca TrIA...' :
              language === 'es' ? 'Conversa con Toca TrIA...' :
              language === 'fr' ? 'Discutez avec Toca TrIA...' :
              'Converse com a Toca TrIA...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors focus:shadow-lg focus:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}