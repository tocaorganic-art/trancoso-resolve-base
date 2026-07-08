import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LazyImage from "@/components/ui/LazyImage";
import VerificacaoBadge from "@/components/verificacao/VerificacaoBadge";
import {
  Star, MapPin, CheckCircle, ArrowRight, Phone, Shield, Clock, Loader2
} from "lucide-react";

const servicoConfig = {
  "limpeza-trancoso": {
    title: "Diaristas e Faxineiras em Trancoso, BA",
    h1: "Diaristas e Limpeza Doméstica em Trancoso",
    description: "Contrate diaristas e faxineiras verificadas em Trancoso, Bahia. Serviço de limpeza residencial e de pousadas com profissionais avaliados pela comunidade.",
    occupation: "Limpeza",
    keywords: "diarista Trancoso, faxineira Trancoso, limpeza doméstica Trancoso, serviço limpeza Trancoso BA",
    ogImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/inigQzgVMUPeKrkL.png",
    faq: [
      { q: "Quanto custa uma diarista em Trancoso?", a: "O valor de uma diarista em Trancoso varia entre R$ 120 e R$ 300 por diária, dependendo do tamanho do imóvel e dos serviços inclusos. Consulte os perfis para ver os preços de cada profissional." },
      { q: "Os profissionais são verificados?", a: "Sim, todos os prestadores passam por verificação de identidade e consulta de antecedentes antes de aparecerem na plataforma." },
      { q: "Posso contratar para limpeza de pousada ou villa?", a: "Sim. Muitos profissionais têm experiência em pousadas, villas e imóveis de temporada em Trancoso." },
    ],
    heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/inigQzgVMUPeKrkL.png",
    color: "from-teal-500 to-cyan-600",
  },
  "eletricista-trancoso": {
    title: "Eletricista em Trancoso, BA — Profissionais Verificados",
    h1: "Eletricista em Trancoso, Bahia",
    description: "Eletricistas qualificados em Trancoso para instalações, manutenção e emergências. Profissionais verificados com avaliações de clientes reais.",
    occupation: "Eletricista",
    keywords: "eletricista Trancoso, serviço elétrico Trancoso, instalação elétrica Trancoso BA",
    ogImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/loNdoqfPbYrpiZUY.png",
    faq: [
      { q: "Tem eletricista disponível para emergências em Trancoso?", a: "Sim, vários eletricistas em nosso cadastro atendem com urgência. Verifique a disponibilidade no perfil de cada profissional." },
      { q: "Qual o custo médio de um serviço elétrico em Trancoso?", a: "O valor varia conforme a complexidade. Instalações simples costumam partir de R$ 150, enquanto serviços mais complexos podem custar mais. Solicite orçamento diretamente com o profissional." },
    ],
    heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/loNdoqfPbYrpiZUY.png",
    color: "from-yellow-500 to-amber-600",
  },
  "encanador-trancoso": {
    title: "Encanador em Trancoso, BA — Serviços Hidráulicos",
    h1: "Encanador em Trancoso, Bahia",
    description: "Encanadores especializados em Trancoso para reparos, entupimentos e instalações hidráulicas. Atendimento rápido com profissionais verificados.",
    occupation: "Encanador",
    keywords: "encanador Trancoso, hidráulico Trancoso, conserto vazamento Trancoso BA",
    ogImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/SzIYzgzmeNbfcRvv.png",
    faq: [
      { q: "Como contratar um encanador urgente em Trancoso?", a: "Acesse a lista de encanadores disponíveis, verifique o status 'Disponível' no perfil e entre em contato diretamente pelo WhatsApp." },
      { q: "Encanadores atendem em vilarejos próximos a Trancoso?", a: "Muitos profissionais informam o raio de atendimento no perfil. Consulte a localização e cobertura de cada um." },
    ],
    heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/SzIYzgzmeNbfcRvv.png",
    color: "from-blue-500 to-indigo-600",
  },
  "jardinagem-trancoso": {
    title: "Jardineiro em Trancoso, BA — Paisagismo e Manutenção",
    h1: "Jardinagem e Paisagismo em Trancoso, Bahia",
    description: "Jardineiros especializados em plantas tropicais em Trancoso. Manutenção de jardins, poda, paisagismo para residências, pousadas e villas na Bahia.",
    occupation: "Jardinagem",
    keywords: "jardineiro Trancoso, jardinagem Trancoso, paisagismo Trancoso BA, manutenção jardim Trancoso",
    ogImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/MmnYpPgxNHhyniba.png",
    faq: [
      { q: "Tem jardineiro especializado em plantas nativas da Bahia em Trancoso?", a: "Sim, nossos profissionais têm experiência com plantas tropicais e nativas do litoral sul da Bahia, ideais para o clima de Trancoso." },
      { q: "Com que frequência devo contratar um jardineiro em Trancoso?", a: "No clima tropical de Trancoso, recomenda-se manutenção quinzenal ou mensal. Verifique os planos disponíveis com cada profissional." },
    ],
    heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/MmnYpPgxNHhyniba.png",
    color: "from-green-500 to-emerald-600",
  },
  "cozinheiro-trancoso": {
    title: "Chef e Cozinheiro Particular em Trancoso, BA",
    h1: "Cozinheiro e Chef Particular em Trancoso, Bahia",
    description: "Chefs e cozinheiros particulares em Trancoso para jantares, eventos e diárias. Gastronomia baiana autêntica com frutos do mar para sua villa ou pousada.",
    occupation: "Cozinheiro",
    keywords: "cozinheiro Trancoso, chef particular Trancoso, jantar villa Trancoso, gastronomia Trancoso BA",
    ogImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/XKIqXQfxYpLpcnsh.png",
    faq: [
      { q: "Posso contratar um chef para um jantar privativo na minha villa em Trancoso?", a: "Sim! Temos chefs especializados em jantares privativos, com menus personalizados de frutos do mar e culinária baiana." },
      { q: "Os cozinheiros atendem a eventos e festas em Trancoso?", a: "Sim, muitos profissionais atendem eventos, casamentos e celebrações. Consulte disponibilidade com antecedência." },
    ],
    heroImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/XKIqXQfxYpLpcnsh.png",
    color: "from-orange-500 to-red-500",
  },
  "pedreiro-trancoso": {
    title: "Pedreiro e Construção em Trancoso, BA",
    h1: "Pedreiro e Serviços de Construção em Trancoso, Bahia",
    description: "Pedreiros experientes em Trancoso para reformas, construção e manutenção. Profissionais verificados para obras residenciais e comerciais na Bahia.",
    occupation: "Pedreiro",
    keywords: "pedreiro Trancoso, reforma Trancoso, construção Trancoso BA, manutenção Trancoso",
    ogImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    faq: [
      { q: "Tem pedreiro para reformas pequenas em Trancoso?", a: "Sim, atendemos desde reparos pontuais até reformas completas. Os profissionais detalham os tipos de serviço nos perfis." },
    ],
    heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    color: "from-slate-500 to-slate-700",
  },
  "pintor-trancoso": {
    title: "Pintor em Trancoso, BA — Pintura Residencial e Comercial",
    h1: "Pintor em Trancoso, Bahia",
    description: "Pintores profissionais em Trancoso para pintura residencial, comercial e decorativa. Acabamento de qualidade para villas, pousadas e imóveis na Bahia.",
    occupation: "Pintor",
    keywords: "pintor Trancoso, pintura residencial Trancoso, pintura comercial Trancoso BA",
    ogImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    faq: [
      { q: "Qual o custo de pintura por metro quadrado em Trancoso?", a: "O valor médio varia conforme o tipo de tinta e superfície. Consulte diretamente com o profissional para orçamento personalizado." },
    ],
    heroImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
    color: "from-purple-500 to-violet-600",
  },
  "baba-trancoso": {
    title: "Babá e Cuidadora em Trancoso, BA",
    h1: "Babá e Cuidadora de Crianças em Trancoso, Bahia",
    description: "Babás verificadas em Trancoso para cuidados de crianças durante viagens, hospedagem ou eventos. Profissionais com referências e experiência comprovada.",
    occupation: "Babá",
    keywords: "babá Trancoso, cuidadora criança Trancoso, babysitter Trancoso BA",
    ogImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80",
    faq: [
      { q: "As babás em Trancoso têm verificação de antecedentes?", a: "Sim, todos os prestadores passam por consulta de antecedentes criminais e verificação de identidade antes de ser listados na plataforma." },
    ],
    heroImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    color: "from-pink-500 to-rose-500",
  },
  "garcom-trancoso": {
    title: "Garçom para Eventos em Trancoso, BA",
    h1: "Garçom e Serviço de Eventos em Trancoso, Bahia",
    description: "Garçons profissionais em Trancoso para eventos, jantares e celebrações. Equipe treinada e uniformizada para elevar o padrão do seu evento na Bahia.",
    occupation: "Garçom",
    keywords: "garçom Trancoso, garçom eventos Trancoso, serviço evento Trancoso BA",
    ogImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    faq: [
      { q: "Posso contratar vários garçons para um evento grande em Trancoso?", a: "Sim. Informe o tamanho do evento ao profissional para adequar a equipe necessária." },
    ],
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    color: "from-cyan-600 to-blue-700",
  },
};

