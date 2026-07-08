import { useEffect } from 'react';
import { trackViewServico } from '@/utils/analytics';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';
import WhatsAppStickyBar from '@/components/servicos/WhatsAppStickyBar';

export default function ServicoLocalPage({
  title,
  metaDescription,
  keywords,
  canonicalUrl,
  schemaData,
  h1,
  intro,
  servicesTitle,
  services,
  howTitle,
  howText,
  seoText,
  cta,
  ctaButton,
  category,
  heroEmoji,
  serviceLabel,
  locationLabel = 'Trancoso, Bahia',
}) {
  useEffect(() => {
    trackViewServico({ title: h1 || title, category, city: locationLabel });
  }, []);

  useEffect(() => {
    const seoTitle = title.includes('| Trancoso Resolve') ? title : `${title} | Trancoso Resolve`;
    const seoDesc = metaDescription || `Encontre ${serviceLabel || category} verificado em ${locationLabel}. Profissionais avaliados, atendimento rápido e seguro.`;

    document.title = seoTitle;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) { el = document.createElement('meta'); if (attr === 'name') el.name = selector.match(/name="([^"]+)"/)?.[1]; document.head.appendChild(el); }
      el.setAttribute(attr === 'property' ? 'property' : 'name', selector.match(/"([^"]+)"/)?.[1] || '');
      el.content = value;
    };

    // description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = seoDesc;

    // keywords
    if (keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement('meta'); kw.name = 'keywords'; document.head.appendChild(kw); }
      kw.content = keywords;
    }

    // og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = seoTitle;

    // og:description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = seoDesc;

    // canonical
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = canonicalUrl;
    }

    // JSON-LD schema
    if (schemaData) {
      const existingSchema = document.getElementById('page-schema-ld');
      if (existingSchema) existingSchema.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-schema-ld';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById('page-schema-ld');
      if (s) s.remove();
    };
  }, [title, metaDescription, serviceLabel, category, keywords, canonicalUrl, schemaData, locationLabel]);

  const searchUrl = createPageUrl('ServicosCategoria', `?cat=${encodeURIComponent(category)}`);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] to-[#1e293b] text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            <span>{locationLabel}</span>
          </div>
          <span className="text-5xl mb-4 block" aria-hidden="true">{heroEmoji}</span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">{h1}</h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">{intro}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-base px-8 py-4 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-16">

        {/* Lead Capture Form — antes da listagem */}
        <LeadCaptureForm
          serviceInterest={category}
          serviceLabel={serviceLabel || category}
          source={`pagina-servico-${(serviceLabel || category || '').toLowerCase().replace(/\s+/g, '-')}`}
        />

        {/* Serviços */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{servicesTitle}</h2>
          <ul className="space-y-3">
            {services.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-slate-800/50 backdrop-blur-sm rounded-xl px-5 py-4 border border-slate-700">
                <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-base">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Como funciona */}
        <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{howTitle}</h2>
          <p className="text-slate-300 text-base leading-relaxed">{howText}</p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <p className="text-white text-lg font-medium mb-6 max-w-xl mx-auto">{cta}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-amber-800 hover:bg-amber-50 font-bold text-base px-8 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>

        {/* SEO Text Block */}
        {seoText && (
          <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="prose prose-slate max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              {seoText.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <WhatsAppStickyBar serviceLabel={serviceLabel || category} />
    </div>
  );
}