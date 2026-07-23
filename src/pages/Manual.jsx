import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User, Briefcase, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Estrutura JSON para o FAQ, permitindo fácil manutenção e uso pela IA.
const faqContent = {
  geral: {
    title: <><BookOpen className="w-5 h-5" /> Guia Geral</>,
    items: [
      { question: "O que é o Trancoso Resolve?", answer: "Somos uma plataforma que conecta clientes a prestadores de serviço locais de confiança em Trancoso, facilitando a busca, agendamento e avaliação de serviços." },
      { question: "Como criar uma conta?", answer: "Clique em 'Entrar' no canto superior direito. Você pode se cadastrar rapidamente usando sua conta do Google, ou com seu e-mail e uma senha. Após o cadastro, escolha se você é 'cliente' ou 'prestador'." },
      { question: "É seguro usar a plataforma?", answer: "Sim. Verificamos nossos prestadores e usamos um sistema de avaliação transparente para garantir a qualidade. Seus dados são protegidos seguindo as diretrizes da LGPD. Visite nossa página de Segurança para mais detalhes." },
      { question: "Como funciona o pagamento?", answer: "Atualmente, a negociação e o pagamento são feitos diretamente entre o cliente e o prestador. A plataforma facilita o contato inicial e o agendamento." },
      { question: "A plataforma cobra alguma taxa dos clientes?", answer: "Não. Para clientes, o uso da plataforma para buscar e contratar serviços é totalmente gratuito." },
    ]
  },
  clientes: {
    title: <><User className="w-5 h-5" /> Para Clientes</>,
    items: [
      { question: "Como contratar um serviço?", answer: "Use a barra de busca ou navegue pelas categorias na página inicial. Ao encontrar um profissional, veja seu perfil completo, escolha o serviço desejado, selecione data e horário, e envie a solicitação. O prestador irá confirmar o agendamento." },
      { question: "Como posso confiar em um prestador?", answer: "Procure por prestadores com o selo 'Verificado' (ícone de estrela). Leia as avaliações e comentários de outros clientes, confira o portfólio de trabalhos anteriores e verifique há quanto tempo o profissional está na plataforma." },
      { question: "O que significa o selo 'Verificado'?", answer: "Significa que o prestador enviou um documento de identificação (RG, CPF ou CNH) que foi validado por nossa equipe, confirmando sua identidade. Isso aumenta a segurança da contratação." },
      { question: "Como avaliar um prestador após o serviço?", answer: "Após a conclusão do serviço, acesse 'Meus Pedidos' no menu do seu perfil. Localize o serviço concluído e clique em 'Avaliar'. Dê uma nota de 1 a 5 estrelas e deixe um comentário. Sua opinião ajuda outros clientes e melhora a comunidade." },
      { question: "Posso cancelar um serviço agendado?", answer: "Sim, você pode cancelar uma solicitação em 'Meus Pedidos' a qualquer momento antes da confirmação. Após confirmado, entre em contato diretamente com o prestador para negociar. Cancele com antecedência para não prejudicar o profissional." },
      { question: "Como entrar em contato com o prestador?", answer: "No perfil do prestador, você encontra o botão do WhatsApp para contato direto. Também pode enviar mensagens através da solicitação de serviço após enviá-la." },
      { question: "Os preços são negociáveis?", answer: "Os preços exibidos são de referência. Você pode negociar diretamente com o prestador, especialmente para serviços maiores ou recorrentes. Use o WhatsApp ou mensagem na plataforma." },
      { question: "Preciso pagar antecipadamente?", answer: "Atualmente, todo pagamento é feito diretamente entre você e o prestador, no momento que combinarem. A plataforma não intermedia pagamentos, mas estamos trabalhando para implementar essa funcionalidade." },
    ]
  },
  prestadores: {
    title: <><Briefcase className="w-5 h-5" /> Para Prestadores</>,
    items: [
      { question: "Como me cadastrar como prestador?", answer: "Clique em 'Seja um prestador' na página inicial e crie sua conta. Ao entrar, selecione 'Sou prestador de serviços'. Depois, acesse 'Meu Perfil de Prestador' para completar suas informações: foto, bio, especialidades, preços e métodos de pagamento aceitos." },
      { question: "Quais são os custos para ser um prestador?", answer: "Oferecemos planos flexíveis: o plano Básico é gratuito com recursos essenciais. Planos pagos oferecem destaque na busca, mais serviços cadastrados e menor taxa de comissão. Visite a página 'Planos' para comparar." },
      { question: "Como cadastrar meus serviços?", answer: "Acesse 'Meus Serviços' no menu. Clique em 'Adicionar Serviço', preencha título, descrição detalhada, categoria, preço e adicione fotos do seu trabalho. Quanto mais completo, mais atrativo para clientes." },
      { question: "Como recebo mais solicitações?", answer: "Dicas para aumentar contratações: 1) Complete 100% do seu perfil; 2) Adicione fotos de qualidade dos seus trabalhos; 3) Responda rapidamente às solicitações; 4) Peça avaliações aos clientes satisfeitos; 5) Mantenha preços competitivos; 6) Atualize sua disponibilidade regularmente." },
      { question: "Como gerenciar minha agenda?", answer: "Acesse 'Minha Agenda' no painel. Lá você vê todas as solicitações pendentes, pode confirmar ou rejeitar. Após concluir um serviço, marque como 'Concluído' para que o cliente possa avaliar. Use os filtros para organizar por data ou status." },
      { question: "Como ser um prestador 'Verificado'?", answer: "Na página 'Meu Perfil de Prestador', role até a seção 'Verificação'. Envie uma foto clara do seu documento (RG, CPF ou CNH). Nossa equipe analisa em até 48 horas. Após aprovação, o selo aparece automaticamente no seu perfil." },
      { question: "Como funciona o pagamento pelos serviços?", answer: "Atualmente, você recebe diretamente do cliente pelo método combinado (PIX, dinheiro, cartão). Configure os métodos aceitos no seu perfil. Em breve, teremos pagamento integrado pela plataforma." },
      { question: "Posso atender em outras cidades além de Trancoso?", answer: "Sim! No seu perfil, você pode definir o raio de atendimento. Isso ajuda clientes de cidades vizinhas a encontrarem você. Lembre-se de considerar custos de deslocamento no preço." },
      { question: "O que acontece se eu cancelar um serviço?", answer: "Cancelamentos afetam sua reputação. Se precisar cancelar, faça o mais rápido possível e explique o motivo ao cliente. Cancelamentos frequentes podem resultar em menor visibilidade na busca." },
    ]
  },
  tecnico: {
    title: <><Wrench className="w-5 h-5" /> Técnico</>,
    items: [
      { question: "Qual tecnologia a plataforma usa?", answer: "O aplicativo é construído sobre a plataforma Base44, usando React 18 para o frontend, Deno para funções de backend serverless, e um banco de dados NoSQL gerenciado com políticas de segurança em nível de linha (RLS)." },
      { question: "O app funciona bem com internet instável?", answer: "Sim! Implementamos várias otimizações: imagens são carregadas com lazy-loading e comprimidas, dados são cacheados localmente quando possível, e a interface mostra estados de carregamento claros. Em conexões lentas, priorize o uso do WiFi." },
      { question: "Como a segurança dos dados é garantida?", answer: "Seguimos padrões de segurança modernos: autenticação via OAuth 2.0, tokens JWT para sessões, políticas RLS no banco de dados, criptografia em trânsito (HTTPS), e conformidade com a LGPD. Dados sensíveis nunca são expostos no frontend." },
      { question: "A TryA aprende com minhas conversas?", answer: "Não. Para proteger sua privacidade, cada conversa é processada de forma isolada e não é usada para treinar modelos. Os dados da conversa são armazenados apenas para seu histórico pessoal e podem ser deletados a qualquer momento." },
      { question: "Quais navegadores são suportados?", answer: "O app funciona melhor em navegadores modernos: Chrome, Firefox, Safari e Edge nas versões mais recentes. No celular, recomendamos Chrome para Android e Safari para iOS. Internet Explorer não é suportado." },
      { question: "Posso usar o app no celular como se fosse um aplicativo?", answer: "Sim! O site é um PWA (Progressive Web App). No Chrome Android, toque no menu (⋮) e selecione 'Adicionar à tela inicial'. No Safari iOS, toque no ícone de compartilhar e 'Adicionar à Tela de Início'. O app ficará disponível como um ícone." },
      { question: "Como reportar um bug ou problema técnico?", answer: "Use o botão de suporte no canto inferior da tela, ou envie email para suporte com detalhes: qual página estava, o que tentou fazer, e prints de erro se houver. Quanto mais detalhes, mais rápido resolvemos." },
      { question: "O app coleta dados de localização?", answer: "Apenas quando você permite explicitamente, para mostrar prestadores próximos ou preencher endereços automaticamente. Você pode negar a permissão e inserir endereços manualmente. Não rastreamos sua localização em segundo plano." },
      { question: "Como os dados são backupados?", answer: "A infraestrutura Base44 realiza backups automáticos diários. Seus dados estão seguros em servidores redundantes. Em caso de problemas, podemos restaurar informações dos últimos 30 dias." },
    ]
  },
};


