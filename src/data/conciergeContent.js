/**
 * CONTEÚDO DA PÁGINA /Concierge — Trancoso Resolve
 *
 * ⚠️ REGRA: nenhum número, prêmio ou depoimento aqui pode ser inventado.
 * Só entra o que o Tony confirmar como verdadeiro (mesma regra que valeu para
 * a remoção das métricas falsas do hero da /SejaPrestador — PR #24).
 *
 * 📸 FOTOS REAIS: os campos marcados com `PENDENTE_FOTO_REAL` esperam as fotos
 * do Tony (retrato dele + registros reais de operação/equipe/eventos). Enquanto
 * não chegarem, a página renderiza o bloco sem imagem em vez de usar banco de
 * imagem genérico ou arte de IA.
 */

export const PENDENTE_FOTO_REAL = null;

/**
 * Caminhos oficiais das fotos reais do Tony. Basta colocar os arquivos em
 * `public/images/` com estes nomes exatos e eles aparecem automaticamente
 * na página. Enquanto o arquivo não existir, o componente mostra o
 * placeholder visual (nunca imagem genérica ou de IA).
 */
export const FOTOS_REAIS_TONY = {
  concierge: '/images/tony_concierge.jpg',
  dj: '/images/tony_dj.jpg',
};

export const CONCIERGE_MEDIA = {
  // Retrato do Tony (fundador) — foto real
  retratoFundador: FOTOS_REAIS_TONY.concierge,
  // Hero: foto real de operação (recepção, casa, equipe em serviço) — caminho reservado
  heroPrincipal: PENDENTE_FOTO_REAL,
  // Galeria de trabalhos reais já entregues (casas, jantares, eventos, equipe)
  galeriaTrabalhos: [
    // { src: '...', alt: 'Jantar privado — Trancoso, BA', local: 'Trancoso · BA' },
  ],
  // Registros da trajetória como DJ / Toca Experience
  galeriaDj: [
    { src: FOTOS_REAIS_TONY.dj, alt: 'Tony — trajetória como DJ, Toca Experience', local: 'Toca Experience' },
  ],
};

export const CONCIERGE_CONTATO = {
  whatsapp: '+55 73 99828-3579',
  whatsappLink: 'https://wa.me/5573998283579',
  email: 'concierge@trancosoresolve.com.br',
  siteToca: 'https://www.tocaexperience.com.br',
};

/** Praças onde a operação é presencial, com equipe local. */
export const PRACAS = [
  { cidade: 'Todo o Brasil', uf: 'BR', nota: 'Operamos em qualquer destino do país — equipe montada na praça da estadia', destaque: true },
  { cidade: 'São Paulo', uf: 'SP', nota: 'Equipe presencial' },
  { cidade: 'Rio de Janeiro', uf: 'RJ', nota: 'Equipe presencial' },
  { cidade: 'Trancoso', uf: 'BA', nota: 'Matriz da operação · Costa do Descobrimento', matriz: true },
];

