/**
 * ProblemSection — narrativa animada + FragmentationViz + EcosystemViz + UserJourneyViz.
 *
 * Estrutura narrativa:
 *  1. Contexto: o problema (cards originais preservados)
 *  2. Fragmentação: visualização conceitual do mercado → plataforma
 *  3. Ecossistema: nós interativos
 *  4. Jornada: 6 etapas de uso
 *
 * Dados: integralmente do content.js. Nenhum número inventado.
 */
import Section from './Section';
import FragmentationViz from './FragmentationViz';
import EcosystemViz from './EcosystemViz';
import UserJourneyViz from './UserJourneyViz';
import { useInvestorLang } from './InvestorLangContext';

export default function ProblemSection() {
  const { t } = useInvestorLang();
  const p = t.problem;

  return (
    <>
      {/* 1. Problema — cards originais + narrativa animada */}
      <Section id="problema" eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle}>
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {p.cards.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-warm-sm transition-shadow"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">{c.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{p.closing}</p>
      </Section>

      {/* 2. Fragmentação → Plataforma central */}
      <Section
        eyebrow="Visualização · conceitual"
        title="Do caos à conexão organizada"
        subtitle="Como o mercado funciona hoje — e o que a Trancoso Resolve organiza."
        tone="sand"
      >
        <FragmentationViz />
      </Section>

      {/* 3. Ecossistema */}
      <Section
        eyebrow="Ecossistema"
        title="Quem a plataforma conecta"
        subtitle="Cada segmento gera e recebe valor. Explore os nós para entender a conexão."
      >
        <EcosystemViz />
      </Section>

      {/* 4. Jornada do usuário */}
      <Section
        eyebrow="Jornada · produto"
        title="Como funciona na prática"
        subtitle="Da necessidade ao serviço realizado — 6 etapas do lado do cliente."
        tone="sand"
      >
        <UserJourneyViz />
      </Section>
    </>
  );
}