const ManualContent = ({ title, items }) => (
  <Card className="h-full border-none shadow-lg bg-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="pb-4 border-b border-border last:border-b-0">
            <h4 className="font-semibold text-foreground mb-1">{item.question}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

function ManualSEO() {
  useEffect(() => {
    document.title = "Manual e FAQ — Trancoso Resolve | Guia Completo da Plataforma";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Manual completo do Trancoso Resolve. Tire dúvidas sobre como contratar, cadastrar serviços, verificação de prestadores e muito mais.";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/Manual`;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/Manual`;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = 'Manual e FAQ — Trancoso Resolve | Guia Completo da Plataforma';

    const schemaId = 'schema-manual';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    const allFaqs = [
      ...faqContent.geral.items,
      ...faqContent.clientes.items,
      ...faqContent.prestadores.items,
    ];
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allFaqs.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer }
      }))
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);
  return null;
}

export default function ManualPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ManualSEO />
      <div className="flex items-center gap-4 mb-8">
        <BookOpen className="w-10 h-10 text-brand-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentação e Manuais</h1>
          <p className="text-muted-foreground">Encontre respostas para as perguntas mais comuns e guias sobre como usar a plataforma.</p>
        </div>
      </div>
      
      <Tabs defaultValue="geral" className="w-full">
        {/* Corrigido: Adicionada classe 'h-auto' para melhor ajuste em telas menores */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          {/* Corrigido: `focus-visible` para acessibilidade em abas */}
          <TabsTrigger value="geral" className="focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Geral</TabsTrigger>
          <TabsTrigger value="clientes" className="focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Clientes</TabsTrigger>
          <TabsTrigger value="prestadores" className="focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Prestadores</TabsTrigger>
          <TabsTrigger value="tecnico" className="focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Técnico</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="geral">
            <ManualContent title={faqContent.geral.title} items={faqContent.geral.items} />
          </TabsContent>
          <TabsContent value="clientes">
            <ManualContent title={faqContent.clientes.title} items={faqContent.clientes.items} />
          </TabsContent>
          <TabsContent value="prestadores">
            <ManualContent title={faqContent.prestadores.title} items={faqContent.prestadores.items} />
          </TabsContent>
          <TabsContent value="tecnico">
            <ManualContent title={faqContent.tecnico.title} items={faqContent.tecnico.items} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}