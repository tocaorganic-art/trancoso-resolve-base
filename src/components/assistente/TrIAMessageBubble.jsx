import { Sparkles } from 'lucide-react';
import TrIAStreamingMessage from './TrIAStreamingMessage.jsx';

export default function TrIAMessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      {isUser ? (
        <div className="max-w-xs md:max-w-md lg:max-w-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl px-4 py-3 animate-fade-in shadow-lg">
          <div className="text-sm leading-relaxed">
            <p>{message.content}</p>
          </div>
        </div>
      ) : (
        <TrIAStreamingMessage 
          content={message.content} 
          isComplete={!isStreaming}
        />
      )}
    </div>
  );
}