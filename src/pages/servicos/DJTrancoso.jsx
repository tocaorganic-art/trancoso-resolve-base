import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function DJTrancoso() {
  return (
    <ServicoLocalPage
      title="DJ para Casamento e Eventos em Trancoso | Som Profissional | Trancoso Resolve"
      metaDescription="DJ profissional em Trancoso para casamento, Réveillon, aniversário e festas corporativas. Som cristalino, equipamento de ponta, playlist personalizada. Orçamento grátis!"
      keywords="DJ Trancoso, DJ casamento Trancoso, DJ eventos Trancoso, som para evento Trancoso, DJ Bahia, DJ Réveillon Trancoso"
      canonicalUrl="https://www.trancosoresolve.com.br/servicos/dj-trancoso"
      schemaData={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'DJ para Eventos em Trancoso',
        description: 'DJ profissional para casamentos, Réveillon e festas em Trancoso, BA. Equipamento de ponta, playlist personalizada, suporte técnico completo.',
        serviceType: 'DJ e Som para Eventos',
        provider: { '@type': 'LocalBusiness', name: 'Trancoso Resolve', url: 'https://www.trancosoresolve.com.br' },
        areaServed: [
          { '@type': 'City', name: 'Trancoso, BA' },
          { '@type': 'City', name: 'Arraial d\'Ajuda, BA' },
          { '@type': 'City', name: 'Porto Seguro, BA' },
        ],
        url: 'https://www.trancosoresolve.com.br/servicos/dj-trancoso',
      }}
      faqData={[
        {
          question: 'Quanto custa contratar um DJ em Trancoso?',
          answer: 'O valor varia de R$ 800 a R$ 3.500 por evento, dependendo da duração, equipamento e experiência do DJ. Via Trancoso Resolve você recebe orçamentos de DJs verificados em até 5 minutos.',
        },
        {
          question: 'O DJ traz o equipamento de som ou preciso alugar à parte?',
          answer: 'A maioria dos DJs cadastrados na Trancoso Resolve inclui equipamento completo (caixas, mesa, cabos, iluminação básica). Confirme com o profissional no momento do orçamento.',
        },
        {
          question: 'É possível contratar DJ para casamento em Trancoso no Quadrado?',
          answer: 'Sim. Os DJs da plataforma têm experiência em eventos no Quadrado de Trancoso, pousadas boutique, villas e espaços abertos. Eles conhecem as restrições de som e os horários da região.',
        },
        {
          question: 'Com quanto antecedência devo contratar DJ para Réveillon em Trancoso?',
          answer: 'Para Réveillon e alta temporada em Trancoso, recomenda-se contratar com pelo menos 60 a 90 dias de antecedência. A agenda dos DJs locais esgota rápido na virada do ano.',
        },
      ]}
      h1="DJ Profissional para Eventos em Trancoso"
      intro="Trancoso tem uma das viradas de ano e temporadas de casamento mais disputadas do Brasil — e o DJ certo faz toda a diferença. Na Trancoso Resolve você encontra DJs verificados com experiência em festas no Quadrado, villas de alto padrão e cerimônias à beira-mar, com playlist personalizada e equipamento de ponta."
      servicesTitle="Serviços de DJ e som para eventos em Trancoso"
      services={[
        'DJ para casamento — cerimônia, coquetel e festa de recepção',
        'DJ para Réveillon e festas de virada de ano em Trancoso',
        'DJ para aniversário, festa corporativa e confraternização',
        'Som e iluminação para eventos em espaços abertos e villas',
        'Playlist personalizada de acordo com o perfil dos convidados',
        'Locação de equipamento profissional: caixas, mesa, subwoofer e iluminação',
        'DJ para cerimônia de casamento no Quadrado histórico de Trancoso',
        'Suporte técnico completo durante o evento',
      ]}
      howTitle="Por que contratar DJ pela Trancoso Resolve?"
      howText="Trancoso é um destino com particularidades: eventos no Quadrado têm restrições de som, villas afastadas precisam de gerador, e a programação da alta temporada exige profissionais com agenda confiável. Os DJs da plataforma são verificados, têm avaliações de eventos anteriores e conhecem as regras locais — para que você não tenha surpresas na hora H."
      cta="Descreva seu evento, a data e o número de convidados — receba contato de DJs verificados com experiência em festas em Trancoso."
      ctaButton="Contratar DJ em Trancoso"
      category="DJ"
      serviceLabel="DJ"
      heroEmoji="🎧"
      locationLabel="Trancoso, Bahia"
      seoText={[
        'Trancoso concentra alguns dos casamentos e festas privadas mais sofisticados da Bahia. A combinação de beleza natural, gastronomia e infraestrutura de pousadas boutique atrai celebrações de alto padrão ao longo de todo o ano — especialmente no Réveillon, quando o Quadrado histórico recebe festas memoráveis.',
        'Contratar um DJ local com experiência em Trancoso é importante porque os eventos no Quadrado e em villas da região têm regras específicas de horário e volume de som. Profissionais que já atuaram na região conhecem essas particularidades e evitam problemas durante a festa.',
        'Via Trancoso Resolve você compara DJs com experiência comprovada em casamentos, festas de aniversário e eventos corporativos em Trancoso, Arraial d\'Ajuda e Porto Seguro. Orçamento grátis, perfis verificados e avaliações reais de outros clientes.',
      ]}
    />
  );
}
