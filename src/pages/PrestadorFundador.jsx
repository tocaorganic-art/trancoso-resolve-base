import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, Calendar, Search, MessageSquare, Wallet,
  CalendarCheck, Crown, HelpCircle, CheckCircle2, MapPin, Lock, Users,
} from "lucide-react";
import FounderCounter from "@/components/prestador-fundador/FounderCounter";
import FounderBadge from "@/components/prestador-fundador/FounderBadge";

const BENEFICIOS = [
  { icon: ShieldCheck, title: "Perfil verificado", desc: "Selo de prestador verificado pela plataforma." },
  { icon: Search, title: "Mais visibilidade regional", desc: "Destaque nas buscas de Trancoso, Arraial d'Ajuda, Caraíva e Porto Seguro." },
  { icon: CalendarCheck, title: "Até 10 serviços ativos", desc: "Cadastre até 10 serviços simultaneamente no seu perfil." },
  { icon: MessageSquare, title: "Contato direto com clientes", desc: "Receba pedidos e converse diretamente pelo chat da plataforma." },
  { icon: Wallet, title: "Sem comissão", desc: "Você negocia direto com o cliente e fica com 100% do valor do serviço." },
  { icon: Calendar, title: "Agenda integrada", desc: "Gerencie seus atendimentos pela agenda integrada." },
  { icon: Crown, title: "Selo Fundador", desc: "O Selo Prestador Fundador para os primeiros 100 aprovados." },
  { icon: HelpCircle, title: "Suporte por WhatsApp", desc: "Atendimento direto pela nossa equipe." },
];

const PASSOS = [
  { n: 1, title: "Crie sua conta", desc: "Cadastro gratuito como prestador na Trancoso Resolve." },
  { n: 2, title: "Cadastre seus serviços", desc: "Adicione até 10 serviços com fotos e descrição." },
  { n: 3, title: "Envie os dados para verificação", desc: "Documento de identidade e autorização para consulta de antecedentes." },
  { n: 4, title: "Aguarde a aprovação", desc: "Nossa equipe analisa e aprova prestadores elegíveis." },
  { n: 5, title: "Escolha o plano Profissional", desc: "7 dias grátis. Depois, R$ 19,90 por mês. Sem comissão." },
  { n: 6, title: "Receba o Selo Fundador", desc: "Se ainda houver vagas, você recebe o Selo Prestador Fundador." },
];

const FAQ = [
  {
    q: "Quem pode participar?",
    r: "Prestadores de serviços que concluírem o cadastro, enviarem a documentação e forem aprovados na verificação de antecedentes. A promoção é exclusiva para prestadores — lojistas não participam desta oferta.",
  },
  {
    q: "Como funcionam os 7 dias grátis?",
    r: "Ao aderir ao plano Profissional, você tem 7 dias gratuitos. Seu cartão pode ser cadastrado previamente, mas nenhuma cobrança ocorre durante esse período. Você pode cancelar antes do fim dos 7 dias sem pagar nada.",
  },
  {
    q: "Quando ocorre a primeira cobrança?",
    r: "A primeira cobrança de R$ 19,90 acontece somente após o término dos 7 dias gratuitos. Se você cancelar antes, não é cobrado.",
  },
  {
    q: "Preciso cadastrar cartão?",
    r: "O cartão pode ser cadastrado previamente para facilitar a continuidade, mas nenhuma cobrança é feita durante os 7 dias grátis.",
  },
  {
    q: "Existe comissão sobre os serviços?",
    r: "Não. Você negocia diretamente com o cliente e fica com 100% do valor do serviço. Cobramos apenas a assinatura mensal da plataforma.",
  },
  {
    q: "Posso cancelar?",
    r: "Sim, a qualquer momento e sem multa. Seu acesso continua até o fim do período já pago.",
  },
  {
    q: "O que acontece com o selo se eu cancelar?",
    r: "Ao cancelar, você perde definitivamente o Selo Prestador Fundador. O selo não é recuperado automaticamente.",
  },
  {
    q: "Posso recuperar o selo depois?",
    r: "Não. Caso volte futuramente, você ficará sujeito ao preço e às condições vigentes na época, e não recuperará automaticamente o Selo Fundador.",
  },
  {
    q: "Como funciona a verificação?",
    r: "Enviamos documento de identidade e autorizamos a consulta de antecedentes criminais (LGPD). A aprovação é feita pela nossa equipe. A verificação é obrigatória para receber o Selo Fundador.",
  },
  {
    q: "O cadastro garante uma vaga?",
    r: "Não. O cadastro e a verificação são pré-requisitos, mas o Selo Fundador só é concedido se ainda houver vagas disponíveis entre as 100. A concessão é por ordem de aprovação.",
  },
  {
    q: "O que acontece quando as 100 vagas acabarem?",
    r: "As novas concessões do Selo Fundador são interrompidas. Os fundadores existentes mantêm o benefício. A página informará claramente que as vagas foram encerradas. O plano Profissional normal continua disponível pelo preço vigente.",
  },
  {
    q: "Lojistas também pagam R$ 19,90?",
    r: "Não. A promoção de R$ 19,90 é exclusiva para prestadores de serviços. Lojistas têm planos separados: Essencial (R$ 89/mês), Pro (R$ 197/mês) e Elite (R$ 497/mês).",
  },
];

