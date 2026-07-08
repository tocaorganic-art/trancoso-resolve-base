import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function TrIASidebar({ isOpen, conversations, activeConversationId, onSelectConversation, onNewConversation, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden z-30" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative w-64 h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900
        border-r border-slate-800 flex flex-col z-40
        transition-transform duration-300 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <button 
            onClick={onNewConversation}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full text-left p-3 rounded-lg transition-all group ${
                  activeConversationId === convo.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{convo.name}</p>
                    <p className="text-xs text-slate-400 truncate">{convo.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors py-2">
            ⚙️ Configurações
          </button>
          <button className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors py-2">
            ❓ Ajuda
          </button>
        </div>
      </div>
    </>
  );
}