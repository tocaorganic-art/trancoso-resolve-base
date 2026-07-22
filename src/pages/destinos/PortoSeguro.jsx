import { lazy, Suspense } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MapPin, Star, Utensils, Anchor, Sun, Heart } from "lucide-react";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import CategoryIcon from "@/lib/categoryIcons";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";

const LeadCaptureForm = lazy(() => import("@/components/servicos/LeadCaptureForm"));
const HERO_IMAGE = "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-porto-seguro', label: 'Diarista', path: '/servicos/diarista-porto-seguro' },
  { slug: 'eletricista-porto-seguro', label: 'Eletricista', path: '/servicos/eletricista-porto-seguro' },
  { slug: 'piscineiro-porto-seguro', label: 'Piscineiro', path: '/servicos/piscineiro-porto-seguro' },
  { slug: 'cozinheiro-porto-seguro', label: 'Cozinheiro', path: '/servicos/cozinheiro-porto-seguro' },
  { slug: 'jardineiro-porto-seguro', label: 'Jardineiro', path: '/servicos/jardineiro-porto-seguro' },
  { slug: 'pedreiro-porto-seguro', label: 'Pedreiro', path: '/servicos/pedreiro-porto-seguro' },
];

export default function DestinoPortoSeguro() {
  useDestinationSeo({
    title: "Porto Seguro Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre profissionais verificados em Porto Seguro, BA: diaristas, eletricistas, piscineiros, cozinheiros e jardineiros para hotéis, resorts e residências de alto padrão.",
    canonical: "https://www.trancosoresolve.com.br/porto-seguro",
    schemaId: "schema-destino-porto-seguro",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Porto Seguro",
      "description": "Marketplace de serviços locais em Porto Seguro, Bahia. Profissionais verificados para hotéis, resorts e residências.",
      "url": "https://www.trancosoresolve.com.br/porto-seguro",
      "address": { "@type": "PostalAddress", "addressLocality": "Porto Seguro", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.4497, "longitude": -39.0648 },
      "areaServed": { "@type": "Place", "name": "Porto Seguro, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-background overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-background via-orange-900 to-card text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} aria-hidden="true" />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> Porto Seguro, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados em<br /><span className="text-orange-400">Porto Seguro</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A maior cidade da Costa do Descobrimento — hotéis, resorts e residências de alto padrão, com profissionais de confiança da Trancoso Resolve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 text-base">
                Encontrar Profissional <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/SejaPrestador">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Seja Prestador em Porto Seguro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">História, cultura e praias paradisíacas</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Porto Seguro é o berço do Brasil — um destino que combina história colonial, praias deslumbrantes e uma infraestrutura turística completa.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A Trancoso Resolve atua em Porto Seguro com os mesmos padrões de verificação e qualidade. Profissionais para hotéis, resorts, condomínios fechados e residências de luxo.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: 'Profissionais verificados' },
                  { icon: Heart, label: 'Avaliados pela comunidade' },
                  { icon: Anchor, label: 'Especialistas locais' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-1.5 text-sm text-orange-800 font-medium">
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Anchor, title: 'Infraestrutura Completa', desc: 'Aeroporto, resorts e hotéis boutique de alto padrão' },
                { icon: Utensils, title: 'Gastronomia Diversa', desc: 'Frutos do mar, culinária baiana e restaurantes premiados' },
                { icon: Sun, title: 'Praias Para Todos', desc: 'Coroa Vermelha, Taperapuã, Itacimirim e muito mais' },
                { icon: Heart, title: 'Cultura e História', desc: 'Cidade Histórica tombada pelo patrimônio nacional' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                  <Icon className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Serviços Disponíveis em Porto Seguro</h2>
            <p className="text-muted-foreground">Profissionais verificados para cada necessidade do seu hotel, resort ou residência</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {servicos.map((s) => (
              <Link key={s.slug} to={s.path}>
                <div className="bg-card rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-border hover:border-orange-300 group h-full flex flex-col items-center justify-center">
                  <CategoryIcon category={s.label} className="w-7 h-7 mb-2" />
                  <span className="text-xs font-bold text-foreground group-hover:text-orange-700 transition-colors">{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Explore Outros Destinos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { slug: 'trancoso', nome: 'Trancoso', desc: 'O destino mais icônico — villas de luxo, pousadas e o famoso Quadrado.', path: '/destinos/trancoso' },
              { slug: 'caraiva', nome: 'Caraíva', desc: 'O paraíso preservado — sem asfalto, sem carros, só natureza e charme.', path: '/destinos/caraiva' },
            ].map((d) => (
              <Link key={d.slug} to={d.path}>
                <div className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-border hover:border-orange-300 group flex gap-4 items-start">
                  <MapPin className="w-7 h-7 shrink-0" style={{ color: '#E8571A' }} aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-orange-700 transition-colors mb-1">{d.nome}</h3>
                    <p className="text-sm text-muted-foreground">{d.desc}</p>
                    <span className="text-xs text-orange-600 font-medium mt-2 inline-flex items-center gap-1">
                      Ver serviços <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Suspense fallback={<div className="py-12"><Skeleton className="h-96 w-full rounded-lg" /></div>}>
          <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Porto Seguro" source="destino-porto-seguro" />
        </Suspense>
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Porto Seguro" />
    </div>
  );
}