export default function PrestadorFundador() {
  // SEO gerenciado pelo Layout.jsx — não é necessário setTimeout aqui.
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
          <FounderBadge size="lg" className="mb-6" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4"
          >
            Seja um dos 100 Prestadores Fundadores da Costa do Descobrimento
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6"
          >
            Cadastre seus serviços na Trancoso Resolve, passe pela verificação e conquiste o Selo Prestador Fundador.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex flex-col items-center gap-1 mb-8"
          >
            <p className="text-2xl md:text-3xl font-extrabold text-orange-600">
              7 dias grátis. Depois, R$ 19,90 por mês.
            </p>
            <p className="text-sm md:text-base text-muted-foreground">Sem comissão sobre seus serviços.</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base h-12 px-8">
              <Link to="/Planos">Quero ser Prestador Fundador</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link to="/ComoFunciona">Como funciona</Link>
            </Button>
          </div>

          <FounderCounter />
        </div>
      </section>

      {/* ABRANGÊNCIA */}
      <section className="container mx-auto max-w-4xl px-4 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-orange-500" />
          {["Trancoso", "Arraial d'Ajuda", "Caraíva", "Porto Seguro", "Costa do Descobrimento"].map((c, i) => (
            <span key={c} className="flex items-center">
              <span className="font-semibold text-foreground">{c}</span>
              {i < 4 && <span className="mx-2 text-border">•</span>}
            </span>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="container mx-auto max-w-5xl px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-8">
          Benefícios do Prestador Fundador
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFICIOS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full border-border hover:border-orange-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-muted/40 py-12 md:py-16 mb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-8">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PASSOS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-3 bg-card border border-border rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  {p.n}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARÊNCIA */}
      <section className="container mx-auto max-w-3xl px-4 mb-16">
        <div className="bg-orange-900/10 border border-orange-700/40 rounded-2xl p-6 text-center">
          <Lock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-foreground leading-relaxed">
            <strong>Transparência total:</strong> Oferta exclusiva para prestadores aprovados no processo de verificação.
            Limitada aos primeiros 100 prestadores elegíveis. A cobrança começa somente após os 7 dias gratuitos —
            cancele antes do término do período gratuito para não ser cobrado. O cancelamento posterior remove
            definitivamente o Selo Prestador Fundador. Ao retornar, serão aplicados o preço e as condições vigentes.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-8">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group bg-card border border-border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-sm text-foreground list-none">
                {item.q}
                <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.r}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto max-w-3xl px-4 mb-16 text-center">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-8 md:p-12 text-white">
          <Users className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Restam vagas para os primeiros 100 prestadores
          </h2>
          <p className="text-orange-50 mb-6 max-w-xl mx-auto">
            7 dias grátis, R$ 19,90 por mês, sem comissão sobre seus serviços e cancelamento a qualquer momento.
          </p>
          <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-base h-12 px-8">
            <Link to="/Planos">Quero ser Prestador Fundador</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}