import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, ArrowRight, Star, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DESTINO_MAP, CATEGORIAS, BASE_URL } from '@/data/seoLocal';
import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';
import WhatsAppStickyBar from '@/components/servicos/WhatsAppStickyBar';
import CategoryIcon from '@/lib/categoryIcons';

export default function DestinoHub() {
  const { destino } = useParams();
  const dest = DESTINO_MAP[destino];
  const label = dest?.label || '';

  useEffect(() => {
    if (!dest) return;
    const prev = document.title;
    document.title = `${label} | Serviços e Profissionais Verificados — Trancoso Resolve`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) metaDesc.setAttribute('content', `Encontre profissionais verificados em ${label}, BA: diaristas, eletricistas, encanadores, jardineiros e chefs. Contrate com segurança pela Trancoso Resolve.`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${BASE_URL}/${destino}`;

    const schemaId = `schema-hub-${destino}`;
    const prevSchema = document.getElementById(schemaId);
    if (prevSchema) prevSchema.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `Trancoso Resolve — Serviços em ${label}`,
      description: `Marketplace de serviços locais em ${label}, Bahia. Profissionais verificados para o litoral sul da Bahia.`,
      url: `${BASE_URL}/${destino}`,
      address: { '@type': 'PostalAddress', addressLocality: label, addressRegion: 'BA', addressCountry: 'BR' },
      areaServed: { '@type': 'Place', name: `${label}, Bahia, Brasil` },
    });
    document.head.appendChild(script);

    return () => {
      document.title = prev;
      if (metaDesc) metaDesc.setAttribute('content', prevDesc);
      document.getElementById(schemaId)?.remove();
    };
  }, [destino, dest, label]);

  if (!dest) return <Navigate to="/" replace />;

  return (
    <div className="bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1A1208] via-[#3a2d18] to-[#1A1208] text-white py-20 md:py-32 overflow-hidden">
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> {label}, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços em {label}
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
            Profissionais verificados para sua villa, pousada ou residência em {label}. A gente resolve.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIAS.map(({ slug, label: catLabel }) => (
              <Link key={slug} to={`/${destino}/${slug}`}>
                <Button variant="outline" className="border-orange-300/50 text-orange-100 hover:bg-orange-700/30">
                  {catLabel} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="py-16 container mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
          Por que Trancoso Resolve em {label}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Star,   title: 'Profissionais verificados',  desc: 'Antecedentes checados e avaliações de clientes reais.' },
            { icon: Clock,  title: 'Resposta em até 2h',         desc: 'Conectamos você rapidamente ao profissional certo.' },
            { icon: Shield, title: 'Contrate com segurança',     desc: 'Sem intermediários. Combine direto com o profissional.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 rounded-2xl border border-border">
              <Icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grid de categorias */}
      <section className="py-16 bg-sand/30">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Escolha o serviço que precisa
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIAS.map(({ slug, label: catLabel }) => (
              <Link key={slug} to={`/${destino}/${slug}`} className="group">
                <div className="flex flex-col items-center p-5 rounded-2xl border border-border bg-white hover:border-orange-400 hover:shadow-md transition-all text-center gap-2">
                  <CategoryIcon category={slug} className="w-8 h-8" />
                  <span className="font-semibold text-sm text-neutral-900 group-hover:text-orange-700 transition-colors">{catLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Pedir orçamento em {label}</h2>
          <LeadCaptureForm cidade={label} />
        </div>
      </section>

      <WhatsAppStickyBar serviceLabel={`serviços em ${label}`} />
    </div>
  );
}
