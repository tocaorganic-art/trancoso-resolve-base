import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function ThesisSection() {
  const { t } = useInvestorLang();
  const th = t.thesis;

  return (
    <Section id="tese" eyebrow={th.eyebrow} title={th.title} tone="dark">
      <blockquote className="text-xl md:text-2xl font-display font-bold leading-snug max-w-3xl border-l-4 border-orange-500 pl-6">
        {th.summary}
      </blockquote>
      <p className="mt-6 text-white/70 max-w-2xl leading-relaxed">{th.body}</p>
      <p className="mt-8 text-sm text-white/50 italic max-w-2xl">{th.quote}</p>
    </Section>
  );
}
