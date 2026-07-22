import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function JardineiroArraialDajuda() {
  return (
    <ServicoLocalPage
      title="Jardineiro em Arraial d'Ajuda | Paisagismo e Manutenção | Trancoso Resolve"
      metaDescription="Jardineiro verificado em Arraial d'Ajuda, BA. Manutenção de jardins, paisagismo e poda para pousadas, villas e residências. Planos semanais. Orçamento grátis!"
      keywords="jardineiro Arraial d'Ajuda, jardim Arraial d'Ajuda, paisagismo Arraial Ajuda BA, manutenção jardim Arraial d'Ajuda"
      canonicalUrl="https://www.trancosoresolve.com.br/servicos/jardineiro-arraial-dajuda"
      schemaData={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: "Jardineiro em Arraial d'Ajuda",
        description: "Jardineiros verificados em Arraial d'Ajuda, BA. Manutenção, paisagismo e poda para pousadas e residências de temporada.",
        serviceType: 'Jardinagem',
        provider: { '@type': 'LocalBusiness', name: 'Trancoso Resolve', url: 'https://www.trancosoresolve.com.br' },
        areaServed: { '@type': 'City', name: "Arraial d'Ajuda, BA" },
        geo: { '@type': 'GeoCoordinates', latitude: -16.5344, longitude: -39.0667 },
        url: 'https://www.trancosoresolve.com.br/servicos/jardineiro-arraial-dajuda',
      }}
      faqData={[
        {
          question: "Com que frequência devo contratar jardineiro em Arraial d'Ajuda?",
          answer: "No clima tropical úmido de Arraial d'Ajuda, a vegetação cresce rapidamente. Recomenda-se manutenção quinzenal ou mensal para jardins pequenos, e semanal para propriedades com área verde grande.",
        },
        {
          question: "Jardineiro em Arraial d'Ajuda atende imóveis de segunda residência?",
          answer: "Sim. Os jardineiros da plataforma oferecem planos de manutenção para imóveis desocupados — mantendo o jardim apresentável mesmo quando o proprietário está fora.",
        },
        {
          question: "Fazem paisagismo e projeto de jardim em Arraial d'Ajuda?",
          answer: "Sim. Além de manutenção, os profissionais oferecem paisagismo com espécies nativas e tropicais adaptadas ao clima litorâneo de Arraial d'Ajuda.",
        },
      ]}
      h1="Jardineiro em Arraial d'Ajuda: Manutenção e Paisagismo Verificado"
      intro="A vegetação exuberante de Arraial d'Ajuda é um dos charmes do destino — e manter o jardim da sua pousada ou villa impecável exige profissional que conheça as espécies locais e o ritmo de crescimento no clima úmido da Bahia. Na Trancoso Resolve você encontra jardineiros verificados com experiência em imóveis de alto padrão da região."
      servicesTitle="Serviços de jardineiro em Arraial d'Ajuda"
      services={[
        'Manutenção semanal, quinzenal ou mensal de jardins e áreas verdes',
        'Poda de árvores, arbustos e gramado',
        'Paisagismo com espécies nativas e tropicais',
        'Controle de pragas e doenças em plantas',
        'Adubação e correção de solo',
        'Manutenção de jardins em imóveis de segunda residência',
        'Projeto de jardim para pousadas e villas',
        'Limpeza de áreas externas, decks e caminhos',
      ]}
      howTitle="Jardineiros verificados em Arraial d'Ajuda"
      howText="Em Arraial d'Ajuda, onde o verde faz parte da identidade do destino, um jardim bem cuidado valoriza o imóvel e encanta os hóspedes. Todos os jardineiros da plataforma são verificados e têm avaliações de clientes — para proprietários que moram fora, é a garantia de que o jardim está em boas mãos."
      cta="Descreva o tamanho e tipo de jardim em Arraial d'Ajuda e receba contato de jardineiros verificados."
      ctaButton="Contratar jardineiro em Arraial d'Ajuda"
      category="Jardineiro"
      serviceLabel="jardineiros"
      heroEmoji="🌿"
      locationLabel="Arraial d'Ajuda, Bahia"
      seoText={[
        "Arraial d'Ajuda tem uma vegetação rica e diversificada, com espécies nativas da Mata Atlântica, plantas tropicais e jardins cuidadosamente mantidos que contribuem para o charme do destino. Jardineiros com conhecimento das espécies locais sabem quais plantas se adaptam melhor ao solo e ao clima da região.",
        "Para pousadas e imóveis de aluguel por temporada em Arraial d'Ajuda, o jardim é um diferencial competitivo: fotos bonitas de áreas verdes bem cuidadas aumentam a taxa de reserva em plataformas como Airbnb e Booking. Um jardineiro regular é um investimento com retorno direto na ocupação.",
        "Proprietários de segunda residência em Arraial d'Ajuda precisam de jardineiro confiável para manter o imóvel apresentável durante os meses de ausência. A Trancoso Resolve conecta você a profissionais com planos de manutenção flexíveis e comunicação ativa pelo WhatsApp.",
      ]}
    />
  );
}
