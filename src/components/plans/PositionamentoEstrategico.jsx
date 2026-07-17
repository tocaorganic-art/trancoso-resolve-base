import { Bot, Eye, BarChart2, Zap, Target, CheckCircle } from "lucide-react";

const Section = ({ icon, title, subtitle, text, benefits, color }) => (
  <div className={`rounded-2xl border p-6 md:p-8 ${color}`}>
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
    {subtitle && <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">{subtitle}</p>}
    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{text}</p>
    <ul className="space-y-2">
      {benefits.map((b, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default function PositionamentoEstrategico() {
  return (
    <div className="mt-16 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">Inovação & Vantagem Competitiva</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
          Trancoso Resolve, Toca TrIA e Toca Vision:<br className="hidden md:block" /> inovação ao alcance de prestadores e lojistas.
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          O Trancoso Resolve, impulsionado pelas tecnologias Toca TrIA e Toca Vision, redefine o padrão de excelência e acessibilidade para prestadores de serviços e lojistas no Brasil. A plataforma não apenas conecta profissionais a clientes, mas os capacita com ferramentas de inteligência artificial de ponta, tornando acessíveis recursos antes restritos a grandes corporações e agências especializadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Section
          icon={<Bot className="w-7 h-7 text-blue-600" />}
          title="Toca TrIA"
          subtitle="Agente de IA autônomo"
          color="bg-blue-50 border-blue-200"
          text="O Toca TrIA é o primeiro agente de inteligência artificial integrado a um site de serviços no Brasil. Mais do que um simples assistente, ele atua de forma autônoma, aprendendo com o seu negócio e otimizando processos para prestadores e lojistas."
          benefits={[
            "Automação inteligente: gerencia agendamentos, responde perguntas frequentes, qualifica leads e otimiza a comunicação com clientes",
            "Otimização de processos: analisa dados de desempenho, sugere melhorias em serviços e precificação e identifica oportunidades de mercado",
            "Assistente pessoal 24/7: disponível a qualquer momento para tarefas administrativas e estratégicas",
            "Liderança de mercado: posiciona você na vanguarda tecnológica, atraindo clientes que valorizam inovação e eficiência",
          ]}
        />
        <Section
          icon={<Eye className="w-7 h-7 text-purple-600" />}
          title="Toca Vision"
          subtitle="Imagens exclusivas com IA"
          color="bg-purple-50 border-purple-200"
          text="O Toca Vision é a ferramenta definitiva para criação de conteúdo visual impactante. Utilizando inteligência artificial avançada, gera imagens exclusivas em alta qualidade, perfeitas para posts, marcas, logos e a representação de experiências únicas em Trancoso."
          benefits={[
            "Marketing profissional otimizado: crie materiais visuais de alta qualidade sem depender de agências",
            "Personalização e diferenciação: comunicação visual única e impactante que fortalece a identidade da sua marca",
            "Versatilidade: ideal para promoções, cardápios, divulgação de serviços, eventos e identidade visual completa",
            "Eficiência: geração rápida de imagens, otimizando tempo e processo criativo",
          ]}
        />
        <Section
          icon={<BarChart2 className="w-7 h-7 text-green-600" />}
          title="Dashboard Financeiro Integrado"
          subtitle="Gestão 360º"
          color="bg-green-50 border-green-200"
          text="O Dashboard Financeiro vai além da gestão do negócio. Ele oferece uma visão holística, permitindo que prestadores e lojistas administrem tudo que está no aplicativo e também organizem sua vida financeira pessoal."
          benefits={[
            "Controle total do negócio: receitas, despesas, lucros, fluxo de caixa e performance dos serviços",
            "Organização financeira pessoal: categorização de gastos, orçamentos e acompanhamento de metas",
            "Tomada de decisão inteligente: relatórios e análises para identificar oportunidades de economia e crescimento",
            "Redução de complexidade: substitui múltiplas ferramentas e planilhas por um único painel integrado",
          ]}
        />
        <Section
          icon={<Target className="w-7 h-7 text-amber-600" />}
          title="Tecnologia avançada acessível"
          subtitle="Otimização de custo-benefício"
          color="bg-amber-50 border-amber-200"
          text="O grande diferencial do ecossistema Toca é oferecer ferramentas inovadoras de alto impacto com investimento otimizado. Tecnologias que antes eram restritas a grandes empresas, agora ao alcance de quem trabalha em Trancoso."
          benefits={[
            "Acessibilidade tecnológica: equalize as condições de mercado e compita com grandes players",
            "Maximização do ROI: baixo custo com alto potencial de aumento de vendas, otimização de tempo e melhor gestão",
            "Foco no core business: ao automatizar tarefas e simplificar a gestão, você foca no que faz de melhor",
          ]}
        />
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 md:p-8 text-white text-center">
        <Zap className="w-8 h-8 mx-auto mb-3 opacity-90" />
        <p className="text-base font-semibold max-w-2xl mx-auto leading-relaxed">
          O Trancoso Resolve, com o Toca TrIA, o Toca Vision e o Dashboard Financeiro Integrado, constitui um ecossistema completo que capacita seus usuários com inteligência artificial e gestão financeira avançada — a escolha estratégica para profissionais e lojistas que buscam eficiência, visibilidade e crescimento sustentável.
        </p>
      </div>
    </div>
  );
}