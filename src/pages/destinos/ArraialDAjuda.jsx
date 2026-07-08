import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Waves, TreePine, Heart, Sun } from "lucide-react";
import LeadCaptureForm from "@/components/servicos/LeadCaptureForm";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import { useDestinationSeo } from "@/hooks/useDestinationSeo";

const HERO_IMAGE = "https://images.unsplash.com/photo-1518630904902-67a36caae5e8?auto=format&fit=crop&w=1600&q=80";

const servicos = [
  { slug: 'diarista-arraial-dajuda', label: 'Diarista', emoji: '🧹', path: '/servicos/diarista-arraial-dajuda' },
  { slug: 'eletricista-arraial-dajuda', label: 'Eletricista', emoji: '⚡', path: '/servicos/eletricista-arraial-dajuda' },
  { slug: 'piscineiro-arraial-dajuda', label: 'Piscineiro', emoji: '🏊', path: '/servicos/piscineiro-arraial-dajuda' },
  { slug: 'cozinheiro-arraial-dajuda', label: 'Cozinheiro', emoji: '👨‍🍳', path: '/servicos/cozinheiro-arraial-dajuda' },
  { slug: 'jardineiro-arraial-dajuda', label: 'Jardineiro', emoji: '🌿', path: '/servicos/jardineiro-arraial-dajuda' },
  { slug: 'pedreiro-arraial-dajuda', label: 'Pedreiro', emoji: '🏗️', path: '/servicos/pedreiro-arraial-dajuda' },
];

export default function DestinoArraialDAjuda() {
  useDestinationSeo({
    title: "Arraial d'Ajuda Bahia | Serviços e Profissionais Verificados — Trancoso Resolve",
    description: "Encontre profissionais verificados em Arraial d'Ajuda, BA: diaristas, eletricistas, piscineiros, cozinheiros e jardineiros. Atendimento no destino mais charmoso da Costa do Descobrimento.",
    canonical: "https://www.trancosoresolve.com.br/destinos/arraial-dajuda",
    schemaId: "schema-destino-arraial-dajuda",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Trancoso Resolve — Serviços em Arraial d'Ajuda",
      "description": "Marketplace de serviços locais em Arraial d'Ajuda, Bahia. Profissionais verificados para o destino mais charmoso da Costa do Descobrimento.",
      "url": "https://www.trancosoresolve.com.br/destinos/arraial-dajuda",
      "address": { "@type": "PostalAddress", "addressLocality": "Arraial d'Ajuda", "addressRegion": "BA", "addressCountry": "BR" },
      "geo": { "@type": "GeoCoordinates", "latitude": -16.4914, "longitude": -39.0669 },
      "areaServed": { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" }
    },
  });

  return (
    <div className="bg-slate-50 overflow-x-hidden">
      <section className="relative bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800 text-white py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-700/40 border border-orange-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-orange-200 mb-6">
            <MapPin className="w-4 h-4" /> Arraial d'Ajuda, Bahia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Serviços Verificados<br />em <span className="text-amber-400">Arraial d'Ajuda</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            O charme da Costa do Descobrimento — praias deslumbrantes, o melhor da gastronomia e profissionais de confiança para cuidar do seu espaço.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ServicosCategoria">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 text-base">
                Encontrar Profissional <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/SejaPrestador">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8 text-base">
                Seja Prestador em Arraial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">O charme da Costa do Descobrimento</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Arraial d'Ajuda é o destino que combina rusticidade e sofisticação. Com a famosa Rua do Mucugê, praias de tirar o fôlego e uma vida noturna vibrante, atrai visitantes do mundo todo.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                A Trancoso Resolve leva profissionais verificados para atender pousadas, casas de temporada e residências em Arraial. Quem ganha é a comunidade local — renda e oportunidade real.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star, label: 'Profissionais verificados' },
                  { icon: Sun, label: 'Atendimento em todas as praias' },
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
                { icon: Waves, title: 'Praias Deslumbrantes', desc: 'Pitinga, Taípe, Apaga Fogo e Parracho' },
                { icon: TreePine, title: 'Natureza e Charme', desc: 'Falésias coloridas e mata atlântica preservada' },
                { icon: Heart, title: 'Gastronomia', desc: 'A famosa Rua do Mucugê com seus restaurantes' },
                { icon: Star, title: 'Exclusividade', desc: 'Pousadas boutique e casas de alto padrão' },
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

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Serviços Disponíveis em Arraial d'Ajuda</h2>
            <p className="text-slate-500">Profissionais que conhecem o charme e as necessidades de Arraial</p>
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

        <section className="mb-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Entendemos Arraial d'Ajuda</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Arraial tem uma dinâmica única: a travessia de balsa, o movimento sazonal de turistas, as pousadas que precisam de manutenção constante e os padrões de qualidade que o destino exige.
          </p>
          <ul className="space-y-3">
            {[
              'Profissionais acostumados com a logística da balsa e o acesso às praias.',
              'Equipes que atendem pousadas e casas de temporada com discrição.',
              'Conhecimento dos fornecedores e materiais disponíveis na região.',
              'Atendimento de urgências mesmo nos picos de alta temporada.',
              'Respeito ao ambiente e às particularidades de cada praia.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Explore Outros Destinos</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { slug: 'trancoso', nome: 'Trancoso', emoji: '🏄', desc: 'Villas de luxo e o famoso Quadrado.', path: '/destinos/trancoso' },
              { slug: 'porto-seguro', nome: 'Porto Seguro', emoji: '⚓', desc: 'Hotéis, resorts e residências.', path: '/destinos/porto-seguro' },
              { slug: 'caraiva', nome: 'Caraíva', emoji: '🌊', desc: 'O paraíso preservado sem carros.', path: '/destinos/caraiva' },
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

        <LeadCaptureForm serviceInterest="Geral" serviceLabel="um profissional em Arraial d'Ajuda" source="destino-arraial-dajuda" />
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional em Arraial d'Ajuda" />
    </div>
  );
}