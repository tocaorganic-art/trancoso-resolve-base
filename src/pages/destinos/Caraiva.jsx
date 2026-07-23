import { lazy, Suspense } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MapPin, Star, Waves, TreePine, Heart, Leaf } from "lucide-react";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import CategoryIcon from "@/lib/categoryIcons";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";

const LeadCaptureForm = lazy(() => import("@/components/servicos/LeadCaptureForm"));
const HERO_IMAGE = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-caraiva', label: 'Diarista', path: '/servicos/diarista-caraiva' },
  { slug: 'eletricista-caraiva', label: 'Eletricista', path: '/servicos/eletricista-caraiva' },
  { slug: 'piscineiro-caraiva', label: 'Piscineiro', path: '/servicos/piscineiro-caraiva' },
  { slug: 'cozinheiro-caraiva', label: 'Cozinheiro', path: '/servicos/cozinheiro-caraiva' },
  { slug: 'jardineiro-caraiva', label: 'Jardineiro', path: '/servicos/jardineiro-caraiva' },
  { slug: 'pedreiro-caraiva', label: 'Pedreiro', path: '/servicos/pedreiro-caraiva' },
];

export default function DestinoCaraiva() {
  useDestinationSeo({
    title: "Caraíva Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre profissionais verificados em Caraíva, BA: diaristas, eletricistas, piscineiros, cozinheiros e jardineiros. Atendimento na vila sem carros mais charmosa da Bahia.",
    canonical: "https://www.trancosoresolve.com.br/caraiva",
    schemaId: "schema-destino-caraiva",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Caraíva",
      "description": "Marketplace de serviços locais em Caraíva, Bahia. Profissionais verificados para a vila sem carros mais charmosa do Brasil.",
      "url": "https://www.trancosoresolve.com.br/caraiva",
      "address": { "@type": "PostalAddress", "addressLocality": "Caraíva", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.7667, "longitude": -39.2167 },
      "areaServed": { "@type": "Place", "name": "Caraíva, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-background overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-[#1A1208] via-[#2d3a18] to-[#1A1208] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} aria-hidden="true" />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-olive-700/40 border border-olive-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> Caraíva, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados<br />em <span className="text-orange-400">Caraíva</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A autenticidade e o sossego de uma vila sem carros, com praias paradisíacas — e profissionais de confiança para cuidar do seu espaço.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 text-base">
                Encontrar Profissional <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/SejaPrestador">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Seja Prestador em Caraíva
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">O paraíso preservado da Costa do Descobrimento</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Caraíva é única. Sem asfalto, sem carros e com um rio separando a vila do mar, o vilarejo encanta quem busca autenticidade, natureza intocada e o ritmo do tempo desacelerado.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A Trancoso Resolve entende as particularidades de Caraíva — o acesso por barco, a logística especial, as necessidades de pousadas e casas neste ambiente único.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: 'Profissionais verificados' },
                  { icon: Leaf, label: 'Respeito ao ambiente' },
                  { icon: Heart, label: 'Especialistas locais' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-1.5 text-sm text-orange-800 font-medium">
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Waves, title: 'Praias Selvagens', desc: 'Praia da Lagoa, Praia do Rio e Praia de Caraíva preservadas' },
                { icon: TreePine, title: 'Natureza Intocada', desc: 'Área de proteção ambiental com mata atlântica nativa' },
                { icon: Heart, title: 'Autenticidade', desc: 'Culinária local, artesanato e cultura indígena pataxó' },
                { icon: Star, title: 'Exclusividade', desc: 'Pousadas boutique e casas de temporada de alto padrão' },
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Serviços Disponíveis em Caraíva</h2>
            <p className="text-muted-foreground">Profissionais que entendem a logística especial de Caraíva e atendem com qualidade</p>
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
              { slug: 'porto-seguro', nome: 'Porto Seguro', desc: 'A maior cidade da região — hotéis, resorts e residências de alto padrão.', path: '/destinos/porto-seguro' },
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
          <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Caraíva" source="destino-caraiva" />
        </Suspense>
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Caraíva" />
    </div>
  );
}
