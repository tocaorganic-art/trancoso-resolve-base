import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function CozinheiroCaraiva() {
  return (
    <ServicoLocalPage
      title="Cozinheiro em Caraíva | Trancoso Resolve"
      metaDescription="Encontre cozinheiro verificado em Caraíva, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="cozinheiro Caraíva, cozinheiro Caraíva Bahia, profissional Caraíva BA, serviços Caraíva, chef Caraíva"
      canonicalUrl="https://trancosoresolve.com.br/servicos/cozinheiro-caraiva"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Cozinheiro Caraíva",
        "description": "Cozinheiros e chefs verificados em Caraíva, BA. Atendimento para pousadas, villas e eventos.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Caraíva, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.7397, "longitude": -39.1731 }
      }}
      h1="Cozinheiro em Caraíva"
      intro="Caraíva tem uma gastronomia marcada pelos frutos do mar frescos, ingredientes locais e uma culinária baiana autêntica. Contratar um cozinheiro ou chef particular que conheça essa identidade gastronômica faz toda a diferença na experiência dos seus hóspedes. A Trancoso Resolve conecta você a profissionais verificados e experientes no contexto único de Caraíva."
      servicesTitle="Serviços de cozinheiro em Caraíva"
      services={[
        'Cozinheiro particular para jantares e almoços em villas e pousadas',
        'Chef para eventos, celebrações e recepções de alto padrão',
        'Cardápio personalizado com produtos frescos e locais da região',
        'Cozinha baiana, frutos do mar e pratos contemporâneos',
        'Serviço completo: preparo, apresentação e organização da cozinha',
        'Planejamento de cardápio para estadias longas e grupos',
      ]}
      howTitle="Cozinheiros que conhecem a culinária de Caraíva"
      howText="A gastronomia de Caraíva tem uma identidade própria — com peixe fresco direto dos pescadores locais, mariscos, tainha defumada e ingredientes nativos da Mata Atlântica. Profissionais que trabalham na região sabem onde comprar o melhor produto, como adaptar cardápios às limitações logísticas do local e como entregar uma experiência gastronômica de alto nível mesmo em uma cozinha rústica."
      cta="Descreva o evento ou a necessidade e receba contato de cozinheiros verificados em Caraíva."
      ctaButton="Contratar cozinheiro em Caraíva"
      category="Cozinheiro"
      serviceLabel="cozinheiros"
      heroEmoji="👨‍🍳"
      locationLabel="Caraíva, Bahia"
      seoText={[
        "A gastronomia de Caraíva é um dos grandes diferenciais do destino. Com acesso direto ao pescado fresco dos pescadores artesanais locais e ingredientes nativos da região, os cozinheiros que atuam em Caraíva desenvolvem um cardápio com identidade única — diferente do que você encontra em Trancoso ou Porto Seguro.",
        "Para proprietários de villas que recebem grupos de amigos ou família durante a temporada, ter um cozinheiro particular elimina a necessidade de deslocamento até os poucos restaurantes disponíveis no vilarejo. O profissional vai até a propriedade, planeja o cardápio, faz as compras com os fornecedores locais e entrega uma refeição completa com mise en place digna de hotel boutique.",
        "Seja para um jantar romântico à luz de velas à beira do Rio Caraíva, um almoço de domingo com frutos do mar para dez pessoas ou um cardápio semanal para uma estadias longa, a Trancoso Resolve conecta você ao profissional certo, com avaliações verificadas de outros hóspedes da região.",
      ]}
    />
  );
}