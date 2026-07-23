import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function PedreiroPortoSeguro() {
  return (
    <ServicoLocalPage
      title="Pedreiro em Porto Seguro | Trancoso Resolve"
      metaDescription="Encontre pedreiro verificado em Porto Seguro, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="pedreiro Porto Seguro, pedreiro Porto Seguro BA, profissional Porto Seguro Bahia, obra Porto Seguro"
      canonicalUrl="https://trancosoresolve.com.br/servicos/pedreiro-porto-seguro"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Pedreiro Porto Seguro",
        "description": "Pedreiros verificados em Porto Seguro, BA. Obras e reformas para hotéis, pousadas e residências.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Porto Seguro, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.4497, "longitude": -39.0647 }
      }}
      h1="Pedreiro em Porto Seguro"
      intro="Porto Seguro vive um ciclo contínuo de obras e reformas — em condomínios novos, hotéis em renovação, pousadas em expansão e residências que precisam de manutenção constante no clima tropical. Encontrar um pedreiro de confiança, com referências verificadas e experiência no contexto local, é o que a Trancoso Resolve oferece."
      servicesTitle="Serviços de pedreiro em Porto Seguro"
      services={[
        'Reforma e ampliação de residências, pousadas e empreendimentos comerciais',
        'Construção de piscinas, churrasqueiras e áreas gourmet',
        'Revestimento com cerâmicas, pedras e materiais de acabamento',
        'Manutenção de muros, calçadas e estruturas externas',
        'Assentamento de pisos e azulejos em áreas internas e externas',
        'Reboco, massa corrida e preparação de paredes',
        'Construção de banheiros, lavabos e áreas molhadas',
      ]}
      howTitle="Pedreiros verificados em Porto Seguro"
      howText="Obras em Porto Seguro têm particularidades climáticas: a umidade alta e a brisa marinha afetam o tempo de cura de cimentos e argamassas, e materiais inadequados se deterioram rapidamente. Pedreiros com experiência local conhecem esses detalhes e fazem as escolhas certas desde o início — evitando retrabalho e custos adicionais."
      cta="Descreva sua obra em Porto Seguro e receba contato de pedreiros verificados com experiência na região."
      ctaButton="Contratar pedreiro em Porto Seguro"
      category="Pedreiro"
      heroEmoji="🧱"
      locationLabel="Porto Seguro, Bahia"
      seoText={[
        "Porto Seguro tem um mercado de construção civil ativo o ano todo — com obras em condomínios na orla norte, reformas de casarões históricos no centro tombado, ampliações de pousadas em Arraial d'Ajuda e construção de novas residências nos loteamentos da área rural. Pedreiros com experiência na cidade conhecem os fornecedores locais, os prazos de entrega de materiais e as normas específicas para cada tipo de área.",
        "A proximidade com o mar em Porto Seguro exige cuidados especiais na escolha de materiais de construção: cimentos com resistência à umidade, tintas antimofo e revestimentos que suportem a salinidade constante. Pedreiros experientes na orla já trabalham naturalmente com esses cuidados, sem necessidade de orientação técnica adicional.",
        "Para reformas em pousadas e empreendimentos de hospedagem, o cronograma é crítico: a obra precisa estar concluída antes da alta temporada para não comprometer a ocupação. Os pedreiros cadastrados na Trancoso Resolve têm histórico de projetos em Porto Seguro e referências verificáveis de clientes reais — para que você tome a decisão com segurança.",
      ]}
    />
  );
}