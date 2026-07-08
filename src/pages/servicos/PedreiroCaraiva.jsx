import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function PedreiroCaraiva() {
  return (
    <ServicoLocalPage
      title="Pedreiro em Caraíva | Trancoso Resolve"
      metaDescription="Encontre pedreiro verificado em Caraíva, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="pedreiro Caraíva, pedreiro Caraíva Bahia, profissional Caraíva BA, serviços Caraíva, obra Caraíva"
      canonicalUrl="https://trancosoresolve.com.br/servicos/pedreiro-caraiva"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Pedreiro Caraíva",
        "description": "Pedreiros verificados em Caraíva, BA. Obras e reformas para pousadas e villas.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Caraíva, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.7397, "longitude": -39.1731 }
      }}
      h1="Pedreiro em Caraíva"
      intro="Obras em Caraíva têm um grau de complexidade logística incomum: todo material precisa chegar de barco ou por estrada de terra, e os prazos dependem da maré e das condições climáticas. Profissionais que já trabalharam em Caraíva conhecem essa realidade e sabem planejar obras dentro dessas restrições. A Trancoso Resolve conecta você a pedreiros verificados com experiência no lugar."
      servicesTitle="Serviços de pedreiro em Caraíva"
      services={[
        'Reforma e ampliação de pousadas, bangalôs e residências',
        'Construção com materiais naturais: taipa, adobe, bambu e madeira',
        'Revestimento com pedras naturais, cerâmicas e materiais rústicos',
        'Manutenção de estruturas em clima úmido e salino',
        'Assentamento de pisos e azulejos em áreas internas e externas',
        'Construção de banheiros, lavabos e áreas molhadas completas',
      ]}
      howTitle="Por que contratar pedreiro em Caraíva pela Trancoso Resolve?"
      howText="A arquitetura de Caraíva mistura construção vernacular com requinte contemporâneo — usando bambu, madeira de reflorestamento, barro e pedras locais. Pedreiros com experiência nesse estilo entendem as técnicas específicas e os cuidados com materiais naturais em clima tropical úmido. Todos são verificados e têm avaliações de clientes reais na plataforma."
      cta="Descreva sua obra em Caraíva e receba contato de pedreiros verificados com experiência na região."
      ctaButton="Contratar pedreiro em Caraíva"
      category="Pedreiro"
      heroEmoji="🧱"
      locationLabel="Caraíva, Bahia"
      seoText={[
        "Construir ou reformar em Caraíva é um desafio logístico sem igual: o acesso principal ainda é feito de barco pelo Rio Caraíva, e todo material de construção precisa ser planejado com antecedência. Pedreiros que trabalham regularmente na região já têm fornecedores locais, conhecem os horários das travessias e sabem como organizar o canteiro de obras respeitando as restrições ambientais da área de preservação.",
        "A arquitetura de Caraíva tem uma identidade singular — com construções que integram madeira, bambu, pedras do rio e cobertura de palha, criando espaços de alto padrão com estética rústica e sustentável. Esse tipo de construção exige técnicas diferentes das usadas em obras convencionais, e pedreiros sem experiência local tendem a cometer erros de acabamento que comprometem tanto a estética quanto a durabilidade.",
        "Para reformas em pousadas durante a baixa temporada, o planejamento de cronograma é fundamental: a obra precisa estar concluída antes da volta dos hóspedes na alta temporada. Os pedreiros cadastrados na Trancoso Resolve têm histórico de projetos em Caraíva e referências verificáveis de proprietários que já utilizaram o serviço.",
      ]}
    />
  );
}