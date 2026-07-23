// Mapa de imagens realistas por ocupação para demonstração
// Todas as imagens são do Unsplash (gratuitas e com uso comercial permitido)
// Fotos com pessoas em contexto real de trabalho, luz natural, diversidade

export const mockProviderImages = {
  'Limpeza': {
    photo: 'https://images.unsplash.com/photo-1563207153-f403bf289096?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Mulher com produtos de limpeza, luz natural, ambiente doméstico'
  },
  'Eletricista': {
    photo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Eletricista com ferramenta em obra, contexto real'
  },
  'Encanador': {
    photo: 'https://images.unsplash.com/photo-1576050485252-c4c65b4744d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1576050485252-c4c65b4744d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Encanador com ferramenta, trabalho prático'
  },
  'Jardinagem': {
    photo: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Jardineiro ao ar livre com plantas, luz natural'
  },
  'Cozinheiro': {
    photo: 'https://images.unsplash.com/photo-1595521624512-6e6eb5a28063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Chef em cozinha real com ingredientes, avental de trabalho'
  },
  'Pedreiro': {
    photo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Pedreiro em obra, contexto real de trabalho'
  },
  'Pintor': {
    photo: 'https://images.unsplash.com/photo-1589939705066-3d1c3dd9671e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1589939705066-3d1c3dd9671e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Pintor com ferramenta em parede, trabalho em andamento'
  },
  'Babá': {
    photo: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Cuidadora com criança em ambiente confortável'
  },
  'Garçom': {
    photo: 'https://images.unsplash.com/photo-1555939594-58d7cb561549?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1555939594-58d7cb561549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Garçom servindo em ambiente de trabalho real'
  },
  'default': {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Profissional com expressão natural'
  }
};

// Função helper para obter imagens mock para demonstração
export function getProviderMockImages(occupation) {
  return mockProviderImages[occupation] || mockProviderImages.default;
}

// Micro-texto de aviso para cards de demonstração
export const DEMO_PROFILE_WARNING = 'Perfil ilustrativo. Os prestadores reais terão suas próprias fotos.';