/** Os 4 pilares do serviço — alinhados à proposta comercial do Tony. */
export const PILARES = [
  {
    id: 'casas',
    titulo: { pt: 'Gestão de casas e vilas', es: 'Gestión de casas y villas' },
    resumo: {
      pt: 'A casa pronta antes de você chegar: vistoria, abastecimento, governanta, camareiras e caseiros.',
      es: 'La casa lista antes de que llegues: inspección, abastecimiento, gobernanta, mucamas y cuidadores.',
    },
    itens: {
      pt: ['Vistoria e preparo antes do check-in', 'Governanta, camareiras e caseiros', 'Abastecimento completo da casa', 'Manutenção e apoio durante a estadia'],
      es: ['Inspección y preparación antes del check-in', 'Gobernanta, mucamas y cuidadores', 'Abastecimiento completo de la casa', 'Mantenimiento y apoyo durante la estadía'],
    },
  },
  {
    id: 'logistica',
    titulo: { pt: 'Logística e transporte privado', es: 'Logística y transporte privado' },
    resumo: {
      pt: 'Chegada sem fricção: transfer de aeroporto, motoristas, lanchas e deslocamentos coordenados.',
      es: 'Llegada sin fricción: traslado desde el aeropuerto, choferes, lanchas y traslados coordinados.',
    },
    itens: {
      pt: ['Transfer de aeroporto ida e volta', 'Motoristas e carros privativos', 'Lanchas e passeios náuticos', 'Coordenação de horários do grupo'],
      es: ['Traslado aeropuerto ida y vuelta', 'Choferes y autos privados', 'Lanchas y paseos náuticos', 'Coordinación de horarios del grupo'],
    },
  },
  {
    id: 'gastronomia',
    titulo: { pt: 'Chef privado e curadoria gastronômica', es: 'Chef privado y curaduría gastronómica' },
    resumo: {
      pt: 'Chef executivo em casa e mesas nos lugares certos — reserva feita por quem é daqui.',
      es: 'Chef ejecutivo en casa y mesas en los lugares correctos — reservas hechas por quien vive acá.',
    },
    itens: {
      pt: ['Chef executivo na casa', 'Jantares autorais e harmonizados', 'Reservas em restaurantes de alto padrão', 'Equipe de cozinha e serviço de mesa'],
      es: ['Chef ejecutivo en la casa', 'Cenas de autor y maridajes', 'Reservas en restaurantes de alto nivel', 'Equipo de cocina y servicio de mesa'],
    },
  },
  {
    id: 'eventos',
    titulo: { pt: 'Eventos privados e curadoria musical', es: 'Eventos privados y curaduría musical' },
    resumo: {
      pt: 'DNA Toca Experience: line-up de DJs, som, iluminação e produção de festas e celebrações privadas.',
      es: 'ADN Toca Experience: line-up de DJs, sonido, iluminación y producción de fiestas y celebraciones privadas.',
    },
    itens: {
      pt: ['Line-up de DJs e curadoria musical', 'Som e iluminação profissionais', 'Sunsets, jantares e after-parties', 'Cerimônias e celebrações'],
      es: ['Line-up de DJs y curaduría musical', 'Sonido e iluminación profesionales', 'Sunsets, cenas y after-parties', 'Ceremonias y celebraciones'],
    },
  },

  {
    id: 'aviacao',
    titulo: { pt: 'Aviação executiva e recepção de aeroporto', es: 'Aviación ejecutiva y recepción en aeropuerto' },
    resumo: {
      pt: 'Fretamento de avião e helicóptero, recepção no aeroporto e conexão até a porta da casa.',
      es: 'Fletamento de avión y helicóptero, recepción en el aeropuerto y conexión hasta la puerta de la casa.',
    },
    itens: {
      pt: ['Jatos privados, bimotores e helicópteros', 'Transfers aéreos rápidos: Trancoso, Terravista, SP, RJ e Buenos Aires', 'Receptivo em pista e fast-track de desembarque', 'Sala VIP e apoio com bagagem em Porto Seguro, Guarulhos, Galeão e Ezeiza'],
      es: ['Jets privados, bimotores y helicópteros', 'Transfers aéreos rápidos: Trancoso, Terravista, SP, RJ y Buenos Aires', 'Receptivo en pista y fast-track de desembarque', 'Sala VIP y apoyo con equipaje en Porto Seguro, Guarulhos, Galeão y Ezeiza'],
    },
  },
  {
    id: 'imoveis',
    titulo: { pt: 'Mansões e vilas de alto padrão', es: 'Mansiones y villas de alto nivel' },
    resumo: {
      pt: 'Seleção, negociação e contrato de mansões e vilas para uso exclusivo — com vistoria antes da chegada.',
      es: 'Selección, negociación y contrato de mansiones y villas para uso exclusivo — con inspección antes de la llegada.',
    },
    itens: {
      pt: ['Mansões pé na areia e propriedades fora das plataformas convencionais', 'Negociação e contrato de locação por temporada', 'Vistoria e inventário do imóvel antes do check-in', 'Representação legal e intermediação local'],
      es: ['Mansiones pie en la arena y propiedades fuera de las plataformas convencionales', 'Negociación y contrato de alquiler temporario', 'Inspección e inventario de la propiedad antes del check-in', 'Representación legal e intermediación local'],
    },
  },
];

/** Como a operação funciona, passo a passo. */
export const ETAPAS = [
  {
    n: '01',
    titulo: { pt: 'Briefing', es: 'Briefing' },
    texto: {
      pt: 'Você conta o período, o grupo e o que importa para vocês. Sem formulário engessado.',
      es: 'Nos contás el período, el grupo y lo que les importa. Sin formularios rígidos.',
    },
  },
  {
    n: '02',
    titulo: { pt: 'Proposta sob medida', es: 'Propuesta a medida' },
    texto: {
      pt: 'Recebe uma proposta fechada, com escopo, equipe e valores abertos — sem soft costs.',
      es: 'Recibís una propuesta cerrada, con alcance, equipo y valores abiertos — sin costos ocultos.',
    },
  },
  {
    n: '03',
    titulo: { pt: 'Equipe montada no local', es: 'Equipo armado en el lugar' },
    texto: {
      pt: 'Montamos a equipe presencial na praça da estadia: concierge fixo, casa, cozinha e transporte.',
      es: 'Armamos el equipo presencial en el destino: concierge fijo, casa, cocina y transporte.',
    },
  },
  {
    n: '04',
    titulo: { pt: 'Concierge presente 24/7', es: 'Concierge presente 24/7' },
    texto: {
      pt: 'Durante a estadia tem gente sua no local, não um chat. Um concierge fixo, acessível a qualquer hora.',
      es: 'Durante la estadía hay gente tuya en el lugar, no un chat. Un concierge fijo, accesible a cualquier hora.',
    },
  },
];

