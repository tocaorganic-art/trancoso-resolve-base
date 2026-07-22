import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function PitingaTrancoso() {
  return (
    <ServicoLocalPage
      title="Serviços em Pitinga, Trancoso BA | Profissionais para Praia e Propriedades | Trancoso Resolve"
      metaDescription="Contrate profissionais verificados para serviços em Pitinga, Trancoso: manutenção de casas de praia, diaristas, eletricistas, encanadores e muito mais. Especialistas em propriedades à beira-mar."
      keywords="serviços Pitinga Trancoso, profissional Pitinga Trancoso BA, diarista Pitinga, eletricista Pitinga, manutenção casa de praia Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/pitinga-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Serviços em Pitinga",
        "description": "Profissionais verificados para manutenção de casas de praia e propriedades à beira-mar em Pitinga, Trancoso, BA.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "Place", "name": "Pitinga, Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Serviços em Pitinga, Trancoso: Especialistas em Casas de Praia e Propriedades à Beira-Mar"
      intro="Pitinga é uma das praias mais exclusivas de Trancoso — com propriedades de frente para o mar, pousadas boutique e casas de temporada que sofrem com os efeitos da maresia, umidade e da proximidade com o oceano. Na Trancoso Resolve você encontra profissionais verificados com experiência nas particularidades da manutenção de imóveis costeiros na região."
      servicesTitle="Serviços disponíveis em Pitinga, Trancoso"
      services={[
        'Diaristas para limpeza de casas de praia e pousadas em Pitinga',
        'Eletricistas com experiência em instalações afetadas por maresia e umidade',
        'Encanadores para reparos em sistemas hidráulicos de imóveis costeiros',
        'Pintores especializados em tintas anticorrosivas e resistentes à maresia',
        'Jardineiros para manutenção de jardins com plantas adaptadas ao litoral',
        'Piscineiros para tratamento de piscinas em propriedades de frente para o mar',
        'Motoristas para transfer entre Pitinga, o Quadrado e o aeroporto de Porto Seguro',
        'Chefs particulares para jantares e celebrações privadas à beira-mar',
      ]}
      howTitle="Por que usar a Trancoso Resolve em Pitinga?"
      howText="Imóveis em Pitinga têm desafios específicos: a maresia corrói instalações elétricas e metálicas, a umidade acelera problemas hidráulicos e os jardins exigem plantas adaptadas ao litoral. Os profissionais da plataforma conhecem essas particularidades e têm avaliações publicadas por proprietários de casas de praia e pousadas na região. Verificação de identidade e análise de antecedentes são obrigatórias para entrar na plataforma."
      cta="Descreva o serviço que precisa na sua propriedade em Pitinga e receba contato de profissionais verificados com experiência em imóveis costeiros de Trancoso."
      ctaButton="Contratar profissional em Pitinga"
      category="Diarista"
      heroEmoji="🏖️"
      serviceLabel="profissionais"
      locationLabel="Pitinga, Trancoso, Bahia"
      seoText={[
        "Pitinga é conhecida por seu paredão de falésias e propriedades exclusivas de frente para o mar — um cenário deslumbrante que também impõe desafios de manutenção únicos. A maresia constante acelera a corrosão de instalações elétricas e metálicas, exigindo profissionais que conheçam essas condições específicas.",
        "As pousadas boutique e casas de temporada de Pitinga recebem hóspedes de alto padrão durante toda a temporada, o que exige limpeza e manutenção impecáveis entre uma estadia e outra. A Trancoso Resolve filtra diaristas, eletricistas e encanadores com experiência comprovada em propriedades costeiras da região.",
        "Para proprietários que vivem fora de Trancoso, contar com profissionais de confiança em Pitinga é essencial para manter a propriedade em condições ideais mesmo à distância — desde o jardim adaptado ao litoral até a piscina de frente para o mar, passando por reparos elétricos e hidráulicos sazonais.",
      ]}
    />
  );
}