import { Mail, Phone, AlertTriangle } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { useInvestorLang } from './InvestorLangContext';

export default function InvestorFooter() {
  const { t } = useInvestorLang();
  const f = t.footer;

  return (
    <footer className="bg-[#1A1208] text-white/70 py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
          <div>
            <Logo className="" markClassName="h-10 w-10" textClassName="text-white text-sm" />
            <p className="mt-4 text-sm font-bold text-white/90">{f.contactTitle}</p>
            <p className="text-sm">{f.contactName}</p>
            <a href={`mailto:${f.email}`} className="flex items-center gap-2 text-sm mt-2 hover:text-orange-400 transition-colors">
              <Mail className="w-4 h-4" /> {f.email}
            </a>
            <a href={`https://wa.me/${f.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-sm mt-1 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" /> {f.phone}
            </a>
          </div>

          <div className="max-w-lg rounded-brand-lg border border-white/10 bg-white/5 p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-400 mb-2">
              <AlertTriangle className="w-4 h-4" /> {f.disclaimerTitle}
            </p>
            <p className="text-xs leading-relaxed text-white/60">{f.disclaimer}</p>
          </div>
        </div>
        <p className="text-xs text-white/40 border-t border-white/10 pt-6">{f.copyright}</p>
      </div>
    </footer>
  );
}
