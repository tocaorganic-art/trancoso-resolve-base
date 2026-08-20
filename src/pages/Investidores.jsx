import { useSEO } from '@/hooks/useSEO';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { InvestorLangProvider, useInvestorLang } from '@/components/investors/InvestorLangContext';
import InvestorNav from '@/components/investors/InvestorNav';
import InvestorHero from '@/components/investors/InvestorHero';
import ProblemSection from '@/components/investors/ProblemSection';
import RegionalContextSection from '@/components/investors/RegionalContextSection';
import ProductSection from '@/components/investors/ProductSection';
import ClientsUsersSection from '@/components/investors/ClientsUsersSection';
import CompetitorsSection from '@/components/investors/CompetitorsSection';
import DifferentiationSection from '@/components/investors/DifferentiationSection';
import RevenueModelSection from '@/components/investors/RevenueModelSection';
import ScenarioChartSection from '@/components/investors/ScenarioChartSection';
import FinancialCalculator from '@/components/investors/FinancialCalculator';
import Plan18MonthsSection from '@/components/investors/Plan18MonthsSection';
import GtmSection from '@/components/investors/GtmSection';
import MetricsSection from '@/components/investors/MetricsSection';
import UseOfFundsSection from '@/components/investors/UseOfFundsSection';
import ThesisSection from '@/components/investors/ThesisSection';
import ReturnsSection from '@/components/investors/ReturnsSection';
import RisksSection from '@/components/investors/RisksSection';
import FaqSection from '@/components/investors/FaqSection';
import DownloadsSection from '@/components/investors/DownloadsSection';
import LeadFormSection from '@/components/investors/LeadFormSection';
import InvestorFooter from '@/components/investors/InvestorFooter';

function InvestidoresContent() {
  const { t } = useInvestorLang();

  useSEO({
    title: t.meta.title,
    description: t.meta.description,
    canonical: '/investidores',
    noIndex: true,
    ogImage: undefined,
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.meta.title,
    description: t.meta.description,
    url: 'https://trancosoresolve.com.br/investidores',
    inLanguage: 'pt-BR',
    about: {
      '@type': 'Organization',
      name: 'Trancoso Resolve',
      url: 'https://trancosoresolve.com.br',
      founder: { '@type': 'Person', name: 'Tony Monteiro' },
      email: 'tocaorganic@gmail.com',
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-nunito">
      <SchemaMarkup schema={schema} id="investidores-schema" />
      <InvestorNav />
      <main>
        <InvestorHero />
        <ProblemSection />
        <RegionalContextSection />
        <ProductSection />
        <ClientsUsersSection />
        <CompetitorsSection />
        <DifferentiationSection />
        <RevenueModelSection />
        <ScenarioChartSection />
        <FinancialCalculator />
        <Plan18MonthsSection />
        <GtmSection />
        <MetricsSection />
        <UseOfFundsSection />
        <ThesisSection />
        <ReturnsSection />
        <RisksSection />
        <FaqSection />
        <DownloadsSection />
        <LeadFormSection />
      </main>
      <InvestorFooter />
    </div>
  );
}

export default function InvestidoresPage() {
  return (
    <InvestorLangProvider>
      <InvestidoresContent />
    </InvestorLangProvider>
  );
}
