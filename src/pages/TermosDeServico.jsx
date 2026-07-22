import { useEffect } from 'react';

export default function TermosDeServico() {
  useEffect(() => {
    document.title = 'Termos de Serviço - Trancoso Resolve';
    const meta = document.querySelector('meta[name="description"]') || 
                 (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    meta.content = 'Termos e Condições de Uso da Plataforma Trancoso Resolve.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar a Plataforma Trancoso Resolve, você concorda em estar vinculado por estes Termos de Serviço. Se não concordar com qualquer parte destes termos, você não está autorizado a usar a plataforma.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">2. Descrição do Serviço</h2>
          <p>
            A Trancoso Resolve é uma plataforma digital que conecta clientes com prestadores de serviços verificados em Trancoso, Bahia. Oferecemos serviços nas categorias de limpeza, reparos, jardinagem, culinária e outros serviços especializados.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">3. Registros e Contas</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Você deve ter pelo menos 18 anos para usar a plataforma</li>
            <li>As informações de registro devem ser precisas e atualizadas</li>
            <li>Você é responsável pela confidencialidade de sua senha</li>
            <li>Você concorda em notificar imediatamente sobre atividades não autorizadas</li>
            <li>Contas não podem ser transferidas ou vendidas a terceiros</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">4. Pagamentos e Preços</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Preços podem ser alterados sem aviso prévio</li>
            <li>Todos os preços são em Real (BRL)</li>
            <li>Pagamentos são processados via Mercado Pago de forma segura</li>
            <li>Refúndos seguem nossa Política de Devoluções</li>
            <li>Cobranças recorrentes podem ser canceladas a qualquer momento</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">5. Conduta do Usuário</h2>
          <p>Você concorda em não:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usar a plataforma para fins ilegais ou prejudiciais</li>
            <li>Compartilhar informações falsas ou enganosas</li>
            <li>Assediar, ameaçar ou discriminar outros usuários</li>
            <li>Violar direitos de propriedade intelectual</li>
            <li>Tentar contornar mecanismos de segurança</li>
            <li>Fazer contacto direto com prestadores para contornar a plataforma</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">6. Responsabilidades dos Clientes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer informações de local e horário precisas</li>
            <li>Estar presente ou disponível no horário agendado</li>
            <li>Verificar perfis e avaliações dos prestadores antes de contratar</li>
            <li>Reportar comportamentos inadequados ao suporte</li>
            <li>Cumprir acordo sobre cancelamentos com aviso prévio</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">7. Responsabilidades dos Prestadores</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Executar serviços conforme descrito e acordado</li>
            <li>Manter profissionalismo e cortesia</li>
            <li>Cumprir horários combinados</li>
            <li>Notificar clientes sobre cancelamentos com antecedência</li>
            <li>Respeitar privacidade e segurança do cliente</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">8. Verificação e Segurança</h2>
          <p>
            Todos os prestadores são submetidos a verificações de identidade e antecedentes. A Trancoso Resolve não garante a honestidade, integridade ou comportamento de nenhum usuário, mas se compromete a investigar comportamentos suspeitos.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">9. Limitação de Responsabilidade</h2>
          <p>
            A plataforma é fornecida "como está". A Trancoso Resolve não é responsável por danos indiretos, incidentais, especiais ou consequentes resultantes do uso da plataforma. Sua responsabilidade máxima não excede o valor pago pelos serviços.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">10. Avaliações e Comentários</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Avaliações devem ser precisas e baseadas em experiência real</li>
            <li>Não são permitidas avaliações falsas ou vingativas</li>
            <li>A Trancoso Resolve pode remover avaliações violadoras</li>
            <li>Usuários aceitam que avaliações são públicas</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">11. Propriedade Intelectual</h2>
          <p>
            Todo conteúdo da plataforma (textos, imagens, logotipos) é propriedade da Trancoso Resolve. Você concorda em não reproduzir, distribuir ou usar sem permissão explícita.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">12. Suspensão e Encerramento</h2>
          <p>
            Reservamos o direito de suspender ou encerrar sua conta se você violar estes termos. Encerramento pode resultar na perda de acesso aos serviços e retenção de fundos pendentes.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">13. Resolução de Disputas</h2>
          <p>
            Disputas serão primeiro submetidas à mediação pela equipe de suporte. Se não resolvida em 15 dias, as partes poderão buscar arbitragem ou ação legal conforme aplicável.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">14. Modificações dos Termos</h2>
          <p>
            A Trancoso Resolve pode modificar estes termos a qualquer momento. Alterações substanciais serão comunicadas por e-mail. O uso continuado da plataforma constitui aceitação das alterações.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">15. Lei Aplicável</h2>
          <p>
            Estes Termos de Serviço são regidos pelas leis da República Federativa do Brasil, especificamente pelas leis do Estado da Bahia.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">16. Contato</h2>
          <p>
            Para dúvidas sobre estes termos: <strong>suporte@trancosoresolve.com</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-4">Última atualização: 16 de maio de 2026</p>
        </section>
      </div>
    </div>
  );
}