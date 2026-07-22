import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Star, Bot, Camera, BarChart2, Users, ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    icon: <Shield className="w-7 h-7 text-orange-400" />,
    title: "Profissionais Verificados",
    desc: "Análise de antecedentes criminais, verificação de identidade e validação de dados — cada prestador aprovado passa por rigoroso processo antes de aparecer na plataforma."
  },
  {
    icon: <Star className="w-7 h-7 text-sand-deep" />,
    title: "Avaliações Transparentes",
    desc: "Clientes reais, avaliações reais. Nada de notas infladas: todo feedback é auditado para que você confie em quem contrata."
  },
  {
    icon: <Bot className="w-7 h-7 text-terracotta" />,
    title: "TryA — IA 24 horas",
    desc: "Nosso agente de inteligência artificial está disponível a qualquer momento para sugerir o profissional certo, responder dúvidas e agilizar seu pedido — tudo em português (e espanhol)."
  },
  {
    icon: <Camera className="w-7 h-7 text-olive-500" />,
    title: "Toca Vision — Criação Visual com IA",
    desc: "Prestadores têm acesso a um gerador de imagens exclusivo: crie posts, cardápios e materiais visuais de alto padrão em segundos, sem custo adicional."
  },
  {
    icon: <BarChart2 className="w-7 h-7 text-terracotta-deep" />,
    title: "Dashboard Financeiro Integrado",
    desc: "Controle de receitas, despesas, previsão de ganhos e relatórios — tudo dentro da plataforma. Sem planilhas, sem complicação."
  },
  {
    icon: <Users className="w-7 h-7 text-olive-600" />,
    title: "Comunidade VIP Trancoso",
    desc: "Uma rede exclusiva de moradores, empresários e prestadores que compartilham o compromisso com a excelência que Trancoso exige."
  },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Sobre Nós | Trancoso Resolve — Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva';

    const setMeta = (selector, attr, key, value) => {
      let el = document.querySelector(selector);
      if (!el) { el = document.createElement('meta'); if (attr) el.setAttribute(attr, key); else el.name = key; document.head.appendChild(el); }
      el.content = value;
    };

    const desc = 'Conheça a Trancoso Resolve, a plataforma que conecta quem precisa de serviço a profissionais verificados em Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva, na Bahia.';
    setMeta('meta[name="description"]', null, 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', 'Sobre Nós | Trancoso Resolve — Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva');
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/About`;

    // JSON-LD
    const schemaId = 'schema-about';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Trancoso Resolve",
      "url": window.location.origin,
      "description": desc,
      "areaServed": [
        { "@type": "Place", "name": "Trancoso, Bahia, Brasil" },
        { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" },
        { "@type": "Place", "name": "Porto Seguro, Bahia, Brasil" },
        { "@type": "Place", "name": "Caraíva, Bahia, Brasil" }
      ],
      "foundingDate": "2017",
      "sameAs": [
        "https://www.instagram.com/trancosoresolve/",
        "https://www.facebook.com/share/1B7w8mmbMN/"
      ]
    });
    document.head.appendChild(script);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl relative">
          <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">
            <MapPin className="w-4 h-4" />
            <span>Trancoso, Bahia — Brasil</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Sua Expertise no<br />
            <span className="text-orange-500">Coração de Trancoso.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
            O Trancoso Resolve nasceu da Toca Concierge — 8 anos conectando moradores, turistas e empresários ao melhor que Trancoso tem a oferecer. Hoje somos a plataforma digital que transforma essa curadoria em tecnologia acessível para todos.
          </p>
          <Link to={createPageUrl('ServicosCategoria')}>
            <Button className="bg-brand-primary hover:bg-orange-600 text-white font-bold px-8 py-3 text-base">
              Explorar Profissionais <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Missão */}
      <section className="py-16 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Nossa Missão</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">Curadoria de experiências. Conexão de confiança.</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Trancoso atrai um público exigente — e esse público merece serviços à altura. Por isso desenvolvemos um processo rigoroso de verificação que vai além do básico: análise de antecedentes criminais, validação de identidade e acompanhamento contínuo de desempenho.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mais que uma plataforma de contratação, somos o elo entre quem vive e trabalha em Trancoso e os visitantes que desejam viver a experiência com tranquilidade absoluta.
              </p>
            </div>
            <div className="space-y-4">
              {[
                'Verificação de antecedentes criminais em todos os prestadores',
                'Avaliações auditadas e transparentes',
                'Suporte em português, inglês e espanhol (argentino)',
                'Pagamentos seguros via Mercado Pago',
                'IA integrada: TryA e Toca Vision',
                'Dashboard financeiro completo para prestadores',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">O que nos diferencia</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Tecnologia a serviço da excelência</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-orange-500/40 transition-colors">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-16 px-4 bg-muted/40 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Para quem é</span>
            <h2 className="text-3xl font-bold mt-2">Feito para Trancoso. Para todos.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🏡',
                title: 'Moradores & Proprietários',
                desc: 'Mantenha sua casa, pousada ou villa com os melhores profissionais locais — verificados, avaliados e sempre disponíveis quando você precisa.'
              },
              {
                emoji: '✈️',
                title: 'Turistas & Visitantes',
                desc: 'Chegou a Trancoso e precisa de um eletricista, diarista ou cozinheiro? Contrate com segurança em minutos, sem precisar de indicação.'
              },
              {
                emoji: '🔧',
                title: 'Prestadores de Serviço',
                desc: 'Acesse uma audiência VIP, receba mais pedidos, organize seu negócio com IA e construa uma reputação digital sólida em Trancoso.'
              },
            ].map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
                <span className="text-4xl block mb-4">{card.emoji}</span>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Seja para contratar um profissional de confiança ou expandir seu negócio em Trancoso, estamos aqui para facilitar cada passo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('ServicosCategoria')}>
              <Button className="bg-brand-primary hover:bg-orange-600 text-white font-bold px-8">
                Contratar um Profissional <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('SejaPrestador')}>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted px-8">
                Quero ser Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}