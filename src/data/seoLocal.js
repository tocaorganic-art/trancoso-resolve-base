export const DESTINOS = [
  { slug: 'trancoso',       label: 'Trancoso',         estado: 'BA', lat: -16.5893, lng: -39.0825 },
  { slug: 'arraial-dajuda', label: "Arraial d'Ajuda",  estado: 'BA', lat: -16.4467, lng: -39.0744 },
  { slug: 'porto-seguro',   label: 'Porto Seguro',     estado: 'BA', lat: -16.4437, lng: -39.0642 },
  { slug: 'caraiva',        label: 'Caraíva',          estado: 'BA', lat: -16.7447, lng: -39.2022 },
];

export const CATEGORIAS = [
  { slug: 'eletricista', label: 'Eletricista',        emoji: '⚡' },
  { slug: 'diarista',   label: 'Diarista',            emoji: '🧹' },
  { slug: 'encanador',  label: 'Encanador',           emoji: '🔧' },
  { slug: 'jardineiro', label: 'Jardineiro',          emoji: '🌿' },
  { slug: 'chef',       label: 'Chef / Cozinheiro',   emoji: '👨‍🍳' },
];

export const DESTINO_MAP = Object.fromEntries(DESTINOS.map(d => [d.slug, d]));
export const CATEGORIA_MAP = Object.fromEntries(CATEGORIAS.map(c => [c.slug, c]));

export const BASE_URL = 'https://www.trancosoresolve.com.br';