export const TEXTOS = {
  pt: {
    eyebrow: 'Concierge de alto padrão · presencial · Brasil',
    h1: 'Concierge de Alto Padrão em Todo o Brasil — Matriz Trancoso',
    sub: 'Mais de dez anos organizando estadias, casas e eventos privados para clientes brasileiros e estrangeiros. Mansões e vilas exclusivas, aviação executiva, equipe de casa e eventos privados — onde você estiver no Brasil. Matriz em Trancoso, equipes presenciais em São Paulo, Rio de Janeiro e montadas sob demanda em qualquer praça. Atendimento em português, espanhol e inglês.',
    ctaPrimario: 'Solicitar concierge',
    ctaSecundario: 'Falar no WhatsApp',
    pracasTitulo: 'Cobertura nacional, presença física',
    pracasSub: 'O concierge não é restrito a Trancoso — Trancoso é a nossa matriz. Atendemos qualquer destino do Brasil e a equipe vai até lá: não é indicação digital, é gente no local acompanhando check-in, governança e toda a operação.',
    perfilTitulo: 'Para quem trabalhamos',
    perfilItens: [
      'Proprietários de vilas, casas de alto padrão e pousadas de luxo',
      'Famílias e grupos brasileiros em estadias privadas',
      'Clientes estrangeiros — atendimento em português, espanhol e inglês',
      'Grupos da Argentina, São Paulo e Rio de Janeiro',
    ],
    idiomas: 'Atendimento em português, espanhol e inglês.',
    pilaresEyebrow: 'O que o concierge resolve',
    pilaresTitulo: 'Seis frentes, uma equipe só',
    etapasEyebrow: 'Como funciona',
    etapasTitulo: 'Do primeiro contato ao check-out',
    fundadorEyebrow: 'Quem comanda a experiência',
    fundadorTitulo: 'Mais de 10 anos em concierge de alto padrão — e uma trajetória que começou na música',
    fundadorTexto: 'O concierge é conduzido por Antonio Monteiro Pereira Junior, à frente da Toca Experience. A trajetória começou na música, como DJ e produtor de eventos, e é dela que vem o jeito de operar: leitura de ambiente, tempo de resposta e discrição. Hoje isso se traduz em casas de alto padrão, equipes presenciais e estadias organizadas nos detalhes.',
    fundadorCta: 'Conhecer a Toca Experience',
    galeriaTitulo: 'Trabalhos reais',
    galeriaSub: 'Registros de operações já entregues.',
    galeriaVazia: 'Galeria em atualização — fotos reais das operações entram aqui.',
    djTitulo: 'A trajetória na música',
    djSub: 'A origem da operação: DJ, produção e curadoria musical.',
    formEyebrow: 'Solicitação',
    formTitulo: 'Conte o que você precisa',
    formSub: 'Respondemos pelo WhatsApp. Sem compromisso nesta etapa.',
    labels: {
      nome: 'Nome completo', whatsapp: 'WhatsApp (com DDI)', email: 'E-mail',
      origem: 'De onde você fala', destino: 'Cidade / Estado do atendimento', periodo: 'Período',
      grupo: 'Nº de pessoas', servico: 'O que você precisa', mensagem: 'Detalhes do grupo (opcional)',
      consent: 'Autorizo o contato sobre esta solicitação.',
      enviar: 'Enviar solicitação', enviando: 'Enviando...',
      cookies: 'Gestionar Preferencias de Cookies',
      cookies: 'Gerenciar Preferências de Cookies',
    },
    origens: ['Argentina', 'Brasil — São Paulo', 'Brasil — Rio de Janeiro', 'Brasil — outra cidade', 'Outro país'],
    necessidadesLabel: 'Você também precisa de:',
    necessidades: ['Fretamento aéreo / helicóptero', 'Mansão / vila de luxo', 'Receptivo de aeroporto (fast-track / sala VIP)'],
    servicos: ['Estadia completa com casa e equipe', 'Mansão / vila para uso exclusivo', 'Aviação executiva ou helicóptero', 'Recepção e assistência no aeroporto', 'Gestão de casa / vila', 'Logística e transporte', 'Chef privado e gastronomia', 'Evento privado / celebração', 'Outro'],
    sucesso: 'Solicitação recebida. Entramos em contato pelo WhatsApp.',
    erro: 'Não foi possível enviar agora. Tente pelo WhatsApp.',
    consentObrigatorio: 'Marque a autorização de contato para enviar.',
  },
  es: {
    eyebrow: 'Concierge de alto nivel · presencial · Brasil',
    h1: 'Concierge de Alto Nivel en Todo Brasil — Casa Matriz Trancoso',
    sub: 'Más de diez años organizando estadías, casas y eventos privados para clientes brasileños y extranjeros. Mansiones y villas exclusivas, aviación ejecutiva, equipo de casa y eventos privados — donde estés en Brasil. Casa matriz en Trancoso, equipos presenciales en São Paulo, Río de Janeiro y armados a demanda en cualquier destino. Atención en portugués, español e inglés.',
    ctaPrimario: 'Solicitar concierge',
    ctaSecundario: 'Hablar por WhatsApp',
    pracasTitulo: 'Cobertura nacional, presencia física',
    pracasSub: 'El concierge no está limitado a Trancoso — Trancoso es nuestra casa matriz. Atendemos cualquier destino de Brasil y el equipo viaja: no es una recomendación digital, es gente en el lugar acompañando el check-in, la gobernanza y toda la operación.',
    perfilTitulo: 'Para quiénes trabajamos',
    perfilItens: [
      'Propietarios de villas, casas de alto nivel y posadas de lujo',
      'Familias y grupos en estadías privadas',
      'Clientes extranjeros — atención en portugués, español e inglés',
      'Grupos de Argentina, São Paulo y Río de Janeiro',
    ],
    idiomas: 'Atención en portugués, español e inglés.',
    pilaresEyebrow: 'Qué resuelve el concierge',
    pilaresTitulo: 'Seis frentes, un solo equipo',
    etapasEyebrow: 'Cómo funciona',
    etapasTitulo: 'Del primer contacto al check-out',
    fundadorEyebrow: 'Quién comanda la experiencia',
    fundadorTitulo: 'Más de 10 años en concierge de alto nivel — y una trayectoria que empezó en la música',
    fundadorTexto: 'El concierge está conducido por Antonio Monteiro Pereira Junior, al frente de Toca Experience. La trayectoria empezó en la música, como DJ y productor de eventos, y de ahí viene la forma de operar: lectura del ambiente, tiempo de respuesta y discreción. Hoy eso se traduce en casas de alto nivel, equipos presenciales y estadías cuidadas en el detalle.',
    fundadorCta: 'Conocer Toca Experience',
    galeriaTitulo: 'Trabajos reales',
    galeriaSub: 'Registros de operaciones ya entregadas.',
    galeriaVazia: 'Galería en actualización — las fotos reales entran acá.',
    djTitulo: 'La trayectoria en la música',
    djSub: 'El origen de la operación: DJ, producción y curaduría musical.',
    formEyebrow: 'Solicitud',
    formTitulo: 'Contanos qué necesitás',
    formSub: 'Respondemos por WhatsApp. Sin compromiso en esta etapa.',
    labels: {
      nome: 'Nombre completo', whatsapp: 'WhatsApp (con código de país)', email: 'E-mail',
      origem: 'Desde dónde escribís', destino: 'Ciudad / Estado de la atención', periodo: 'Período',
      grupo: 'Nº de personas', servico: 'Qué necesitás', mensagem: 'Detalles del grupo (opcional)',
      consent: 'Autorizo el contacto sobre esta solicitud.',
      enviar: 'Enviar solicitud', enviando: 'Enviando...',
    },
    origens: ['Argentina', 'Brasil — São Paulo', 'Brasil — Río de Janeiro', 'Brasil — otra ciudad', 'Otro país'],
    necessidadesLabel: 'También necesitás:',
    necessidades: ['Fletamento aéreo / helicóptero', 'Mansión / villa de lujo', 'Receptivo de aeropuerto (fast-track / sala VIP)'],
    servicos: ['Estadía completa con casa y equipo', 'Mansión / villa de uso exclusivo', 'Aviación ejecutiva o helicóptero', 'Recepción y asistencia en el aeropuerto', 'Gestión de casa / villa', 'Logística y transporte', 'Chef privado y gastronomía', 'Evento privado / celebración', 'Otro'],
    sucesso: 'Solicitud recibida. Te contactamos por WhatsApp.',
    erro: 'No fue posible enviar ahora. Probá por WhatsApp.',
    consentObrigatorio: 'Marcá la autorización de contacto para enviar.',
  },
};
