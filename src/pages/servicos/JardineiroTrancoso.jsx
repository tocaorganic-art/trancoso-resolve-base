import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function JardineiroTrancoso() {
  return (
    <ServicoLocalPage
      title="Jardineiro em Trancoso, BA | Jardins e Paisagismo para Villas | Trancoso Resolve"
      metaDescription="Contrate jardineiro verificado em Trancoso, Bahia. Manutenção de jardins, poda, paisagismo e cuidado com vegetação nativa para villas e residências de alto padrão. Orçamento grátis."
      keywords="jardineiro Trancoso, jardineiro Trancoso Bahia, profissional Trancoso BA, serviços Trancoso, paisagismo Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/jardineiro-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Jardineiro Trancoso",
        "description": "Jardineiros verificados em Trancoso, BA. Manutenção e paisagismo para villas e residências de alto padrão.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Jardineiro em Trancoso: Manutenção de Jardins e Paisagismo para Villas"
      intro="Os jardins de Trancoso são parte essencial da identidade das propriedades locais — com vegetação exuberante, espécies nativas da Mata Atlântica e paisagismo que integra o espaço interno ao ambiente natural. Manter esse equilíbrio exige um jardineiro que conheça o clima, o solo e as espécies da região. Na Trancoso Resolve você encontra jardineiros verificados com experiência em propriedades de alto padrão."
      servicesTitle="Serviços de jardinagem em Trancoso"
      services={[
        'Manutenção periódica de jardins em villas, pousadas e residências',
        'Poda técnica de árvores, arbustos e espécies nativas',
        'Paisagismo e replantio com espécies adequadas ao clima local',
        'Implantação e manutenção de gramados e forrações',
        'Cuidado com jardins de imóveis desocupados e casas de temporada',
        'Manejo de hortas orgânicas e canteiros de ervas aromáticas',
        'Controle fitossanitário: pragas, fungos e doenças em plantas',
        'Irrigação e sistema de aspersão para grandes jardins',
      ]}
      howTitle="Por que contratar um jardineiro pela Trancoso Resolve?"
      howText="O micro-clima de Trancoso — com alta pluviosidade no verão, sol intenso no inverno e proximidade com o mar — exige conhecimento específico sobre quais espécies prosperam e como manejar cada uma delas. Os jardineiros da plataforma são verificados, têm histórico de trabalhos em propriedades da região e avaliações publicadas por proprietários de villas e pousadas reais."
      cta="Descreva seu jardim e receba contato de jardineiros verificados com experiência em propriedades de alto padrão em Trancoso."
      ctaButton="Contratar jardineiro em Trancoso"
      category="Jardinagem"
      heroEmoji="🌿"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "Trancoso é cercada por remanescentes de Mata Atlântica e vegetação de restinga, criando um cenário natural que muitas villas e pousadas buscam integrar ao paisagismo. Jardineiros com experiência local sabem trabalhar com espécies nativas, respeitando o equilíbrio entre a vegetação espontânea e o projeto paisagístico planejado.",
        "O clima de Trancoso alterna entre alta pluviosidade no verão e sol intenso no inverno, exigindo manejo diferenciado conforme a estação — desde o controle de crescimento acelerado até a irrigação em períodos de seca. Os jardineiros da plataforma conhecem esse ritmo e ajustam a frequência de manutenção conforme a necessidade real de cada jardim.",
        "Para proprietários que moram fora de Trancoso e visitam a propriedade apenas em temporadas específicas, o serviço de manutenção periódica evita que o jardim fique descuidado por meses. A Trancoso Resolve conecta você a jardineiros verificados, com relatório fotográfico e comunicação direta pelo WhatsApp.",
      ]}
    />
  );
}