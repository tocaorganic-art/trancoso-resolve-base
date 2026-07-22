import {
  Sparkles, Zap, Wrench, Leaf, ChefHat, HardHat,
  Paintbrush, Baby, UtensilsCrossed, Waves, Car, Shield, Music } from
"lucide-react";

// Mapeamento oficial da marca: categoria de serviço -> ícone lucide-react.
// Nunca usar emoji na UI (regra oficial). Cor primária: #E8571A.
const ICON_BY_CATEGORY = {
  diarista: Sparkles,
  limpeza: Sparkles,
  eletricista: Zap,
  encanador: Wrench,
  jardineiro: Leaf,
  jardinagem: Leaf,
  cozinheiro: ChefHat,
  chef: ChefHat,
  'chef particular': ChefHat,
  pedreiro: HardHat,
  pintor: Paintbrush,
  baba: Baby,
  garcom: UtensilsCrossed,
  piscineiro: Waves,
  motorista: Car,
  seguranca: Shield,
  dj: Music,
};

const normalize = (value) =>
  (value || '').
  toString().
  toLowerCase().
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  trim();

export function getCategoryIcon(category) {
  return ICON_BY_CATEGORY[normalize(category)] || Wrench;
}

export default function CategoryIcon({ category, className = "w-7 h-7", color = "#E8571A", ...props }) {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} strokeWidth={2} style={{ color }} {...props} />;
}
