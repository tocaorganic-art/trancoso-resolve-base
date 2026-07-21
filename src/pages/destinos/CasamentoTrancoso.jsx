import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function CasamentoTrancoso() {
  return (
    <ServicoLocalPage
      title="Casamento em Trancoso: Guia Completo | Profissionais Verificados"
      metaDescription="Tudo para seu casamento em Trancoso: chef, DJ, decoração, segurança, fotógrafo e mais. Profissionais verificados, orçamento grátis. A gente resolve!"
      keywords="casamento Trancoso, wedding Trancoso, casamento Bahia, casamento praia Trancoso, fornecedores casamento Trancoso, buffet casamento Trancoso"
      canonicalUrl="https://www.trancosoresolve.com.br/destinos/casamento-trancoso"
      schemaData={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Fornecedores para Casamento em Trancoso',
        description: 'Plataforma completa de fornecedores verificados para casamentos em Trancoso, Bahia: chef, DJ, segurança, decoração, fotógrafo e mais.',
        serviceType: 'Organização e Fornecedores de Casamento',
        provider: { '@type': 'LocalBusiness', name: 'Trancoso Resolve', url: 'https://www.trancosoresolve.com.br' },
        areaServed: { '@type': 'City', name: 'Trancoso, BA' },
        url: 'https://www.trancosoresolve.com.br/destinos/casamento-trancoso',
      }}
      faqData={[
        {
          question: 'Quanto custa casar em Trancoso?',
          answer: 'Um casamento em Trancoso pode custar de R$ 50.000 a R$ 500.000+, dependendo do número de convidados, espaço e fornecedores. Via Trancoso Resolve você solicita orçamentos de fornecedores locais verificados e compara preços.',
        },
        {
          question: 'Qual é a melhor época para casar em Trancoso?',
          answer: 'Os meses de setembro a novembro e março a maio são os mais indicados: clima estável, menos chuva e período fora da alta temporada. O Réveillon e o Carnaval também têm demanda alta para casamentos na região.',
        },
        {
          question: 'Onde realizar a cerimônia de casamento em Trancoso?',
          answer: 'Os espaços mais procurados são o Quadrado histórico, pousadas boutique com jardins, praias privadas e villas com vista para o mar. Cada local tem regras próprias de som e horário.',
        },
        {
          question: 'A Trancoso Resolve ajuda a contratar todos os fornecedores do casamento?',
          answer: 'Sim. A plataforma conecta você a DJ, chef, cozinheiro, garçom, segurança, motorista e outros profissionais verificados para casamentos em Trancoso, tudo em um só lugar.',
        },
      ]}
      h1="Planeje seu Casamento em Trancoso com Profissionais Verificados"
      intro="Casar em Trancoso é realizar um sonho — o Quadrado histórico, as praias de água cristalina e as pousadas boutique criam o cenário perfeito. A Trancoso Resolve conecta você a todos os fornecedores de que você precisa: chef, DJ, segurança, garçom e mais, todos verificados e avaliados por outros casais."
      servicesTitle="Fornecedores para casamento disponíveis em Trancoso"
      services={[
        'Chef e cozinheiro para jantar de recepção e cardápio personalizado',
        'DJ profissional para cerimônia, coquetel e festa',
        'Garçom e equipe de serviço para o dia do casamento',
        'Segurança para controle de acesso e proteção dos convidados',
        'Motorista e transfer para noivos e convidados',
        'Piscineiro e jardineiro para preparação do espaço',
        'Diarista para limpeza pré e pós-evento',
        'Eletricista e técnico de som para montagem de equipamentos',
      ]}
      howTitle="Como funciona a Trancoso Resolve para casamentos?"
      howText="Você descreve seu casamento — data, número de convidados, espaço e serviços que precisa — e a Trancoso Resolve conecta você a fornecedores locais verificados. Cada profissional tem avaliações de clientes anteriores e passou por verificação de antecedentes. Você negocia diretamente, sem intermediários. Simples assim — a gente resolve."
      cta="Descreva seu casamento e receba contato de fornecedores verificados em Trancoso: chef, DJ, segurança, garçom e mais."
      ctaButton="Encontrar fornecedores para casamento"
      category="Eventos"
      serviceLabel="fornecedores para casamento"
      heroEmoji="💍"
      locationLabel="Trancoso, Bahia"
      seoText={[
        'Trancoso é um dos destinos mais procurados para casamentos no Brasil. O Quadrado histórico, as praias de Nativos e Itapororoca, e as pousadas boutique da região criam um cenário único para cerimônias intimistas e festas sofisticadas. A demanda crescente trouxe uma rede de fornecedores locais especializados em eventos de alto padrão.',
        'Organizar um casamento em Trancoso de fora da Bahia pode ser desafiador: encontrar fornecedores confiáveis, coordenar logística e garantir qualidade sem conhecer pessoalmente os profissionais. A Trancoso Resolve resolve isso conectando noivos a fornecedores verificados, com histórico público de avaliações e atendimento via WhatsApp.',
        'Além do DJ e do chef, um casamento em Trancoso precisa de uma equipe completa: garçons, segurança para controle de acesso, motoristas para transfer de convidados e profissionais de manutenção para preparação do espaço. A plataforma cobre todos esses perfis com profissionais que já atuaram em casamentos na região.',
      ]}
    />
  );
}
