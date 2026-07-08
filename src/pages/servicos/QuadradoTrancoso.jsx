import ServicoLocalPage from '@/components/servicos/ServicoLocalPage';

export default function QuadradoTrancoso() {
  return (
    <ServicoLocalPage
      title="Serviços no Quadrado de Trancoso, BA | Profissionais Verificados | Trancoso Resolve"
      metaDescription="Encontre profissionais verificados para serviços no Quadrado de Trancoso: diaristas, eletricistas, encanadores, jardineiros e muito mais. Atendimento para pousadas, boutiques e residências de alto padrão."
      h1="Serviços no Quadrado de Trancoso: Profissionais Verificados para a Área Central"
      intro="O Quadrado de Trancoso é o coração histórico e comercial da vila — e manter pousadas boutique, lojas, restaurantes e residências funcionando nessa área exige profissionais que conhecem o ritmo e as exigências do local. Na Trancoso Resolve você encontra prestadores verificados com experiência comprovada em trabalhos no Quadrado e nas ruas adjacentes."
      servicesTitle="Serviços disponíveis no Quadrado de Trancoso"
      services={[
        'Diaristas e equipes de limpeza para pousadas e residências no Quadrado',
        'Eletricistas para manutenção emergencial de estabelecimentos comerciais',
        'Encanadores para reparos hidráulicos em edificações históricas',
        'Jardineiros para manutenção dos jardins e áreas externas do Quadrado',
        'Pintores para restauração e manutenção de fachadas históricas',
        'Seguranças para eventos privados, festas e celebrações na área',
        'Motoristas para transfer de hóspedes de pousadas até o aeroporto',
        'Chefs particulares para jantares privados e eventos gastronômicos',
      ]}
      howTitle="Por que usar a Trancoso Resolve no Quadrado?"
      howText="O Quadrado de Trancoso tem suas particularidades: edificações históricas, alta demanda na temporada e pouca tolerância para prestadores despreparados. Todos os profissionais cadastrados na plataforma passam por verificação de identidade, análise de antecedentes e têm avaliações publicadas por clientes anteriores — proprietários de pousadas, lojistas e moradores da região. Você contrata com confiança, sem depender de indicações de última hora."
      cta="Descreva o serviço que precisa no Quadrado e receba contato de profissionais verificados com experiência na área central de Trancoso."
      ctaButton="Encontrar profissional no Quadrado"
      category="Diarista"
      heroEmoji="🟩"
      serviceLabel="profissionais"
    />
  );
}