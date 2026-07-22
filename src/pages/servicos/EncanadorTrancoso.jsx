import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function EncanadorTrancoso() {
  return (
    <ServicoLocalPage
      title="Encanador em Trancoso, BA | Hidráulica e Manutenção | Trancoso Resolve"
      metaDescription="Contrate encanador verificado em Trancoso, Bahia. Vazamentos, instalações hidráulicas, reparos urgentes e manutenção para villas, pousadas e residências. Atendimento rápido, orçamento grátis."
      keywords="encanador Trancoso, encanador Trancoso Bahia, profissional Trancoso BA, serviços Trancoso, hidráulica Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/encanador-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Encanador Trancoso",
        "description": "Encanadores verificados em Trancoso, BA. Reparos hidráulicos e instalações em villas e pousadas.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Encanador em Trancoso: Hidráulica e Manutenção para Residências e Pousadas"
      intro="Um vazamento ou problema hidráulico em Trancoso pode evoluir rapidamente por conta da umidade e do calor — especialmente em imóveis de temporada que ficam fechados por longos períodos. Na Trancoso Resolve você encontra encanadores verificados, prontos para atender emergências e realizar instalações completas em villas, pousadas e residências da região."
      servicesTitle="Serviços de encanamento em Trancoso"
      services={[
        'Reparo emergencial de vazamentos em tubulações internas e externas',
        'Instalação e substituição de torneiras, chuveiros e registros',
        'Desentupimento de ralos, pias, vasos sanitários e esgoto',
        'Instalação de caixas d\'água, bombas e sistemas de pressurização',
        'Manutenção preventiva de sistemas hidráulicos em imóveis de temporada',
        'Instalação de aquecedores a gás e elétricos',
        'Vistoria hidráulica completa para compra ou locação de imóveis',
        'Reparo de infiltrações e impermeabilização de lajes e paredes',
      ]}
      howTitle="Por que contratar um encanador pela Trancoso Resolve?"
      howText="Encontrar um encanador confiável em Trancoso para uma emergência — especialmente em imóvel de temporada, quando o proprietário está longe — é um problema recorrente. Todos os encanadores da plataforma são verificados, têm avaliações de clientes anteriores publicadas e podem ser acionados diretamente pelo WhatsApp, com prazo de resposta rápido mesmo na temporada de alta."
      cta="Descreva o problema hidráulico e receba contato de encanadores verificados com experiência em imóveis de alto padrão em Trancoso."
      ctaButton="Contratar encanador em Trancoso"
      category="Encanador"
      heroEmoji="🔧"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "Imóveis de segunda residência em Trancoso costumam ficar fechados por longos períodos entre uma temporada e outra — condição que favorece vazamentos silenciosos, infiltrações e corrosão de tubulações sem que ninguém perceba a tempo. Encanadores com experiência local sabem onde procurar primeiro e como evitar danos maiores em propriedades desocupadas.",
        "A umidade constante e o solo arenoso de Trancoso aumentam o risco de problemas em fossas, caixas d'água e sistemas de pressurização, especialmente em villas afastadas da rede de saneamento central. Profissionais cadastrados na plataforma conhecem essas particularidades e chegam preparados com as peças e ferramentas certas.",
        "Durante a alta temporada, o volume de hóspedes em pousadas e casas de aluguel eleva a demanda por reparos emergenciais — um vaso entupido ou um chuveiro sem água quente não pode esperar dias. A Trancoso Resolve conecta proprietários a encanadores verificados, com tempo de resposta rápido pelo WhatsApp.",
      ]}
    />
  );
}