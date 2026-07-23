import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function DiaristaCaraiva() {
  return (
    <ServicoLocalPage
      title="Diarista em Caraíva | Trancoso Resolve"
      metaDescription="Encontre diarista verificada em Caraíva, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="diarista Caraíva, diarista Caraíva Bahia, profissional Caraíva BA, serviços Caraíva, limpeza Caraíva"
      canonicalUrl="https://trancosoresolve.com.br/servicos/diarista-caraiva"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Diarista Caraíva",
        "description": "Diaristas verificadas em Caraíva, BA. Limpeza para pousadas, villas e residências.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Caraíva, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.7397, "longitude": -39.1731 }
      }}
      h1="Diarista em Caraíva"
      intro="Caraíva é um dos destinos mais preservados da Costa do Descobrimento — e manter sua pousada, villa ou residência impecável nesse paraíso exige uma diarista de confiança. A Trancoso Resolve conecta você com profissionais verificadas que conhecem a realidade de Caraíva: o acesso por canoa, a ausência de asfalto e as especificidades das construções rústicas de alto padrão da região."
      servicesTitle="Serviços de diarista em Caraíva"
      services={[
        'Limpeza residencial completa para villas, bangalôs e pousadas',
        'Limpeza pós-hospedagem e manutenção para imóveis de aluguel por temporada',
        'Organização de enxoval, roupas de cama e toalhas',
        'Cuidado com madeira, palha e materiais naturais típicos das construções locais',
        'Limpeza pós-evento e preparação para chegada de hóspedes',
        'Plano de manutenção periódica para imóveis desocupados',
      ]}
      howTitle="Por que contratar diarista em Caraíva pela Trancoso Resolve?"
      howText="Caraíva é isolada e especial — e isso exige profissionais que conhecem o local. Todas as diaristas da plataforma passam por verificação de identidade e têm avaliações públicas de clientes reais. Você combina diretamente horários, frequência e valores, sem intermediários."
      cta="Descreva sua necessidade em Caraíva e receba contato de diaristas verificadas e experientes na região."
      ctaButton="Contratar diarista em Caraíva"
      category="Limpeza"
      heroEmoji="🧹"
      locationLabel="Caraíva, Bahia"
      seoText={[
        "Caraíva é um vilarejo sem asfalto e sem carros, acessível apenas de barco pelo Rio Caraíva — o que torna a logística de qualquer serviço mais complexa do que no restante da Costa do Descobrimento. Diaristas que atendem Caraíva precisam conhecer essa realidade: como se deslocar, quais materiais de limpeza funcionam melhor nas construções de madeira e palha da região, e como manter a qualidade mesmo com recursos mais limitados.",
        "As pousadas e villas de Caraíva têm um charme rústico e sustentável que diferencia o destino de Trancoso e Porto Seguro. Quem atende nessas propriedades sabe que o cuidado deve respeitar os materiais naturais — madeira tratada, tijolos aparentes, telhas de barro — sem produtos químicos agressivos. A Trancoso Resolve filtra profissionais com experiência específica nesse tipo de imóvel.",
        "Seja para limpeza diária de uma pousada à beira do rio, para preparação de uma villa antes da chegada de hóspedes VIP ou para manutenção de um imóvel de segunda residência durante a baixa temporada, a plataforma oferece diaristas avaliadas por proprietários reais de Caraíva e região.",
      ]}
    />
  );
}