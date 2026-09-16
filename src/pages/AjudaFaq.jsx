import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle, User, Briefcase, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FAQ_CATEGORIES = [
  {
    id: 'geral',
    title: 'Sobre a Plataforma',
    icon: HelpCircle,
    items: [
      {
        question: 'O que é o Trancoso Resolve?',
        answer: 'Somos a plataforma que conecta clientes a prestadores de serviços verificados em Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva. Você encontra diaristas, eletricistas, cozinheiros, Jardineiros e muitos outros profissionais — com avaliações reais e agenda online.'
      },
      {
        question: 'Quanto custa para usar a plataforma?',
        answer: 'Para clientes, é totalmente gratuito buscar, solicitar e contratar serviços. Prestadores têm planos a partir do Teste Gratuito de 30 dias — confira a página de Planos para detalhes.'
      },
      {
        question: 'Em quais cidades a plataforma atende?',
        answer: 'Operamos em toda a Costa do Descobrimento: Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva. Cada destino tem sua própria página com os profissionais que atendem na região.'
      },
      {
        question: 'Preciso criar uma conta para contratar um serviço?',
        answer: 'Você pode navegar pelos perfis e serviços livremente. Para enviar solicitações, avaliar profissionais e acompanhar seus pedidos, basta criar uma conta gratuita com e-mail ou Google.'
      }
    ]
  },
  {
    id: 'clientes',
    title: 'Para Clientes',
    icon: User,
    items: [
      {
        question: 'Como contratar um profissional?',
        answer: 'Busque pelo serviço desejado ou navegue pelas categorias. No perfil do profissional, escolha o serviço, selecione data e horário e envie a solicitação — você recebe a confirmação do prestador.'
      },
      {
        question: 'Como sei que um profissional é confiável?',
        answer: 'Procure pelo selo "Verificado": significa que o prestador passou por verificação de identidade e consulta de antecedentes criminais. Leia também as avaliações de outros clientes e confira o portfólio de trabalhos.'
      },
      {
        question: 'Como funciona o pagamento?',
        answer: 'O pagamento é combinado diretamente entre você e o prestador (dinheiro, PIX ou cartão, conforme indicado no perfil). A plataforma facilita o contato, o agendamento e a avaliação.'
      },
      {
        question: 'Posso cancelar um agendamento?',
        answer: 'Sim. Em "Meus Pedidos" você cancela solicitações ainda não confirmadas. Após a confirmação, combine diretamente com o profissional — cancele com antecedência para não prejudicar a agenda dele.'
      },
      {
        question: 'Como avaliar um serviço?',
        answer: 'Depois da conclusão, vá em "Meus Pedidos", localize o serviço e clique em "Avaliar". Sua nota de 1 a 5 estrelas e seu comentário ajudam outros clientes da região.'
      }
    ]
  },
  {
    id: 'prestadores',
    title: 'Para Prestadores',
    icon: Briefcase,
    items: [
      {
        question: 'Como me cadastrar como prestador?',
        answer: 'Acesse "Seja um Prestador", crie sua conta e complete seu perfil com foto, bio, especialidades e preços. Quanto mais completo o perfil, mais solicitações você recebe.'
      },
      {
        question: 'Como consigo o selo de Verificado?',
        answer: 'No seu perfil de prestador, envie uma foto do seu documento e autorize a consulta de antecedentes. Nossa equipe analisa e, aprovado, o selo aparece automaticamente — o que aumenta muito a confiança dos clientes.'
      },
      {
        question: 'Quanto pago para usar a plataforma?',
        answer: 'Você começa com o Teste Gratuito de 30 dias, sem cartão. Depois, escolha entre os planos mensais disponíveis na página de Planos, com benefícios como destaque nas buscas.'
      },
      {
        question: 'Como recebo pelos serviços?',
        answer: 'O recebimento é direto do cliente, pelo método que você configurar no seu perfil (dinheiro, PIX, cartão). A plataforma não intermedia o pagamento do serviço.'
      }
    ]
  },
  {
    id: 'pagamentos',
    title: 'Planos e Pagamentos',
    icon: CreditCard,
    items: [
      {
        question: 'Como funciona o Teste Gratuito?',
        answer: 'Ao se cadastrar como prestador, você tem 30 dias grátis para experimentar todos os recursos, sem precisar de cartão de crédito. Ao final, pode assinar um plano para continuar com os benefícios.'
      },
      {
        question: 'Como cancelar minha assinatura?',
        answer: 'Você pode cancelar a qualquer momento direto no seu painel, em "Financeiro" ou "Planos". O cancelamento interrompe as próximas cobranças; seu perfil permanece ativo até o fim do período pago.'
      },
      {
        question: 'Emito nota fiscal pelos meus serviços?',
        answer: 'A relação fiscal é entre você e seu cliente. Se você é MEI ou PJ, emitir nota fiscal aumenta sua credibilidade — muitos clientes (pousadas e villas) solicitam.'
      }
    ]
  },
  {
    id: 'conta',
    title: 'Conta e Segurança',
    icon: ShieldCheck,
    items: [
      {
        question: 'Como altero meus dados ou minha senha?',
        answer: 'Na página "Configurações da Conta" você atualiza nome e telefone, altera sua senha e define quais notificações quer receber por e-mail.'
      },
      {
        question: 'Meus dados estão protegidos?',
        answer: 'Sim. Seguimos a LGPD: seus dados são usados apenas para operar a plataforma e nunca são vendidos. Consulte nossa Política de Privacidade para detalhes completos.'
      },
      {
        question: 'Como excluo minha conta?',
        answer: 'Fale com nosso suporte pelo chat no canto da tela. A exclusão apaga seus dados pessoais conforme a LGPD, respeitando os prazos legais de armazenamento.'
      }
    ]
  }
];

export default function AjudaFaq() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'FAQ e Ajuda - Trancoso Resolve';
    const meta = document.querySelector('meta[name="description"]') ||
      (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    meta.content = 'Dúvidas frequentes sobre o Trancoso Resolve: como contratar profissionais verificados, planos, pagamentos, verificação de prestadores e segurança.';
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term)
        )
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold">FAQ e Ajuda</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Tire suas dúvidas sobre como contratar profissionais e usar o Trancoso Resolve na Costa do Descobrimento.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="relative mb-8"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dúvida (ex: cancelar, verificado, plano...)"
            className="pl-10"
            aria-label="Buscar nas perguntas frequentes"
          />
        </motion.div>

        {filteredCategories.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">
                Nenhuma dúvida encontrada para "{search}".
              </p>
              <Button asChild variant="link" className="mt-2 text-primary">
                <Link to="/Contact">Fale com nosso suporte</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.section
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                >
                  <h2 className="flex items-center gap-2 text-xl font-bold mb-3">
                    <Icon className="w-5 h-5 text-primary" /> {cat.title}
                  </h2>
                  <Accordion type="single" collapsible className="border border-border rounded-lg bg-card shadow-warm-sm px-4">
                    {cat.items.map((item, i) => (
                      <AccordionItem key={i} value={`${cat.id}-${i}`}>
                        <AccordionTrigger className="text-left font-semibold text-sm md:text-base">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.section>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground text-sm">Não encontrou sua resposta?</p>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <Button asChild className="bg-brand-primary text-white hover:bg-orange-600">
              <Link to="/Contact">Fale com o suporte</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/Manual">Ver manual completo</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}