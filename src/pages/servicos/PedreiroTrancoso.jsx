import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function PedreiroTrancoso() {
  return (
    <ServicoLocalPage
      title="Pedreiro em Trancoso, BA | Obras e Reformas com Profissionais Verificados | Trancoso Resolve"
      metaDescription="Encontre pedreiro de confiança em Trancoso, Bahia. Obras, reformas, ampliações e manutenção para villas e residências de alto padrão. Profissionais verificados, orçamento grátis."
      keywords="pedreiro Trancoso, pedreiro Trancoso Bahia, profissional Trancoso BA, serviços Trancoso, obra Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/pedreiro-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Pedreiro Trancoso",
        "description": "Pedreiros verificados em Trancoso, BA. Obras e reformas para villas e residências de alto padrão.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Pedreiro em Trancoso: Obras e Reformas para Residências de Alto Padrão"
      intro="Trancoso concentra um dos mercados imobiliários mais valorizados da Bahia. Obras, reformas e ampliações acontecem o ano inteiro — e encontrar um pedreiro que conheça as particularidades da região, os materiais locais e os padrões exigidos por villas e residências de luxo faz toda a diferença no resultado e no prazo. Na Trancoso Resolve, todos os pedreiros são verificados e avaliados por clientes reais."
      servicesTitle="Serviços de pedreiro em Trancoso"
      services={[
        'Obras de reforma e ampliação em villas e residências de alto padrão',
        'Construção de piscinas, churrasqueiras e áreas gourmet',
        'Revestimento com pedras naturais, cerâmicas e materiais nobres',
        'Manutenção de muros, calçadas e estruturas externas',
        'Assentamento de pisos e azulejos em áreas internas e externas',
        'Reboco, massa corrida e preparação de paredes para pintura',
        'Demolições e adequações estruturais com segurança',
        'Construção de banheiros, lavabos e áreas molhadas completas',
      ]}
      howTitle="Por que contratar um pedreiro pela Trancoso Resolve?"
      howText="Reformas em Trancoso têm particularidades: materiais como pedra-ferro, madeira de demolição e cerâmicas artesanais exigem mão de obra especializada. Todos os pedreiros da plataforma passam por verificação de identidade e têm histórico de avaliações de clientes anteriores, para que você saiba exatamente com quem está contratando antes de assinar qualquer contrato."
      cta="Descreva sua obra ou reforma e receba contato de pedreiros verificados e experientes em construção de alto padrão em Trancoso."
      ctaButton="Contratar pedreiro em Trancoso"
      category="Pedreiro"
      heroEmoji="🧱"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "Trancoso concentra um dos mercados imobiliários mais valorizados da Bahia, com obras e reformas em villas e residências de alto padrão acontecendo o ano inteiro — mesmo na baixa temporada. Pedreiros com experiência local entendem o cronograma da região e sabem planejar entregas antes do início da alta temporada.",
        "A arquitetura de Trancoso mistura técnicas vernaculares com acabamentos contemporâneos: pedra-ferro, madeira de demolição, cerâmicas artesanais e revestimentos rústicos exigem mão de obra especializada. Pedreiros sem experiência nesse tipo de construção tendem a cometer erros de acabamento que comprometem o resultado final.",
        "Para obras em condomínios fechados e áreas como o Quadrado, é preciso respeitar normas específicas de preservação e protocolos de acesso. Os pedreiros cadastrados na Trancoso Resolve têm histórico de projetos na região e referências verificáveis de proprietários que já utilizaram o serviço.",
      ]}
    />
  );
}