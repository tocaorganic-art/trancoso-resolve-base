import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function DiaristaTrancoso() {
  return (
    <ServicoLocalPage
      title="Diarista em Trancoso – Limpeza Premium para Villas, Pousadas e Residências de Alto Padrão"
      metaDescription="Contrate diarista verificada em Trancoso para limpeza residencial, villas, pousadas e casas de temporada. Profissionais treinados para residências de alto padrão. Peça orçamento pela Trancoso Resolve."
      keywords="diarista Trancoso, diarista Trancoso Bahia, profissional Trancoso BA, serviços Trancoso, limpeza Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/diarista-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Diarista Trancoso",
        "description": "Diaristas verificadas em Trancoso, BA. Limpeza para villas, pousadas e residências de alto padrão.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Diarista em Trancoso: Limpeza Especializada para Residências de Alto Padrão"
      intro="Sua villa ou residência em Trancoso merece atenção aos detalhes que só uma profissional treinada para ambientes de alto padrão pode oferecer. Na Trancoso Resolve, cada diarista passa por verificação de antecedentes e é avaliada por clientes reais — para que você contrate com total tranquilidade."
      servicesTitle="Serviços de diarista premium em Trancoso"
      services={[
        'Limpeza residencial completa para villas, casas e apartamentos de alto padrão',
        'Limpeza pós-hospedagem em pousadas, guest houses e imóveis de aluguel por temporada',
        'Passagem e organização de enxoval, roupas de cama e toalhas',
        'Cuidado especial com materiais nobres: madeira de demolição, cerâmicas artesanais, tecidos importados',
        'Limpeza pós-evento para propriedades que recebem convidados',
        'Plano de manutenção periódica para imóveis desocupados ou de segunda residência',
      ]}
      howTitle="Por que escolher uma diarista pela Trancoso Resolve?"
      howText="Sabemos que em Trancoso — onde a maioria das residências é de alto valor e possui acabamentos especiais — não dá para arriscar com qualquer profissional. Por isso, todas as diaristas da plataforma passam por verificação de identidade, análise de antecedentes criminais e têm avaliações públicas de clientes anteriores. Você combina diretamente valores, frequência e horário — sem intermediários nem taxas ocultas."
      cta="Descreva sua necessidade e receba contato de diaristas verificadas e experientes em imóveis de alto padrão em Trancoso."
      ctaButton="Contratar diarista em Trancoso"
      category="Limpeza"
      heroEmoji="🧹"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "Trancoso é um dos destinos mais valorizados da Bahia, com um mercado imobiliário concentrado em villas, pousadas boutique e residências de segunda moradia de alto padrão. Diaristas que atendem a região precisam estar preparadas para o cuidado com materiais nobres — madeira de demolição, cerâmicas artesanais e tecidos importados — comuns nas construções locais.",
        "A alta temporada em Trancoso traz um fluxo intenso de hóspedes e exige diaristas com disponibilidade flexível para limpeza pós-hospedagem em pousadas e casas de aluguel por temporada. A Trancoso Resolve filtra profissionais com experiência comprovada nesse ritmo, com comunicação direta pelo WhatsApp para ajustes de última hora.",
        "Para proprietários que vivem fora de Trancoso e mantêm uma residência de temporada, o plano de manutenção periódica evita o acúmulo de poeira, mofo e desgaste típico do clima úmido baiano. A plataforma conecta você a diaristas verificadas, com avaliações públicas de outros clientes da região.",
      ]}
    />
  );
}