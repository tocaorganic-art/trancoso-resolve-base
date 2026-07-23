import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function CozinheiroPortoSeguro() {
  return (
    <ServicoLocalPage
      title="Cozinheiro em Porto Seguro | Trancoso Resolve"
      metaDescription="Encontre cozinheiro verificado em Porto Seguro, BA. Profissionais avaliados para sua pousada ou villa. Solicite agora pela Trancoso Resolve."
      keywords="cozinheiro Porto Seguro, chef Porto Seguro BA, profissional Porto Seguro Bahia, cozinheiro Porto Seguro"
      canonicalUrl="https://trancosoresolve.com.br/servicos/cozinheiro-porto-seguro"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Cozinheiro Porto Seguro",
        "description": "Cozinheiros e chefs verificados em Porto Seguro, BA. Atendimento para pousadas, resorts e eventos.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Porto Seguro, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.4497, "longitude": -39.0647 }
      }}
      h1="Cozinheiro em Porto Seguro"
      intro="A gastronomia de Porto Seguro é rica e diversa — da culinária baiana tradicional ao fusion contemporâneo dos resorts e eventos de alto padrão. Contratar um cozinheiro ou chef verificado para sua propriedade em Porto Seguro garante refeições de qualidade, segurança alimentar e uma experiência gastronômica à altura do destino."
      servicesTitle="Serviços de cozinheiro em Porto Seguro"
      services={[
        'Cozinheiro particular para jantares e almoços em residências e pousadas',
        'Chef para eventos, festas e celebrações privadas',
        'Cardápio personalizado com produtos frescos e frutos do mar locais',
        'Culinária baiana, nordestina e contemporânea',
        'Serviço completo: compras, preparo, apresentação e organização da cozinha',
        'Cozinheiro fixo para imóveis com ocupação sazonal ou permanente',
      ]}
      howTitle="Cozinheiros verificados em Porto Seguro"
      howText="Todos os cozinheiros da plataforma passam por verificação de identidade e têm avaliações de clientes reais. Você descreve sua necessidade, recebe contatos de profissionais disponíveis em Porto Seguro e escolhe com quem contratar — sem taxas e sem intermediários."
      cta="Descreva o evento ou a necessidade e receba contato de cozinheiros verificados em Porto Seguro."
      ctaButton="Contratar cozinheiro em Porto Seguro"
      category="Cozinheiro"
      serviceLabel="cozinheiros"
      heroEmoji="👨‍🍳"
      locationLabel="Porto Seguro, Bahia"
      seoText={[
        "Porto Seguro é uma cidade com uma cena gastronômica vibrante — tanto nos restaurantes do Passarelo quanto nas residências e eventos privados que movimentam o setor de catering durante todo o ano. Cozinheiros que trabalham na região têm acesso a ingredientes de qualidade: frutos do mar frescos do mercado municipal, dendê produzido localmente e ervas nativas da Mata Atlântica que conferem sabor único aos pratos.",
        "O mercado de eventos em Porto Seguro é expressivo — com casamentos na praia, festas de aniversário em condomínios fechados e confraternizações corporativas que demandam chefs com experiência em culinária de alto volume e padrão de apresentação. A Trancoso Resolve facilita a contratação desses profissionais com perfis verificados e avaliações reais.",
        "Para famílias que passam temporadas em Porto Seguro durante as férias e feriados, ter um cozinheiro particular elimina a dependência de restaurantes e permite personalizar o cardápio conforme as preferências e restrições alimentares de cada membro da família. É uma conveniência que muda completamente a experiência de hospedagem.",
      ]}
    />
  );
}