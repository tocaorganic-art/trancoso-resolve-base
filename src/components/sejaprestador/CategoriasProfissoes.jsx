import { Wrench, Home, PenTool, HeartPulse } from 'lucide-react';

const PILARES = [
  {
    icon: Wrench,
    titulo: 'Manutenção & Infraestrutura',
    exemplos: 'Elétrica · Hidráulica · Refrigeração · Obras',
    mensagem: 'Mantenha pousadas e residências rodando sem problemas.',
  },
  {
    icon: Home,
    titulo: 'Hospitalidade & Casa',
    exemplos: 'Governança · Limpeza · Cozinha · Jardinagem',
    mensagem: 'Atenda pousadas, villas de luxo e turistas de alto padrão.',
  },
  {
    icon: PenTool,
    titulo: 'Projetos & Técnica',
    exemplos: 'Arquitetura · Design · Fotografia · TI local',
    mensagem: 'Ofereça sua expertise para moradores e empresas da região.',
  },
  {
    icon: HeartPulse,
    titulo: 'Bem-Estar & Lazer',
    exemplos: 'Massoterapia · Personal Trainer · Passeios',
    mensagem: 'Cuidado e experiências para quem vive ou visita Trancoso.',
  },
];

export default function CategoriasProfissoes() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">
            Para todos os profissionais
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-2">
            Sua Profissão Tem Lugar Aqui
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
            Do técnico de campo ao consultor autônomo: a vitrine oficial da Costa do
            Descobrimento é um ecossistema completo para qualquer prestador sério da região.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILARES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.titulo}
                className="bg-card rounded-xl border p-6 flex flex-col items-start hover:shadow-lg transition-shadow"
              >
                <Icon className="w-9 h-9 text-orange-500 mb-4" />
                <h3 className="font-bold text-foreground mb-1">{p.titulo}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                  {p.exemplos}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.mensagem}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
