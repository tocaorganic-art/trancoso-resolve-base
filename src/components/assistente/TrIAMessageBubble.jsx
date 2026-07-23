import { Sparkles } from 'lucide-react';
import TrIAStreamingMessage from './TrIAStreamingMessage.jsx';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function TrIAMessageBubble({ message, isStreaming = false, onStreamComplete }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-fade-in">
        <div className="max-w-xs md:max-w-lg lg:max-w-xl">
          <div className="bg-brand-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-brand">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.timestamp && (
            <p className="text-[10px] text-[#3A2818] text-right mt-1 pr-1">
              {formatTime(message.timestamp)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shrink-0 mt-1 shadow-brand">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <TrIAStreamingMessage
          content={message.content}
          isComplete={!isStreaming}
          onComplete={onStreamComplete}
        />
        {message.timestamp && !isStreaming && (
          <p className="text-[10px] text-[#3A2818] mt-1 pl-1">
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
