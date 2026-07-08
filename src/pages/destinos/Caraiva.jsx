import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Waves, TreePine, Heart, Leaf } from "lucide-react";
import LeadCaptureForm from "@/components/servicos/LeadCaptureForm";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";

const HERO_IMAGE = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-caraiva', label: 'Diarista', emoji: '🧹', path: '/servicos/diarista-caraiva' },
  { slug: 'eletricista-caraiva', label: 'Eletricista', emoji: '⚡', path: '/servicos/eletricista-caraiva' },
  { slug: 'piscineiro-caraiva', label: 'Piscineiro', emoji: '🏊', path: '/servicos/piscineiro-caraiva' },
  { slug: 'cozinheiro-caraiva', label: 'Cozinheiro', emoji: '👨‍🍳', path: '/servicos/cozinheiro-caraiva' },
  { slug: 'jardineiro-caraiva', label: 'Jardineiro', emoji: '🌿', path: '/servicos/jardineiro-caraiva' },
  { slug: 'pedreiro-caraiva', label: 'Pedreiro', emoji: '🏗️', path: '/servicos/pedreiro-caraiva' },
];

export default function DestinoCaraiva() {
  useDestinationSeo({
    title: "Caraíva Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre profissionais verificados em Caraíva, BA: diaristas, eletricistas, piscineiros, cozinheiros e jardineiros. Atendimento na vila sem carros mais charmosa da Bahia.",
    canonical: "https://www.trancosoresolve.com.br/destinos/caraiva",
    schemaId: "schema-destino-caraiva",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Caraíva",
      "description": "Marketplace de serviços locais em Caraíva, Bahia. Profissionais verificados para a vila sem carros mais charmosa do Brasil.",
      "url": "https://www.trancosoresolve.com.br/destinos/caraiva",
      "address": { "@type": "PostalAddress", "addressLocality": "Caraíva", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.7667, "longitude": -39.2167 },
      "areaServed": { "@type": "Place", "name": "Caraíva, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-slate-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 text-white py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-green-200 mb-6">
            <MapPin className="w-4 h-4" /> Caraíva, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados<br />em <span className="text-amber-400">Caraíva</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            A autenticidade e o sossego de uma vila sem carros, com praias paradisíacas — e profissionais de confiança para cuidar do seu espaço.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 text-base">
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

        {/* Sobre Caraíva */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">O paraíso preservado da Costa do Descobrimento</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Caraíva é única. Sem asfalto, sem carros e com um rio separando a vila do mar, o vilarejo encanta quem busca autenticidade, natureza intocada e o ritmo do tempo desacelerado. Um destino cada vez mais valorizado por viajantes VIP.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                A Trancoso Resolve entende as particularidades de Caraíva — o acesso por barco, a logística especial, as necessidades de pousadas e casas neste ambiente único. Profissionais verificados que conhecem e respeitam o local.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: 'Profissionais verificados' },
                  { icon: Leaf, label: 'Respeito ao ambiente' },
                  { icon: Heart, label: 'Especialistas locais' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-1.5 text-sm text-amber-800 font-medium">
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
                <div key={title} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <Icon className="w-6 h-6 text-amber-600 mb-2" />
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{title}</h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Serviços Disponíveis */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Serviços Disponíveis em Caraíva</h2>
            <p className="text-slate-500">Profissionais que entendem a logística especial de Caraíva e atendem com qualidade</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {servicos.map((s) => (
              <Link key={s.slug} to={s.path}>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-amber-300 group h-full flex flex-col items-center justify-center">
                  <span className="text-2xl block mb-2" aria-hidden="true">{s.emoji}</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Particularidades */}
        <section className="mb-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Entendemos Caraíva</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Caraíva tem particularidades únicas que exigem profissionais que conhecem o local: o acesso pela balsa, a ausência de asfalto, as limitações de materiais e ferramentas, e o cuidado especial com o meio ambiente.
          </p>
          <ul className="space-y-3">
            {[
              'Profissionais acostumados com o acesso por barco e as condições locais.',
              'Equipes que respeitam a área de proteção ambiental e suas regras.',
              'Conhecimento das fornecedoras e materiais disponíveis na região.',
              'Atendimento às pousadas boutique que exigem discrição e qualidade.',
              'Suporte para urgências, mesmo com a logística diferenciada de Caraíva.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Outros Destinos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Explore Outros Destinos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { slug: 'trancoso', nome: 'Trancoso', emoji: '🏄', desc: 'O destino mais icônico — villas de luxo, pousadas e o famoso Quadrado.', path: '/destinos/trancoso' },
              { slug: 'porto-seguro', nome: 'Porto Seguro', emoji: '⚓', desc: 'A maior cidade da região — hotéis, resorts e residências de alto padrão.', path: '/destinos/porto-seguro' },
            ].map((d) => (
              <Link key={d.slug} to={d.path}>
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-amber-300 group flex gap-4 items-start">
                  <span className="text-3xl">{d.emoji}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-1">{d.nome}</h3>
                    <p className="text-sm text-slate-500">{d.desc}</p>
                    <span className="text-xs text-amber-600 font-medium mt-2 inline-flex items-center gap-1">
                      Ver serviços <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Caraíva" source="destino-caraiva" />
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Caraíva" />
    </div>
  );
}
