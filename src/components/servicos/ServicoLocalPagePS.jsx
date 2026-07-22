import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import CategoryIcon from '@/lib/categoryIcons';
import { Button } from '@/components/ui/button';
import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';

/**
 * Versão do ServicoLocalPage específica para Porto Seguro.
 * Usa os mesmos props e visual, mas com SEO e localização para Porto Seguro.
 */
export default function ServicoLocalPagePS({
  title,
  metaDescription,
  keywords,
  canonical,
  h1,
  intro,
  servicesTitle,
  services,
  howTitle,
  howText,
  cta,
  ctaButton,
  category,
  serviceLabel,
}) {
  useEffect(() => {
    const seoTitle = title.includes('| Trancoso Resolve') ? title : `${title} | Trancoso Resolve`;
    document.title = seoTitle;

    const setMeta = (sel, attr, val, content) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); if (attr) el.setAttribute(attr, val); document.head.appendChild(el); }
      el.content = content;
    };

    setMeta('meta[name="description"]', 'name', 'description', metaDescription);
    setMeta('meta[name="keywords"]', 'name', 'keywords', keywords || '');
    setMeta('meta[property="og:title"]', 'property', 'og:title', seoTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metaDescription);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    if (canonical) link.href = canonical;

    // JSON-LD Schema
    const schemaId = 'ld-json-porto-seguro';
    let existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Trancoso Resolve - ${serviceLabel || category} Porto Seguro`,
      provider: {
        '@type': 'LocalBusiness',
        name: 'Trancoso Resolve',
        url: 'https://trancosoresolve.com.br',
        logo: 'https://trancosoresolve.com.br/brand/logo-mark-512.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Porto Seguro',
          addressRegion: 'BA',
          addressCountry: 'BR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -16.4497,
          longitude: -39.0647,
        },
        areaServed: {
          '@type': 'City',
          name: 'Porto Seguro',
          containedIn: { '@type': 'State', name: 'Bahia' },
        },
      },
      url: canonical || 'https://trancosoresolve.com.br',
      description: metaDescription,
    });
    document.head.appendChild(script);

    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, [title, metaDescription, keywords, canonical, serviceLabel, category]);

  const searchUrl = createPageUrl('ServicosCategoria', `?cat=${encodeURIComponent(category)}&cidade=Porto+Seguro`);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-900 to-orange-700 text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            <span>Porto Seguro, Bahia</span>
          </div>
          <CategoryIcon category={category || serviceLabel} className="w-14 h-14 mb-4 mx-auto" color="#FFFFFF" />
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">{h1}</h1>
          <p className="text-lg text-orange-100 leading-relaxed mb-8 max-w-2xl">{intro}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-orange-700 hover:bg-orange-800 text-white font-bold text-base px-8 py-4 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-16">
        {/* Serviços */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{servicesTitle}</h2>
          <ul className="space-y-3">
            {services.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-card rounded-xl px-5 py-4 shadow-sm border border-border">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <span className="text-foreground text-base">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Como funciona */}
        <section className="bg-card rounded-2xl p-8 shadow-sm border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{howTitle}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{howText}</p>
        </section>

        {/* Lead Capture Form */}
        <LeadCaptureForm serviceInterest={category} serviceLabel={serviceLabel || category} />

        {/* CTA */}
        <section className="bg-gradient-to-r from-orange-700 to-orange-900 rounded-3xl p-8 md:p-12 text-center">
          <p className="text-white text-lg font-medium mb-6 max-w-xl mx-auto">{cta}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-orange-800 hover:bg-orange-50 font-bold text-base px-8 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}