import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function SegurancaTrancoso() {
  return (
    <ServicoLocalPage
      title="Segurança Particular em Trancoso, BA | Vigilância para Villas e Eventos | Trancoso Resolve"
      metaDescription="Contrate segurança particular verificado em Trancoso, Bahia. Vigilância para villas, pousadas, eventos privados e propriedades de luxo. Profissionais com antecedentes verificados, orçamento grátis."
      keywords="segurança Trancoso, segurança particular Trancoso Bahia, profissional Trancoso BA, serviços Trancoso, vigilância Trancoso"
      canonicalUrl="https://trancosoresolve.com.br/servicos/seguranca-trancoso"
      schemaData={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Trancoso Resolve - Segurança Trancoso",
        "description": "Profissionais de segurança verificados em Trancoso, BA. Vigilância para villas, pousadas e eventos privados.",
        "provider": { "@type": "LocalBusiness", "name": "Trancoso Resolve", "url": "https://trancosoresolve.com.br" },
        "areaServed": { "@type": "City", "name": "Trancoso, BA" },
        "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 }
      }}
      h1="Segurança Particular em Trancoso: Vigilância para Villas e Eventos Privados"
      intro="A segurança de uma villa ou propriedade em Trancoso — especialmente durante eventos privados ou períodos de temporada com alto fluxo de pessoas — exige profissionais que conheçam a região e tenham experiência comprovada. Na Trancoso Resolve você contrata profissionais de segurança verificados, com análise de antecedentes criminais completa, para proteger sua propriedade e seus convidados."
      servicesTitle="Serviços de segurança em Trancoso"
      services={[
        'Vigilância presencial em villas, mansões e propriedades de luxo',
        'Segurança para eventos privados, festas e celebrações em Trancoso',
        'Controle de acesso e portaria em residências e pousadas',
        'Ronda noturna e monitoramento perimetral de propriedades',
        'Segurança para propriedades desocupadas durante a baixa temporada',
        'Escolta e acompanhamento pessoal para hóspedes e proprietários',
        'Segurança para pousadas e pequenos hotéis boutique',
        'Avaliação de vulnerabilidades e consultoria de segurança patrimonial',
      ]}
      howTitle="Por que contratar segurança pela Trancoso Resolve?"
      howText="Trancoso recebe visitantes do mundo inteiro durante a temporada — e propriedades de alto valor exigem vigilância especializada. Todos os profissionais de segurança cadastrados na plataforma passam por verificação de identidade e análise de antecedentes criminais completa, além de terem avaliações publicadas por clientes anteriores. Você contrata com a certeza de que o profissional é quem diz ser."
      cta="Descreva o tipo de propriedade ou evento e receba contato de profissionais de segurança verificados com experiência em Trancoso."
      ctaButton="Contratar segurança em Trancoso"
      category="Segurança"
      heroEmoji="🛡️"
      locationLabel="Trancoso, Bahia"
      seoText={[
        "Trancoso recebe visitantes de alto padrão durante todo o ano, com pico na alta temporada — período em que villas e pousadas concentram um valor patrimonial elevado e demandam vigilância especializada. Profissionais de segurança com experiência local conhecem os pontos de acesso da região e os protocolos de condomínios fechados.",
        "Propriedades de segunda residência em Trancoso costumam ficar desocupadas por longos períodos, o que as torna alvo potencial. A Trancoso Resolve conecta proprietários a profissionais de segurança verificados para rondas perimetrais e monitoramento durante a baixa temporada, com relatórios periódicos pelo WhatsApp.",
        "Para eventos privados no Quadrado ou em villas à beira-mar, a contratação de segurança qualificada garante controle de acesso e tranquilidade para anfitriões e convidados. Todos os profissionais cadastrados passam por análise de antecedentes criminais completa antes de entrar na plataforma.",
      ]}
    />
  );
}