const ProviderMiniCard = ({ provider }) => (
  <Link to={createPageUrl("PrestadorPerfil", `?id=${provider.id}`)}>
    <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="relative shrink-0">
          <LazyImage
            src={provider.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name)}&size=80`}
            alt={`Foto de ${provider.full_name}, ${provider.occupation} em Trancoso`}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
          />
          {provider.verified && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate group-hover:text-cyan-700">{provider.full_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium">{provider.rating ? provider.rating.toFixed(1) : 'Novo'}</span>
            </div>
            {provider.total_reviews > 0 && (
              <span className="text-xs text-slate-500">({provider.total_reviews})</span>
            )}
            {provider.availability === 'Disponível' && (
              <Badge className="bg-green-100 text-green-700 text-xs py-0 px-1.5">Disponível</Badge>
            )}
          </div>
          {provider.location?.city && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{provider.location.city}</span>
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 shrink-0" />
      </CardContent>
    </Card>
  </Link>
);

export default function ServicoLandingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'limpeza-trancoso';
  const config = servicoConfig[slug] || servicoConfig['limpeza-trancoso'];

  useEffect(() => {
    document.title = config.title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = config.description;

    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) { metaKw = document.createElement('meta'); metaKw.name = 'keywords'; document.head.appendChild(metaKw); }
    metaKw.content = config.keywords;

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://www.trancosoresolve.com.br/ServicoLanding?slug=${slug}`;

    // OG:URL dinâmico
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `https://www.trancosoresolve.com.br/ServicoLanding?slug=${slug}`;

    // OG:Title dinâmico
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = config.title;

    // OG:Description dinâmico
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = config.description;

    // OG:Image por categoria
    if (config.ogImage) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property', 'og:image'); document.head.appendChild(ogImage); }
      ogImage.content = config.ogImage;
    }

    // Schema Markup
    const schemaId = 'schema-servico-landing';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": config.h1,
          "description": config.description,
          "url": `https://www.trancosoresolve.com.br/ServicoLanding?slug=${slug}`,
          "provider": {
            "@type": "LocalBusiness",
            "name": "Trancoso Resolve",
            "url": "https://www.trancosoresolve.com.br",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Trancoso",
              "addressRegion": "BA",
              "addressCountry": "BR"
            }
          },
          "areaServed": {
            "@type": "Place",
            "name": "Trancoso, Bahia, Brasil"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": config.faq.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          }))
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.trancosoresolve.com.br" },
            { "@type": "ListItem", "position": 2, "name": "Serviços", "item": "https://www.trancosoresolve.com.br/ServicosCategoria" },
            { "@type": "ListItem", "position": 3, "name": config.occupation, "item": `https://www.trancosoresolve.com.br/ServicoLanding?slug=${slug}` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);

    return () => {
      const s = document.getElementById(schemaId);
      if (s) s.remove();
    };
  }, [slug, config]);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers-by-occupation', config.occupation],
    queryFn: () => base44.entities.ServiceProvider.filter({}, '-rating', 20),
    select: (data) => data?.filter(p =>
      p.occupation === config.occupation &&
      p.status_verificacao !== 'reprovado'
    ).slice(0, 9),
  });

  const availableCount = providers?.filter(p => p.availability === 'Disponível').length || 0;
  const verifiedCount = providers?.filter(p => p.verified).length || 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className={`bg-gradient-to-r ${config.color} text-white py-12 md:py-20`}>
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <nav className="text-sm text-white/70 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 flex-wrap">
                <li><Link to="/" className="hover:text-white">Início</Link></li>
                <li>/</li>
                <li><Link to={createPageUrl("ServicosCategoria")} className="hover:text-white">Serviços</Link></li>
                <li>/</li>
                <li className="text-white font-medium">{config.occupation}</li>
              </ol>
            </nav>
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight">{config.h1}</h1>
            <p className="text-lg text-white/90 mb-6">{config.description}</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {availableCount > 0 && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{availableCount} disponível{availableCount > 1 ? 'is' : ''} agora</span>
                </div>
              )}
              {verifiedCount > 0 && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>{verifiedCount} verificado{verifiedCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <Link to={createPageUrl("ServicosCategoria", `?cat=${config.occupation}`)}>
              <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 font-bold shadow-lg">
                Ver Todos os Profissionais
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="hidden lg:block">
            <img
              src={config.heroImage}
              alt={`${config.occupation} profissional em Trancoso, Bahia`}
              className="rounded-2xl shadow-2xl w-full object-cover max-h-80"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />, label: "Verificados", sub: "Antecedentes consultados" },
            { icon: <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />, label: "Avaliados", sub: "Feedbacks reais de clientes" },
            { icon: <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />, label: "Ágeis", sub: "Resposta rápida via WhatsApp" },
            { icon: <MapPin className="w-6 h-6 text-red-500 mx-auto mb-1" />, label: "Locais", sub: "Profissionais de Trancoso" },
          ].map((item, i) => (
            <div key={i} className="py-3">
              {item.icon}
              <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
        {/* Profissionais */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              {config.occupation === 'Limpeza' ? 'Diaristas' : `${config.occupation}s`} em Trancoso
            </h2>
            <Link to={createPageUrl("ServicosCategoria", `?cat=${config.occupation}`)}>
              <Button variant="ghost" className="text-cyan-600">Ver todos</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          ) : providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map(p => <ProviderMiniCard key={p.id} provider={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-slate-500 mb-4">Ainda não há profissionais cadastrados nesta categoria.</p>
              <Link to={createPageUrl("SejaPrestador")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">Seja o Primeiro!</Button>
              </Link>
            </div>
          )}
        </section>

        {/* FAQ Schema */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
            Perguntas Frequentes sobre {config.occupation} em Trancoso
          </h2>
          <div className="space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                  <span className="text-cyan-600 shrink-0 mt-0.5">Q.</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-5">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links para outras categorias */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Outros Serviços em Trancoso</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(servicoConfig)
              .filter(([s]) => s !== slug)
              .map(([s, c]) => (
                <Link key={s} to={`/ServicoLanding?slug=${s}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-cyan-50 hover:border-cyan-300 py-1.5 px-3">
                    {c.occupation}
                  </Badge>
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* CTA Final */}
      <section className={`bg-gradient-to-r ${config.color} py-12`}>
        <div className="container mx-auto max-w-2xl px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Precisa de {config.occupation} em Trancoso?</h2>
          <p className="text-white/90 mb-6">Profissionais verificados prontos para atender você.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("ServicosCategoria", `?cat=${config.occupation}`)}>
              <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 font-bold w-full sm:w-auto">
                Encontrar Profissional
              </Button>
            </Link>
            <Link to={createPageUrl("SejaPrestador")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 w-full sm:w-auto">
                Seja um Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}