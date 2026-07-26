import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function FaqSection() {
  const { t } = useInvestorLang();
  const f = t.faq;

  return (
    <Section eyebrow={f.eyebrow} title={f.title} subtitle={f.subtitle}>
      <Accordion type="single" collapsible className="rounded-brand-lg border border-border bg-card px-2 md:px-4">
        {f.items.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`} className={i === f.items.length - 1 ? 'border-b-0' : ''}>
            <AccordionTrigger className="text-left font-bold text-foreground px-2">{item.q}</AccordionTrigger>
            <AccordionContent className="px-2 text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
