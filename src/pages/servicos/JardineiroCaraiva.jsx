import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function JardineiroCaraiva() {
  return (
    <ServicoLocalPage
      title="Jardineiro em Caraíva | Trancoso Resolve"
      metaDescription="Encontre jardineiro verificado em Caraíva, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="jardineiro Caraíva, jardineiro Caraíva Bahia, profissional Caraíva BA, serviços Caraíva, paisagismo Caraíva"
      canonicalUrl="https://trancosoresolve.com.br/servicos/jardineiro-caraiva"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Jardineiro Caraíva",
        "description": "Jardineiros verificados em Caraíva, BA. Manutenção e paisagismo para pousadas e villas.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Caraíva, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.7397, "longitude": -39.1731 }
      }}
      h1="Jardineiro em Caraíva"
      intro="A vegetação de Caraíva é exuberante e selvagem — parte intrínseca do charme do lugar. Manter um jardim que dialogue com essa natureza ao redor exige um jardineiro que conheça as espécies nativas da Mata Atlântica, o solo arenoso da região e o ritmo das chuvas e secas da Costa do Descobrimento. A Trancoso Resolve conecta você a profissionais verificados com essa expertise local."
      servicesTitle="Serviços de jardineiro em Caraíva"
      services={[
        'Manutenção periódica de jardins em pousadas, villas e residências',
        'Poda técnica de árvores, arbustos e espécies nativas da Mata Atlântica',
        'Paisagismo com espécies adequadas ao clima e solo de Caraíva',
        'Implantação e manutenção de gramados e forrações',
        'Cuidado com jardins de imóveis desocupados durante a baixa temporada',
        'Manejo de hortas orgânicas com ervas e temperos locais',
      ]}
      howTitle="Jardineiros que conhecem a vegetação de Caraíva"
      howText="O solo arenoso de Caraíva e a proximidade com o rio exigem conhecimento específico sobre drenagem, irrigação e escolha das espécies certas. Jardineiros com experiência local evitam os erros comuns — como plantar espécies que não sobrevivem à brisa marinha ou que crescem em demasia e precisam de manejo intensivo. Todos são verificados e têm avaliações públicas de clientes reais."
      cta="Descreva seu jardim em Caraíva e receba contato de jardineiros verificados com experiência na região."
      ctaButton="Contratar jardineiro em Caraíva"
      category="Jardinagem"
      heroEmoji="🌿"
      locationLabel="Caraíva, Bahia"
      seoText={[
        "A vegetação nativa em torno de Caraíva — com mata ciliar às margens do Rio Caraíva, restinga de praia e fragmentos de Mata Atlântica — cria um contexto de jardinagem muito diferente dos destinos vizinhos. Jardineiros que atuam em Caraíva entendem quais espécies prosperam nesse ecossistema e como integrá-las ao projeto paisagístico sem romper com o ambiente natural.",
        "Muitas pousadas e villas de Caraíva adotam um paisagismo intencionalmente naturalista — com caminhos de areia, iluminação baixa e vegetação que parece surgir espontaneamente do entorno. Manter esse equilíbrio exige um jardineiro com sensibilidade estética e conhecimento técnico, capaz de podar sem descaracterizar e plantar sem artificializar.",
        "Para proprietários que visitam Caraíva apenas nas temporadas, o serviço de manutenção preventiva durante os períodos de ausência é essencial: o crescimento vegetativo acelera com as chuvas de verão, e um jardim abandonado por três meses pode exigir semanas de trabalho para recuperação. A plataforma oferece planos de manutenção periódica com relatório fotográfico pelo WhatsApp.",
      ]}
    />
  );
}