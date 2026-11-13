import RegionalHero from "@/components/regional/RegionalHero";
import LocalitySelector from "@/components/regional/LocalitySelector";
import PerfisParticipacao from "@/components/regional/PerfisParticipacao";
import TrancosoMoveSection from "@/components/regional/TrancosoMoveSection";

export default function CostaDoDescobrimento() {
  return (
    <div className="bg-white">
      <RegionalHero />
      <LocalitySelector />
      <PerfisParticipacao />

      <section className="py-12 md:py-16 px-4 bg-[#E3DED5]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading text-[#333333]">Nossa missão</h2>
          <p className="text-lg text-[#333333] leading-relaxed">
            Uma forma regional de descobrir serviços, profissionais e negócios locais.
          </p>
          <div className="mt-6 text-left space-y-4 text-[#333333] leading-relaxed">
            <p>
              A Costa do Descobrimento reúne quatro lugares com rotinas bem diferentes. Trancoso tem o Quadrado e as
              vilas de Pitinga e Rio Verde, com casas de temporada que concentram a demanda de limpeza, piscina e
              cozinha. Arraial d&apos;Ajuda vive de pousada e restaurante, e pede gente de manutenção todos os dias.
              Porto Seguro é a cidade de serviço, com oficina, loja e obra. Caraíva é sazonal e isolada, onde quem
              atende precisa estar perto.
            </p>
            <p>
              A proposta da plataforma é simples: uma vitrine regional onde quem mora encontra profissional da própria
              área, e quem trabalha aparece para a rua onde já atende. Isso reduz a indicação perdida em grupo de
              mensagem e o deslocamento sem sentido entre uma vila e outra.
            </p>
            <p>
              Cada perfil mostra a região de atendimento, a faixa de preço declarada pelo prestador e a verificação de
              documento feita pela equipe. A escolha continua sendo sua, com contato direto e sem intermediário no
              orçamento.
            </p>
            <p>
              Para quem oferece serviço, o cadastro começa com dois meses grátis sem cartão, e os cem primeiros
              prestadores da região recebem o Selo Fundador. Para quem contrata, buscar e falar com o profissional não
              tem custo.
            </p>
          </div>
        </div>
      </section>

      <TrancosoMoveSection />
    </div>
  );
}