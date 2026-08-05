import { Link } from "react-router-dom";
import { Search, Briefcase, Store } from "lucide-react";

const PERFIS = [
  {
    key: "cliente",
    icon: Search,
    title: "Cliente",
    desc: "Descubra serviços e profissionais locais de confiança na sua localidade.",
    cta: "Quero descobrir",
  },
  {
    key: "prestador",
    icon: Briefcase,
    title: "Prestador",
    desc: "Tenha presença digital e receba contato de quem procura seu serviço.",
    cta: "Quero oferecer",
  },
  {
    key: "lojista",
    icon: Store,
    title: "Lojista ou empresa",
    desc: "Mostre seu negócio em uma vitrine regional da Costa do Descobrimento.",
    cta: "Quero minha vitrine",
  },
];

export default function PerfisParticipacao() {
  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#333333] font-heading">
          Escolha como participar
        </h2>
        <p className="text-center text-[#666] mb-8">Três caminhos. Uma plataforma regional.</p>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {PERFIS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.key}
                className="rounded-xl border border-[#E3DED5] bg-[#FAFAF7] p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[#F26A21]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#F26A21]" />
                </div>
                <h3 className="text-lg font-bold text-[#333333] mb-2">{p.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed mb-5 flex-1">{p.desc}</p>
                <Link
                  to="/participar"
                  className="inline-flex items-center justify-center bg-[#20382C] hover:bg-[#1a2d22] text-white font-semibold px-4 py-2.5 rounded-lg min-h-[44px] text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21]"
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}