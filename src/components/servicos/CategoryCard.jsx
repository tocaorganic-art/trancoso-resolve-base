import CategoryIcon from "@/lib/categoryIcons";

/**
 * Cards de categoria — ícones lucide-react na cor da marca (#E8571A)
 * Microcopy original com linguagem local de Trancoso
 */
export const categoryMicrocopy = {
  'Limpeza': { text: 'Sua casa brilhando pra curtir a vila' },
  'Eletricista': { text: 'Sem apagão no seu corre' },
  'Encanador': { text: 'Vazamento? A gente resolve' },
  'Jardinagem': { text: 'Seu quintal verdinho' },
  'Cozinheiro': { text: 'Aquele jantar especial na sua casa' },
  'Pedreiro': { text: 'Obra bem feita, do jeito daqui' },
  'Pintor': { text: 'Cores novas pra sua casa' },
  'Babá': { text: 'Cuidado de quem entende' },
  'Garçom': { text: 'Serviço impecável pro seu evento' },
  'Piscineiro': { text: 'Água cristalina o ano todo' },
  'Chef': { text: 'Alta gastronomia na sua villa' },
  'Segurança': { text: 'Tranquilidade pra sua propriedade' },
  'Motorista': { text: 'Te levo onde precisar' },
  'Jardineiro': { text: 'Seu jardim tropical' },
};

export default function CategoryCard({ category, onClick }) {
  const { text } = categoryMicrocopy[category] || { text: 'Serviço de qualidade' };

  return (
    <a
      onClick={onClick}
      className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 flex flex-col gap-2 transition hover:scale-[1.02] cursor-pointer"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
        <CategoryIcon category={category} className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-white">{category}</h3>
      <p className="text-xs text-slate-400 leading-snug">{text}</p>
    </a>
  );
}
