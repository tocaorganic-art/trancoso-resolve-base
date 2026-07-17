
/**
 * Cards de categoria com design system navy + âmbar
 * Microcopy original com linguagem local de Trancoso
 */
export const categoryMicrocopy = {
  'Limpeza': { emoji: '🧹', text: 'Sua casa brilhando pra curtir a vila ✨' },
  'Eletricista': { emoji: '⚡', text: 'Sem apagão no seu corre' },
  'Encanador': { emoji: '🔧', text: 'Vazamento? A gente resolve' },
  'Jardinagem': { emoji: '🌿', text: 'Seu quintal verdinho 🌴' },
  'Cozinheiro': { emoji: '👨‍🍳', text: 'Aquele jantar especial na sua casa' },
  'Pedreiro': { emoji: '🧱', text: 'Obra bem feita, do jeito daqui' },
  'Pintor': { emoji: '🎨', text: 'Cores novas pra sua casa' },
  'Babá': { emoji: '👶', text: 'Cuidado de quem entende' },
  'Garçom': { emoji: '🍽️', text: 'Serviço impecável pro seu evento' },
  'Piscineiro': { emoji: '💧', text: 'Água cristalina o ano todo' },
  'Chef': { emoji: '👩‍🍳', text: 'Alta gastronomia na sua villa' },
  'Segurança': { emoji: '🛡️', text: 'Tranquilidade pra sua propriedade' },
  'Motorista': { emoji: '🚗', text: 'Te levo onde precisar' },
  'Jardineiro': { emoji: '🌺', text: 'Seu jardim tropical 🌺' },
};

export default function CategoryCard({ category, onClick }) {
  const { emoji, text } = categoryMicrocopy[category] || { emoji: '🔧', text: 'Serviço de qualidade' };
  
  return (
    <a
      onClick={onClick}
      className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 flex flex-col gap-2 transition hover:scale-[1.02] cursor-pointer"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
        {emoji}
      </div>
      <h3 className="font-bold text-white">{category}</h3>
      <p className="text-xs text-slate-400 leading-snug">{text}</p>
    </a>
  );
}