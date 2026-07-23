import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function JardineiroPortoSeguro() {
  return (
    <ServicoLocalPage
      title="Jardineiro em Porto Seguro | Trancoso Resolve"
      metaDescription="Encontre jardineiro verificado em Porto Seguro, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="jardineiro Porto Seguro, jardineiro Porto Seguro BA, profissional Porto Seguro Bahia, paisagismo Porto Seguro"
      canonicalUrl="https://trancosoresolve.com.br/servicos/jardineiro-porto-seguro"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Jardineiro Porto Seguro",
        "description": "Jardineiros verificados em Porto Seguro, BA. Manutenção e paisagismo para pousadas, hotéis e residências.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Porto Seguro, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.4497, "longitude": -39.0647 }
      }}
      h1="Jardineiro em Porto Seguro"
      intro="Os jardins de Porto Seguro precisam suportar o calor intenso, a brisa marinha e a alternância entre a estação seca e as chuvas do verão. Um jardineiro experiente na região conhece quais espécies prosperam nessas condições e como manter o paisagismo bonito e saudável durante todo o ano. A Trancoso Resolve conecta você a profissionais verificados com expertise local."
      servicesTitle="Serviços de jardineiro em Porto Seguro"
      services={[
        'Manutenção periódica de jardins em residências, pousadas e hotéis',
        'Poda técnica de árvores, palmeiras e arbustos ornamentais',
        'Paisagismo com espécies tropicais e nativas adaptadas ao clima local',
        'Implantação e manutenção de gramados, forrações e canteiros',
        'Cuidado com jardins de imóveis desocupados e segunda residência',
        'Instalação e manutenção de sistemas de irrigação',
        'Controle fitossanitário e manejo de pragas tropicais',
      ]}
      howTitle="Por que contratar jardineiro pela Trancoso Resolve?"
      howText="A plataforma facilita a contratação de jardineiros verificados com experiência específica no clima e na vegetação de Porto Seguro. Todos têm avaliações de clientes reais e passam por verificação de identidade — para que você contrate com confiança e sem depender de indicações de terceiros."
      cta="Descreva seu jardim em Porto Seguro e receba contato de jardineiros verificados e experientes na região."
      ctaButton="Contratar jardineiro em Porto Seguro"
      category="Jardinagem"
      heroEmoji="🌿"
      locationLabel="Porto Seguro, Bahia"
      seoText={[
        "Porto Seguro tem uma diversidade de microclimas dentro da própria cidade: a orla com brisa constante e solo arenoso, os bairros de planalto com solo mais argiloso e menos salinidade, e as áreas de mata com microclima úmido e sombra natural. Jardineiros com experiência local sabem selecionar as espécies certas para cada condição e adaptar o manejo conforme o ambiente.",
        "Para hotéis e pousadas de Porto Seguro, o paisagismo é parte fundamental da experiência do hóspede — jardins bem cuidados geram avaliações positivas e fotos que circulam nas redes sociais. Jardineiros profissionais que atendem o setor hoteleiro entendem a importância da apresentação visual e trabalham com cronograma compatível com o fluxo de hóspedes.",
        "A manutenção de jardins em Porto Seguro durante a baixa temporada é especialmente importante: com menos visitas e supervisão, o crescimento vegetativo pode sair do controle rapidamente, especialmente nas chuvas de verão. Jardineiros com planos de manutenção periódica garantem que a propriedade esteja sempre apresentável, independente da presença do proprietário.",
      ]}
    />
  );
}