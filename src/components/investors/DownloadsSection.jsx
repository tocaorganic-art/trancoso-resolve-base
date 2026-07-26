import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function DownloadsSection() {
  const { t } = useInvestorLang();
  const d = t.downloads;

  return (
    <Section id="downloads" eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} tone="sand">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {d.files.map((file) => {
          const Icon = file.key === 'financeiro' ? FileSpreadsheet : FileText;
          return (
            <a
              key={file.key}
              href={file.href}
              download
              className="group rounded-brand-lg bg-card border border-border p-5 flex flex-col hover:border-orange-400 hover:shadow-brand transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-orange-700">
                  <Icon className="w-5 h-5" />
                </span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-orange-700 transition-colors" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1.5">{file.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{file.desc}</p>
            </a>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-muted-foreground italic max-w-2xl">{d.note}</p>
    </Section>
  );
}
