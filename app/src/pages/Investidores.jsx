/**
 * Investidores.jsx — página de pitch para investidores.
 *
 * noindex: declarado no prerender-head.js (server-side) e via useSEO (client-side).
 * Visualizações pesadas (FragmentationViz, EcosystemViz, UserJourneyViz) são
 * carregadas via lazy() para não inflar o chunk principal.
 *
 * REGRAS: não alterar backend, entidades, autenticação ou brand kit.
 */
import { lazy, Suspense } from 'react';
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

// Skeleton mínimo para Suspense
function SectionSkeleton() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl space-y-4 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-48 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

function InvestidoresContent() {
  const { t } = useInvestorLang();

  useSEO({
    title: t.meta.title,
    description: t.meta.description,
    canonical: '/investidores',
    // noindex declarado no prerender-head.js; useSEO também aplica client-side:
    robots: 'noindex, nofollow',
    ogImage: undefined,
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.meta.title,
    description: t.meta.description,
    url: 'https://www.trancosoresolve.com.br/investidores',
    inLanguage: 'pt-BR',
    about: {
      '@type': 'Organization',
      name: 'Trancoso Resolve',
      url: 'https://www.trancosoresolve.com.br',
      founder: { '@type': 'Person', name: 'Tony Monteiro' },
      email: 'contato@trancosoresolve.com.br',
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-nunito">
      <SchemaMarkup schema={schema} id="investidores-schema" />
      <InvestorNav />
      <main id="main-content">
        <InvestorHero />

        {/* ProblemSection já inclui FragmentationViz, EcosystemViz e UserJourneyViz */}
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

        {/* Formulário de lead — lógica preservada integralmente */}
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
