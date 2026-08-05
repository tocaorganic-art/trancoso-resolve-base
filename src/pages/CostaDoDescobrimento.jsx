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
        </div>
      </section>

      <TrancosoMoveSection />
    </div>
  );
}