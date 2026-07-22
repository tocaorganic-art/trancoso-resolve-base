import { useEffect } from 'react';
import { trackViewServico } from '@/utils/analytics';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import CategoryIcon from '@/lib/categoryIcons';
import { Button } from '@/components/ui/button';
import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';
import WhatsAppStickyBar from '@/components/servicos/WhatsAppStickyBar';

export default function ServicoLocalPage({
  title,
  metaDescription,
  keywords,
  canonicalUrl,
  schemaData,
  faqData,
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
  serviceLabel,
  locationLabel = 'Trancoso, Bahia',
}) {
  useEffect(() => {
    trackViewServico({ title: h1 || title, category, city: locationLabel });
  }, []);

  useEffect(() => {
    const seoTitle = title.includes('| Trancoso Resolve') ? title : `${title} | Trancoso Resolve`;
    const seoDesc = metaDescription || `Encontre ${serviceLabel || category} verificado em ${locationLabel}. Profissionais avaliados, atendimento rápido e seguro.`;
    const label = serviceLabel || category || 'profissional';

    document.title = seoTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = seoDesc;

    if (keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement('meta'); kw.name = 'keywords'; document.head.appendChild(kw); }
      kw.content = keywords;
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = seoTitle;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = seoDesc;

    if (canonicalUrl) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
      ogUrl.content = canonicalUrl;
    }

    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twTitle) { twTitle = document.createElement('meta'); twTitle.name = 'twitter:title'; document.head.appendChild(twTitle); }
    twTitle.content = seoTitle;

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twDesc) { twDesc = document.createElement('meta'); twDesc.name = 'twitter:description'; document.head.appendChild(twDesc); }
    twDesc.content = seoDesc;

    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = canonicalUrl;
    }

    if (schemaData) {
      const existingSchema = document.getElementById('page-schema-ld');
      if (existingSchema) existingSchema.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-schema-ld';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    const faqs = faqData || [
      {
        question: `Quanto custa ${label} em ${locationLabel}?`,
        answer: `O preço varia conforme o tamanho do projeto e a experiência do profissional. Via Trancoso Resolve, você recebe orçamentos de profissionais verificados em até 5 minutos.`,
      },
      {
        question: `Como contratar ${label} verificado em ${locationLabel}?`,
        answer: `Acesse a Trancoso Resolve, descreva sua necessidade e nossa plataforma conecta você a profissionais qualificados com antecedentes checados e avaliações reais.`,
      },
      {
        question: `É seguro contratar via Trancoso Resolve?`,
        answer: `Sim. Todos os profissionais passam por verificação de antecedentes, têm perfil avaliado e histórico visível. Atendimento rápido e sem compromisso.`,
      },
    ];
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    };
    const existingFaq = document.getElementById('page-faq-ld');
    if (existingFaq) existingFaq.remove();
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.id = 'page-faq-ld';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const breadcrumbItems = [
      { position: 1, name: 'Trancoso Resolve', item: 'https://www.trancosoresolve.com.br' },
      { position: 2, name: 'Serviços', item: 'https://www.trancosoresolve.com.br/ServicosCategoria' },
      { position: 3, name: h1 || title, item: canonicalUrl || 'https://www.trancosoresolve.com.br' },
    ];
    const breadcrumbSchema = {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map(({ position, name, item }) => ({
        '@type': 'ListItem',
        position,
        name,
        item,
      })),
    };
    const existingBreadcrumb = document.getElementById('page-breadcrumb-ld');
    if (existingBreadcrumb) existingBreadcrumb.remove();
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.id = 'page-breadcrumb-ld';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.getElementById('page-schema-ld')?.remove();
      document.getElementById('page-faq-ld')?.remove();
      document.getElementById('page-breadcrumb-ld')?.remove();
    };
  }, [title, metaDescription, serviceLabel, category, keywords, canonicalUrl, schemaData, faqData, locationLabel, h1]);

  const searchUrl = createPageUrl('ServicosCategoria', `?cat=${encodeURIComponent(category)}`);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-orange-900 to-orange-700 text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            <span>{locationLabel}</span>
          </div>
          <CategoryIcon category={category || serviceLabel} className="w-14 h-14 mb-4 mx-auto" color="#FFFFFF" />
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">{h1}</h1>
          <p className="text-lg text-orange-100 leading-relaxed mb-8 max-w-2xl">{intro}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold text-base px-8 py-4 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-16">
        <LeadCaptureForm
          serviceInterest={category}
          serviceLabel={serviceLabel || category}
          source={`pagina-servico-${(serviceLabel || category || '').toLowerCase().replace(/\s+/g, '-')}`}
        />

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{servicesTitle}</h2>
          <ul className="space-y-3">
            {services.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-card backdrop-blur-sm rounded-xl px-5 py-4 border border-border">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <span className="text-foreground text-base">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{howTitle}</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{howText}</p>
        </section>

        <section className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <p className="text-white text-lg font-medium mb-6 max-w-xl mx-auto">{cta}</p>
          <Link to={searchUrl} className="block sm:inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-orange-800 hover:bg-orange-50 font-bold text-base px-8 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
              {ctaButton} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>

        {seoText && (
          <section className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border">
            <div className="prose max-w-none text-muted-foreground text-sm leading-relaxed space-y-4">
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
