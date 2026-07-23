import { useEffect } from 'react';

export default function PoliticaDevolucoes() {
  useEffect(() => {
    document.title = 'Política de Devoluções e Reembolsos - Trancoso Resolve';
    const meta = document.querySelector('meta[name="description"]') || 
                 (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    meta.content = 'Política de Devoluções, Reembolsos e Garantia da Trancoso Resolve.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Devoluções e Reembolsos</h1>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">1. Escopo</h2>
          <p>
            Esta política se aplica a todos os serviços contratados através da Plataforma Trancoso Resolve, incluindo serviços pontuais e assinaturas de planos.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">2. Prazo de Arrependimento</h2>
          <p>
            De acordo com o Código de Defesa do Consumidor, você tem o direito de desistir da contratação de um serviço em até <strong>7 (sete) dias</strong> após a confirmação da compra ou data de execução do serviço, o que for menor.
          </p>
          <p className="text-sm text-muted-foreground">
            Nota: Este direito não se aplica quando o serviço já foi totalmente executado a seu pedido.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">3. Condições para Reembolso</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Serviço não executado ou cancelado antes da execução</li>
            <li>Defeito ou falha na execução do serviço (responsabilidade do prestador)</li>
            <li>Não conformidade com a descrição anunciada</li>
            <li>Cancelamento de assinatura dentro do período de garantia (primeiro mês)</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">4. Exceções ao Reembolso</h2>
          <p>Reembolsos não serão concedidos em caso de:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Serviço totalmente executado conforme solicitado e aceito pelo cliente</li>
            <li>Desistência após o serviço ter sido iniciado (sem defeito)</li>
            <li>Indisponibilidade do prestador devido a motivo de força maior</li>
            <li>Cancelamento de assinatura após o primeiro mês de vigência</li>
            <li>Pagamentos em atraso ou taxas administrativas já processadas</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">5. Processo de Solicitação</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Entre em contato com nosso suporte em <strong>suporte@trancosoresolve.com</strong> com detalhes do motivo</li>
            <li>Forneça documentação do problema (fotos, mensagens de erro, etc.)</li>
            <li>Nossa equipe analisará sua solicitação em até <strong>5 dias úteis</strong></li>
            <li>Se aprovado, o reembolso será processado em até <strong>30 dias úteis</strong> na conta original</li>
          </ol>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">6. Cancelamento de Assinaturas</h2>
          <p>
            Assinaturas podem ser canceladas a qualquer momento na seção "Minha Conta" &gt; "Assinaturas". O cancelamento terá efeito no final do período de cobrança atual.
          </p>
          <p className="mt-4">
            Se desejar um reembolso proporcional no primeiro mês, contate nosso suporte com a solicitação.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">7. Prazos de Processamento</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Análise:</strong> até 5 dias úteis</li>
            <li><strong>Aprovação/Rejeição:</strong> Notificação por e-mail</li>
            <li><strong>Reembolso:</strong> até 30 dias úteis (depende da instituição bancária)</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">8. Garantia de Satisfação</h2>
          <p>
            Para assinaturas de planos, oferecemos uma <strong>garantia de satisfação de 30 dias</strong>. Se não estiver satisfeito, você poderá solicitar um reembolso integral dentro deste período.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">9. Disputas com Prestadores</h2>
          <p>
            Em caso de desacordo sobre a qualidade do serviço, ambas as partes podem submeter uma disputa através da plataforma. Nossa equipe agirá como mediadora no processo.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">10. Contato</h2>
          <p>
            Para solicitações de reembolso ou dúvidas: <strong>suporte@trancosoresolve.com</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-4">Última atualização: 16 de maio de 2026</p>
        </section>
      </div>
    </div>
  );
}