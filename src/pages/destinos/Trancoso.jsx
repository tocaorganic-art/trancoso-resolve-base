import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Utensils, Waves, Sun, Heart } from "lucide-react";
import CategoryIcon from "@/lib/categoryIcons";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";
import { Skeleton } from "@/components/ui/skeleton";

const LeadCaptureForm = lazy(() => import("@/components/servicos/LeadCaptureForm"));

const HERO_IMAGE = "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-trancoso', label: 'Diarista', path: '/servicos/diarista-trancoso' },
  { slug: 'eletricista-trancoso', label: 'Eletricista', path: '/servicos/eletricista-trancoso' },
  { slug: 'piscineiro-trancoso', label: 'Piscineiro', path: '/servicos/piscineiro-trancoso' },
  { slug: 'chef-trancoso', label: 'Chef Particular', path: '/servicos/chef-trancoso' },
  { slug: 'jardineiro-trancoso', label: 'Jardineiro', path: '/servicos/jardineiro-trancoso' },
  { slug: 'encanador-trancoso', label: 'Encanador', path: '/servicos/encanador-trancoso' },
  { slug: 'pedreiro-trancoso', label: 'Pedreiro', path: '/servicos/pedreiro-trancoso' },
  { slug: 'pintor-trancoso', label: 'Pintor', path: '/servicos/pintor-trancoso' },
  { slug: 'seguranca-trancoso', label: 'Segurança', path: '/servicos/seguranca-trancoso' },
  { slug: 'motorista-trancoso', label: 'Motorista', path: '/servicos/motorista-trancoso' },
];

const bairros = [
  { slug: 'quadrado-trancoso', nome: 'Quadrado de Trancoso', path: '/servicos/quadrado-trancoso' },
  { slug: 'rio-verde-trancoso', nome: 'Rio Verde', path: '/servicos/rio-verde-trancoso' },
  { slug: 'pitinga-trancoso', nome: 'Pitinga', path: '/servicos/pitinga-trancoso' },
];

export default function DestinoTrancoso() {
  useDestinationSeo({
    title: "Trancoso Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre diaristas, eletricistas, piscineiros, chefs e mais em Trancoso, BA. Profissionais verificados para sua villa, pousada ou residência no Quadrado.",
    canonical: "https://www.trancosoresolve.com.br/trancoso",
    schemaId: "schema-destino-trancoso",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Trancoso",
      "description": "Marketplace de serviços locais em Trancoso, Bahia. Profissionais verificados para villas, pousadas e residências.",
      "url": "https://www.trancosoresolve.com.br/trancoso",
      "address": { "@type": "PostalAddress", "addressLocality": "Trancoso", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 },
      "areaServed": { "@type": "Place", "name": "Trancoso, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-background overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-background via-orange-900 to-card text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} aria-hidden="true" />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> Trancoso, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados<br />em <span className="text-orange-400">Trancoso</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            O charme rústico-chique e a exclusividade de um paraíso baiano — com profissionais de confiança para sua villa, pousada ou residência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 text-base">
                Encontrar Profissional <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/SejaPrestador">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Seja Prestador em Trancoso
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">O destino mais icônico da Bahia</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Trancoso é sinônimo de exclusividade. Com o famoso Quadrado repleto de casas coloridas, restaurantes de alto padrão e praias como Rio Verde e Pitinga, o destino atrai viajantes VIP do Brasil e do mundo.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A Trancoso Resolve conecta proprietários de villas, gestores de pousadas e moradores a profissionais verificados e avaliados — da diarista ao chef particular, do eletricista ao piscineiro.
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
                { icon: Waves, title: 'Praias Exclusivas', desc: 'Rio Verde, Pitinga, Nativos e muito mais' },
                { icon: Utensils, title: 'Gastronomia Premium', desc: 'Os melhores chefs e restaurantes do Quadrado' },
                { icon: Sun, title: 'Lifestyle de Luxo', desc: 'Villas e pousadas de alto padrão' },
                { icon: Heart, title: 'Bem-estar', desc: 'Spas, retiros e experiências exclusivas' },
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Serviços Disponíveis em Trancoso</h2>
            <p className="text-muted-foreground">Profissionais verificados para cada necessidade da sua villa ou pousada</p>
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

        <section className="mb-16 bg-gradient-to-br from-orange-50 to-orange-50 rounded-3xl p-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Atendemos em Todo Trancoso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bairros.map((b) => (
              <Link key={b.slug} to={b.path}>
                <div className="bg-card rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all border border-border hover:border-orange-400 group">
                  <h3 className="font-bold text-foreground group-hover:text-orange-700 transition-colors mb-1">{b.nome}</h3>
                  <p className="text-xs text-orange-600 font-medium flex items-center justify-center gap-1">
                    Ver profissionais <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Explore Outros Destinos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { slug: 'porto-seguro', nome: 'Porto Seguro', desc: 'A maior cidade da região — hotéis, resorts e residências de alto padrão.', path: '/destinos/porto-seguro' },
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
          <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Trancoso" source="destino-trancoso" />
        </Suspense>
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Trancoso" />
    </div>
  );
}
