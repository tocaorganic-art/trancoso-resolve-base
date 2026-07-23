import { lazy, Suspense } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MapPin, Star, Utensils, Waves, Sun, Heart } from "lucide-react";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import CategoryIcon from "@/lib/categoryIcons";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";

const LeadCaptureForm = lazy(() => import("@/components/servicos/LeadCaptureForm"));
const HERO_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-arraial-dajuda', label: 'Diarista', path: '/arraial-dajuda/diarista' },
  { slug: 'eletricista-arraial-dajuda', label: 'Eletricista', path: '/arraial-dajuda/eletricista' },
  { slug: 'piscineiro-arraial-dajuda', label: 'Piscineiro', path: '/arraial-dajuda/piscineiro' },
  { slug: 'chef-arraial-dajuda', label: 'Chef Particular', path: '/arraial-dajuda/chef' },
  { slug: 'jardineiro-arraial-dajuda', label: 'Jardineiro', path: '/arraial-dajuda/jardineiro' },
  { slug: 'encanador-arraial-dajuda', label: 'Encanador', path: '/arraial-dajuda/encanador' },
  { slug: 'pedreiro-arraial-dajuda', label: 'Pedreiro', path: '/arraial-dajuda/pedreiro' },
  { slug: 'pintor-arraial-dajuda', label: 'Pintor', path: '/arraial-dajuda/pintor' },
  { slug: 'seguranca-arraial-dajuda', label: 'Segurança', path: '/arraial-dajuda/seguranca' },
  { slug: 'motorista-arraial-dajuda', label: 'Motorista', path: '/arraial-dajuda/motorista' },
];

export default function DestinoArraialDajuda() {
  useDestinationSeo({
    title: "Arraial d'Ajuda Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre diaristas, eletricistas, piscineiros, chefs e mais em Arraial d'Ajuda, BA. Profissionais verificados para sua vila, pousada ou residência no litoral baiano.",
    canonical: "https://www.trancosoresolve.com.br/arraial-dajuda",
    schemaId: "schema-destino-arraial-dajuda",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Arraial d'Ajuda",
      "description": "Marketplace de serviços locais em Arraial d'Ajuda, Bahia. Profissionais verificados para vilas, pousadas e residências.",
      "url": "https://www.trancosoresolve.com.br/arraial-dajuda",
      "address": { "@type": "PostalAddress", "addressLocality": "Arraial d'Ajuda", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.4467, "longitude": -39.0744 },
      "areaServed": { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-background overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-background via-orange-900 to-card text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} aria-hidden="true" />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> Arraial d'Ajuda, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados<br />em <span className="text-orange-400">Arraial d'Ajuda</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            O refúgio paradisíaco da Costa do Descobrimento — com profissionais de confiança para sua vila de férias, pousada boutique ou residência à beira-mar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 text-base">
                Encontrar Profissional <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/SejaPrestador">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Seja Prestador em Arraial d'Ajuda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">O paraíso preservado da Bahia</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Arraial d'Ajuda é o refúgio perfeito para quem busca tranquilidade, natureza intocada e beleza rústica. Conhecido pela Igreja de São João Batista colorida, praias virgens e uma atmosfera de aconchego, o destino atrai viajantes em busca de autenticidade.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A Trancoso Resolve conecta proprietários de residências, gestores de pousadas e moradores a profissionais verificados e avaliados — da limpeza ao reparo, da reforma à jardinagem.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: 'Profissionais verificados' },
                  { icon: Heart, label: 'Avaliados pela comunidade' },
                  { icon: MapPin, label: 'Locais e conhecidos' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-1.5 text-sm text-orange-800 font-medium">
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Waves, title: 'Praias Virgens', desc: 'Praia de Taípe, Lagoa Azul e muito mais' },
                { icon: Utensils, title: 'Gastronomia Local', desc: 'Restaurantes simples e aconchegantes' },
                { icon: Sun, title: 'Lifestyle Autêntico', desc: 'Vilas e pousadas com charme rústico' },
                { icon: Heart, title: 'Natureza', desc: 'Trilhas, mergulho e ecoturismo' },
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Serviços Disponíveis em Arraial d'Ajuda</h2>
            <p className="text-muted-foreground">Profissionais verificados para cada necessidade da sua residência ou pousada</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { slug: 'trancoso', nome: 'Trancoso', desc: 'O luxo do Quadrado e praias exclusivas.', path: '/destinos/trancoso' },
              { slug: 'porto-seguro', nome: 'Porto Seguro', desc: 'A maior cidade da região com infraestrutura completa.', path: '/destinos/porto-seguro' },
              { slug: 'caraiva', nome: 'Caraíva', desc: 'O paraíso preservado — sem asfalto, só natureza.', path: '/destinos/caraiva' },
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
          <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Arraial d'Ajuda" source="destino-arraial-dajuda" />
        </Suspense>
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Arraial d'Ajuda" />
    </div>
  );
}
