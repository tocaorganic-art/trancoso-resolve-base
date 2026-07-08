import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  MessageCircle, Clock, Users, Zap, CheckCircle2,
  ChevronRight, Shield, Smartphone, TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LeadAssistenteModal from '@/components/leads/LeadAssistenteModal';

export default function AssistenteVirtualPage() {
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    // Mostra modal de captura após 30s se não logado
    let timer;
    base44.auth.isAuthenticated().then(auth => {
      if (!auth) {
        timer = setTimeout(() => setShowLeadModal(true), 30000);
      }
    });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = 'Assistente IA | Trancoso Resolve';
    const desc = 'Converse com o Toca TrIA, o assistente inteligente da Trancoso Resolve. Encontre o profissional certo para sua necessidade em segundos.';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = desc;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = 'Assistente IA | Trancoso Resolve';

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = desc;
  }, []);

  const handleActivarClick = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
    } else {
      window.location.href = createPageUrl('Dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {showLeadModal && <LeadAssistenteModal onClose={() => setShowLeadModal(false)} />}
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">Toca TrIA em Ação</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Seu assistente de IA para conquistar mais clientes em Trancoso
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            O Assistente de IA da Trancoso Resolve responde clientes, organiza pedidos e ajuda você a vender mais — <strong>mesmo quando você está atendendo ou offline</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8"
              onClick={handleActivarClick}
            >
              Ativar Assistente de IA no meu perfil
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to={createPageUrl('Assistentevirtual')}>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-500 text-white hover:bg-slate-800 rounded-lg px-8"
              >
                Ver como funciona na prática
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cenários Práticos */}
      <section className="py-20 px-4 md:px-6 bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que ele faz na vida real</h2>
            <p className="text-slate-400 text-lg">Três situações do seu dia a dia que o Assistente resolve sozinho</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Cenário 1 */}
            <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Cliente manda mensagem à noite</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                O Assistente de IA responde com as informações básicas sobre seus serviços, horários e forma de atendimento, e coleta os dados do cliente para você retornar depois.
              </CardContent>
            </Card>

            {/* Cenário 2 */}
            <Card className="bg-slate-700 border-slate-600 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Você está em atendimento</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Enquanto você está em serviço e não consegue olhar o celular, o assistente avisa o cliente que você está atendendo, faz perguntas-chave e organiza o pedido para você responder quando estiver livre.
              </CardContent>
            </Card>

            {/* Cenário 3 */}
            <Card className="bg-slate-700 border-slate-600 hover:border-green-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Perguntas repetidas o dia inteiro</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                O Assistente de IA responde automaticamente dúvidas frequentes sobre preço aproximado, tipos de serviço, bairros atendidos e formas de pagamento.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefícios para o seu negócio</h2>
            <p className="text-slate-400 text-lg">Resultados práticos que impactam suas vendas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Benefício 1 */}
            <div className="flex gap-4 p-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Nunca mais perca cliente por falta de resposta rápida</h3>
                <p className="text-slate-400">O assistente responde 24 horas por dia, mesmo quando você está offline ou dormindo.</p>
              </div>
            </div>

            {/* Benefício 2 */}
            <div className="flex gap-4 p-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 transition-colors">
              <div className="shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Transforme visitas ao seu perfil em conversas reais</h3>
                <p className="text-slate-400">Quem encontra você na Trancoso Resolve pode ser atendido na hora pelo Assistente de IA.</p>
              </div>
            </div>

            {/* Benefício 3 */}
            <div className="flex gap-4 p-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-purple-500 transition-colors">
              <div className="shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Menos tempo respondendo perguntas repetidas</h3>
                <p className="text-slate-400">Mais tempo para fazer o que você faz de melhor: atender seus clientes com qualidade.</p>
              </div>
            </div>

            {/* Benefício 4 */}
            <div className="flex gap-4 p-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500 transition-colors">
              <div className="shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-400 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Atendimento profissional sem custo extra</h3>
                <p className="text-slate-400">Você tem um "atendente virtual" sem pagar salário, comissão ou plantão. Incluído no seu perfil.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section className="py-20 px-4 md:px-6 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona em 3 passos</h2>
            <p className="text-slate-400 text-lg">Ative, configure e deixe trabalhando para você</p>
          </div>

          <div className="space-y-6">
            {/* Passo 1 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold text-lg">1</div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Você ativa o Assistente de IA no seu painel</h3>
                <p className="text-slate-400">Clique em um botão e o assistente começa a funcionar. É instantâneo.</p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-600 text-white font-bold text-lg">2</div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-white mb-2">O assistente usa informações do seu perfil</h3>
                <p className="text-slate-400">Serviços, horários, bairros atendidos, preços e formas de pagamento — tudo que você já cadastrou na Trancoso Resolve.</p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-600 text-white font-bold text-lg">3</div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Ele atende os primeiros contatos dos clientes</h3>
                <p className="text-slate-400">Responde dúvidas básicas, coleta dados importantes e organiza os pedidos. Você recebe tudo pronto e só precisa finalizar o atendimento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exemplo de Conversa */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Exemplo de conversa real</h2>
            <p className="text-slate-400 text-lg">Veja exatamente como o Assistente responde em seu nome</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
            {/* Cliente */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                <p className="text-sm">Oi, você faz faxina em casa de temporada perto do Quadrado?</p>
              </div>
            </div>

            {/* Assistente */}
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                <p className="text-sm font-semibold text-cyan-300 mb-1">Assistente de IA (em seu nome)</p>
                <p className="text-sm">Oi! Faço sim. Para te passar o valor certinho, me informa por favor:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Quantos quartos?</li>
                  <li>• Qual a data e horário desejados?</li>
                  <li>• Você precisa de material de limpeza incluso?</li>
                </ul>
              </div>
            </div>

            {/* Cliente */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                <p className="text-sm">São 3 quartos, para sábado de manhã. Eu não tenho material.</p>
              </div>
            </div>

            {/* Assistente */}
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                <p className="text-sm">Perfeito! Vou organizar suas informações aqui e o prestador vai te responder com o valor e a confirmação de horário assim que estiver disponível.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              <strong>Você está sempre no controle:</strong> O assistente não fecha preço final, não promete o que não existe no seu cadastro e você pode desligar ou ajustar quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Toca TrIA Connection */}
      <section className="py-20 px-4 md:px-6 bg-slate-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">O poder do Toca TrIA a serviço do seu negócio</h2>

          <p className="text-xl text-slate-300 mb-8">
            O Assistente de IA da Trancoso Resolve é a forma mais simples de usar o <strong>Toca TrIA</strong> no seu dia a dia.
            Ele aprende com o tipo de serviço que você presta, com os pedidos dos clientes e com a forma como você responde, para melhorar o atendimento ao longo do tempo.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="flex gap-3 p-4 rounded-lg bg-slate-700 border border-slate-600">
              <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                <strong className="text-white">Inteligência artificial focada no seu tipo de serviço,</strong> não em respostas genéricas.
              </p>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-slate-700 border border-slate-600">
              <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                <strong className="text-white">Trabalha junto com seu perfil,</strong> suas avaliações e suas estatísticas de desempenho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-slate-400 text-lg">Tire suas dúvidas sobre o Assistente de IA</p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="flex items-center justify-between font-bold text-white">
                <span>O Assistente de IA pode falar algo errado em meu nome?</span>
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-slate-400 mt-4">
                O assistente usa informações do seu perfil e respostas pré-definidas para dúvidas comuns. Ele <strong>não fecha preço final sem você</strong>, nem promete serviços que não existem no seu cadastro. Você pode desligar ou ajustar o assistente a qualquer momento.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="flex items-center justify-between font-bold text-white">
                <span>Posso desligar o Assistente quando eu quiser?</span>
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-slate-400 mt-4">
                Sim. Você continua no controle total. Pode ativar, pausar ou desligar o Assistente de IA pelo seu painel de prestador a qualquer momento, sem compromisso.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="flex items-center justify-between font-bold text-white">
                <span>Ele muda meus preços ou agenda sozinho?</span>
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-slate-400 mt-4">
                Não. O Assistente ajuda na <strong>primeira comunicação</strong>, mas quem define preço, confirma horário e fecha o serviço é sempre <strong>você</strong>.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="flex items-center justify-between font-bold text-white">
                <span>O Assistente funciona em quais horários?</span>
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-slate-400 mt-4">
                24 horas por dia, 7 dias por semana. Mesmo fora do seu horário normal, ele pode explicar como funciona seu atendimento e registrar o interesse do cliente.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="flex items-center justify-between font-bold text-white">
                <span>O Assistente atende só na Trancoso Resolve ou também no WhatsApp?</span>
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-slate-400 mt-4">
                Hoje o foco principal é atender clientes que chegam pelo seu perfil na Trancoso Resolve. Integrações adicionais (como WhatsApp) podem ser ativadas conforme a evolução da plataforma.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para conquistar mais clientes?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Ative o Assistente de IA agora e comece a responder clientes 24/7.
          </p>

          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-100 rounded-lg px-8"
            onClick={handleActivarClick}
          >
            Ativar Assistente de IA no meu perfil
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}