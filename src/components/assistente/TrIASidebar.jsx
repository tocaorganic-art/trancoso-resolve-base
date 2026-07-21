import { Plus, MessageSquare, Trash2, Sparkles } from 'lucide-react';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[d.getDay()];
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TrIASidebar({ isOpen, conversations, activeId, onSelect, onNew, onDelete, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 md:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative w-64 h-screen bg-[#0D0804]
        border-r border-white/5 flex flex-col z-40
        transition-transform duration-300 ease-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shadow-brand shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F2DEC4] leading-none">TryA</p>
              <p className="text-[10px] text-[#8A6A4A] leading-none mt-0.5">Assistente inteligente</p>
            </div>
          </div>
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-orange-700 active:scale-95 rounded-pill text-white text-sm font-bold transition-all shadow-brand"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <p className="text-center text-xs text-[#5A4A36] py-8 px-4">
              Nenhuma conversa ainda.<br />Comece digitando uma mensagem!
            </p>
          ) : (
            conversations.map(convo => (
              <div
                key={convo.id}
                className={`group relative mx-2 mb-0.5 rounded-xl transition-all cursor-pointer ${
                  activeId === convo.id
                    ? 'bg-orange-500/15 border border-orange-500/30'
                    : 'border border-transparent hover:bg-white/4'
                }`}
                onClick={() => onSelect(convo.id)}
              >
                <div className="flex items-start gap-2.5 p-3 pr-8">
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeId === convo.id ? 'text-orange-400' : 'text-[#5A4A36]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${activeId === convo.id ? 'text-[#F2DEC4]' : 'text-[#B89A72]'}`}>
                      {convo.name}
                    </p>
                    {convo.preview && (
                      <p className="text-[10px] text-[#6A5040] truncate mt-0.5 leading-tight">
                        {convo.preview}
                      </p>
                    )}
                    {convo.createdAt && (
                      <p className="text-[9px] text-[#4A3828] mt-1">
                        {formatDate(convo.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(convo.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#6A4A35] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Excluir conversa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <p className="text-[10px] text-center text-[#3A2A1A]">
            Trancoso Resolve · A gente resolve.
          </p>
        </div>
      </aside>
    </>
  );
}
