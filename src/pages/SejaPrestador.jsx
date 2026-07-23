import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart2, Users, Star, Bot, Camera } from 'lucide-react';
import LeadPrestadorForm from '@/components/leads/LeadPrestadorForm';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Testimonials from '@/components/home/Testimonials';
import HeroSection from '@/components/sejaprestador/HeroSection';
import SelosQualidade from '@/components/sejaprestador/SelosQualidade';
import TabelaComparativa from '@/components/sejaprestador/TabelaComparativa';
import CalculadoraGanhos from '@/components/sejaprestador/CalculadoraGanhos';

const beneficios = [
  {
    icon: <Users className="w-8 h-8 text-orange-600" />,
    title: "Alcance Mais Clientes",
    description: "Tenha seu perfil divulgado para turistas e moradores de Trancoso que buscam profissionais qualificados e de confiança. Amplie sua base de forma eficiente e direcionada."
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-olive-500" />,
    title: "Gestão Simplificada",
    description: "Painel completo para gerenciar agenda, confirmar serviços e acompanhar seu desempenho financeiro de forma intuitiva. Otimize seu tempo e foque no seu trabalho."
  },
  {
    icon: <Star className="w-8 h-8 text-sand-deep" />,
    title: "Construa sua Reputação",
    description: "Receba avaliações transparentes dos clientes e construa uma reputação online sólida. A credibilidade conquistada atrai continuamente novas oportunidades de negócio."
  },
  {
    icon: <Bot className="w-8 h-8 text-terracotta" />,
    title: "TryA: Agente de IA 24h",
    description: "Mais do que um assistente, o TryA automatiza agendamentos, responde a perguntas frequentes e qualifica leads — trabalhando por você enquanto você foca no serviço."
  },
  {
    icon: <Camera className="w-8 h-8 text-orange-500" />,
    title: "Toca Vision: Imagens com IA",
    description: "Crie posts, cardápios, logos e materiais visuais impactantes em minutos. Gere imagens exclusivas em alta qualidade, fortalecendo sua identidade visual sem custos adicionais."
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-olive-600" />,
    title: "Custo Zero de Marketing",
    description: "Esqueça o gasto com anúncios e divulgação. Na Trancoso Resolve, seu perfil é exibido gratuitamente para quem já está procurando exatamente o que você oferece."
  }
];

const steps = [
  {
    n: 1,
    title: "Crie seu Perfil",
    desc: "Cadastre-se, adicione seus serviços, fotos do portfólio e defina seus preços com facilidade."
  },
  {
    n: 2,
    title: "Receba Solicitações",
    desc: "Seja notificado quando um cliente solicitar seu serviço. Confirme disponibilidade diretamente pelo app."
  },
  {
    n: 3,
    title: "Realize e Receba",
    desc: "Execute o serviço com excelência, receba o pagamento e incentive avaliações para crescer na plataforma."
  }
];

export default function SejaPrestadorPage() {
  useEffect(() => {
    document.title = "Seja um Prestador de Serviços em Trancoso — Trancoso Resolve";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Cadastre-se como prestador de serviços em Trancoso Resolve. Receba clientes verificados, custo zero de marketing, gestão com IA e construa sua reputação online.";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/SejaPrestador`;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/SejaPrestador`;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = 'Seja um Prestador de Serviços em Trancoso — Trancoso Resolve';

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = 'Cadastre-se como prestador de serviços em Trancoso Resolve. Receba clientes verificados, custo zero de marketing, gestão com IA e construa sua reputação online.';

    const schemaId = 'schema-seja-prestador';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "name": "Seja um Parceiro Trancoso Resolve",
          "url": `${window.location.origin}/SejaPrestador`,
          "description": "Cadastre-se como prestador de serviços verificado em Trancoso e comece a receber novos clientes pela plataforma."
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${window.location.origin}` },
            { "@type": "ListItem", "position": 2, "name": "Seja um Prestador", "item": `${window.location.origin}/SejaPrestador` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);

  return (
    <div className="bg-background">
      {/* Hero */}
      <HeroSection />

      {/* Benefícios - Dark Cards com Alto Contraste */}
      <section className="bg-card py-10 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-6 md:mb-12">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">Vantagens exclusivas</span>
            <h2 className="text-xl md:text-3xl font-bold text-foreground mt-2">Por que ser um Parceiro Trancoso Resolve?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {beneficios.map((item, index) => (
              <div key={index} className="group bg-background rounded-2xl p-6 md:p-8 border border-border hover:border-orange-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 transition-colors">{item.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selos de Qualidade */}
      <SelosQualidade />

      {/* Tabela Comparativa */}
      <TabelaComparativa />

      {/* Testimonials */}
      <Testimonials />

      {/* Calculadora de Ganhos */}
      <CalculadoraGanhos />

      {/* Como Funciona */}
      <section id="como-funciona" className="container mx-auto py-10 md:py-20 px-4 max-w-2xl">
        <div className="text-center mb-6 md:mb-12">
          <span className="text-sm font-semibold text-orange-600 uppercase tracking-widest">Simples e rápido</span>
          <h2 className="text-xl md:text-3xl font-bold text-foreground mt-2">Como funciona</h2>
        </div>
        <ul className="space-y-6">
          {steps.map(s => (
            <li key={s.n} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                {s.n}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{s.title}</h3>
                <p className="text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Formulário pré-cadastro prestador */}
      <section className="container mx-auto px-4 max-w-3xl pb-8">
        <LeadPrestadorForm />
      </section>

      {/* Links internos de suporte */}
      <section className="container mx-auto px-4 max-w-3xl pb-4">
        <div className="bg-card rounded-2xl p-6 shadow-sm border text-center">
          <p className="text-foreground font-medium mb-3">Quer saber mais antes de se cadastrar?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("ComoFunciona")}>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                Como funciona a plataforma?
              </Button>
            </Link>
            <Link to={createPageUrl("ServicosCategoria")}>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                Ver prestadores já cadastrados
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <div className="bg-card py-16 md:py-24 border-t border-border">
        <div className="container mx-auto text-center px-4 max-w-2xl">
          <span className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Vagas limitadas por categoria</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Sua Expertise no<br />
            <span className="text-orange-400">Coração de Trancoso.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            Conecte-se a uma audiência VIP de moradores, proprietários de villas e turistas de alto padrão que buscam exatamente o que você oferece. Sem custo de marketing. Sem intermediários.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('CadastroTipo')}>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg px-10 py-4 shadow-xl min-h-[52px]">
                Cadastre-se Agora — É Grátis
              </Button>
            </Link>
            <Link to={createPageUrl('Planos')}>
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted font-semibold px-8 min-h-[52px]">
                Ver Planos e Preços
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground text-xs mt-6">Todos os prestadores passam por verificação de identidade e análise de antecedentes.</p>
        </div>
      </div>

    </div>
  );
}