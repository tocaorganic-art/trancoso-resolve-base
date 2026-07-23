import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function ChefTrancoso() {
  return (
    <ServicoLocalPage
      title="Chef Particular em Trancoso, BA | Cozinheiro para Villas e Eventos | Trancoso Resolve"
      metaDescription="Contrate chef particular ou cozinheiro verificado em Trancoso, Bahia. Refeições diárias, eventos, jantares privados e culinária baiana para villas e pousadas. Orçamento grátis."
      keywords="chef Trancoso, cozinheiro Trancoso, chef particular Trancoso Bahia, profissional Trancoso BA, gastronomia Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/chef-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Chef Trancoso",
        "description": "Chefs e cozinheiros verificados em Trancoso, BA. Atendimento para villas, pousadas e eventos.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Chef Particular em Trancoso: Gastronomia Exclusiva para Villas e Eventos"
      intro="Trancoso é destino de quem busca experiências exclusivas — e uma refeição preparada por um chef particular na sua villa, com ingredientes frescos e culinária baiana autêntica, é uma dessas experiências. Na Trancoso Resolve você encontra chefs e cozinheiros verificados, com experiência em jantares privados, eventos e serviço diário para famílias e grupos."
      servicesTitle="Serviços de chef e cozinheiro em Trancoso"
      services={[
        'Refeições diárias para famílias e grupos hospedados em villas',
        'Jantares privados e experiências gastronômicas exclusivas',
        'Culinária baiana: moqueca, acarajé, bobó e frutos do mar frescos',
        'Cardápios personalizados para restrições alimentares e dietas especiais',
        'Preparo de café da manhã, brunch e petiscos para festas',
        'Chef para eventos, festas de aniversário e celebrações privadas',
        'Serviço completo com montagem e desmontagem de mesa',
        'Compras de mercado e seleção de ingredientes frescos locais',
      ]}
      howTitle="Por que contratar um chef pela Trancoso Resolve?"
      howText="Os melhores ingredientes de Trancoso — pescados frescos do dia, frutos de mar, ervas locais e produtos orgânicos — exigem um cozinheiro que saiba usá-los. Os chefs da plataforma têm experiência comprovada em eventos e residências de alto padrão, com avaliações publicadas por hóspedes e proprietários de villas. Todos passaram por verificação antes de entrar na plataforma."
      cta="Descreva o tipo de refeição ou evento e receba contato de chefs e cozinheiros verificados com experiência gastronômica em Trancoso."
      ctaButton="Contratar chef em Trancoso"
      category="Cozinheiro"
      serviceLabel="cozinheiros"
      heroEmoji="👨‍🍳"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "A gastronomia de Trancoso é um dos grandes atrativos do destino, com pescado fresco, frutos do mar e ingredientes locais que inspiram chefs particulares a criar cardápios autorais para villas e residências de alto padrão. Profissionais com experiência na região sabem onde comprar o melhor produto e como adaptar o cardápio ao perfil de cada grupo.",
        "Para proprietários de villas que recebem amigos e família durante a temporada, contratar um chef particular elimina a necessidade de deslocamento até os restaurantes do Quadrado. O profissional vai até a propriedade, planeja o cardápio, faz as compras com fornecedores locais e entrega uma experiência gastronômica completa.",
        "Seja para um jantar privado à luz de velas, um almoço de domingo com frutos do mar para um grupo grande ou um cardápio semanal personalizado, a Trancoso Resolve conecta você a chefs e cozinheiros verificados, com avaliações reais de hóspedes e proprietários de Trancoso.",
      ]}
    />
  );
}