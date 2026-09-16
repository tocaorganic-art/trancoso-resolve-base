import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';

/**
 * StickyChatWidget — botão flutuante do chat da Toca.
 *
 * Especificação do Tony (16/09/2026):
 * - position: fixed ancorado no VIEWPORT (bottom/right da janela), nunca no container pai.
 *   Renderizado via portal em document.body — imune a `overflow-x: hidden`,
 *   `transform` ou qualquer limitação de wrapper/box-model acima dele.
 * - Desktop: bottom 32px / right 32px · Mobile: bottom 24px / right 24px.
 * - z-index 99999 (flutua por cima de tudo).
 * - Laranja Queimado #E8571A, texto/ícone branco, sombra forte, pílula (radius 9999px).
 * - Estado padrão: só o ícone. No hover (desktop) OU automaticamente a cada 10s,
 *   expande lateralmente com transição suave (0.3s ease-in-out) revelando "Fale com a Toca".
 * - Ação: abre o chat interno (SupportChat).
 */
export default function StickyChatWidget({ onClick, unreadCount = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Auto-expande a cada 10 segundos para chamar atenção (chamada à conversão).
  useEffect(() => {
    const interval = setInterval(() => setExpanded(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Recolhe sozinho 4s depois de expandir (se o usuário não estiver com o mouse em cima).
  useEffect(() => {
    if (!expanded || hovered) return undefined;
    const timer = setTimeout(() => setExpanded(false), 4000);
    return () => clearTimeout(timer);
  }, [expanded, hovered]);

  const handleMouseEnter = () => {
    setHovered(true);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setExpanded(false);
  };

  const handleFocus = () => setExpanded(true);

  const handleBlur = () => {
    if (!hovered) setExpanded(false);
  };

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label="Abrir chat de atendimento — Fale com a Toca"
      className="fixed left-4 md:left-auto md:right-8 bottom-[calc(env(safe-area-inset-bottom,0px)+90px)] md:bottom-8 h-14 pl-4 pr-4 relative flex items-center bg-[#E8571A] hover:bg-[#C1440E] active:bg-[#C1440E] text-white cursor-pointer select-none"
      style={{
        zIndex: 99999,
        borderRadius: 9999,
        boxShadow:
          '0 10px 25px -5px rgba(232, 87, 26, 0.4), 0 8px 10px -6px rgba(232, 87, 26, 0.2)',
        transition: 'all 0.3s ease-in-out',
        touchAction: 'manipulation',
      }}
    >
      <MessageCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
      <span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden text-left"
        style={{
          maxWidth: expanded ? 170 : 0,
          opacity: expanded ? 1 : 0,
          paddingLeft: expanded ? 10 : 0,
          paddingRight: expanded ? 2 : 0,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        Fale com a Toca
      </span>
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
          aria-label={`${unreadCount} mensagens não lidas`}
        >
          {unreadCount}
        </span>
      )}
    </button>,
    document.body
  );
}