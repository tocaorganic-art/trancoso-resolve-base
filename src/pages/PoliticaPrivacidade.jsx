import { useEffect } from 'react';

export default function PoliticaPrivacidade() {
  useEffect(() => {
    document.title = 'Política de Privacidade - Trancoso Resolve';
    const meta = document.querySelector('meta[name="description"]') || 
                 (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    meta.content = 'Política de Privacidade e Proteção de Dados da Trancoso Resolve. LGPD em conformidade.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">1. Introdução</h2>
          <p>
            A Trancoso Resolve ("Plataforma") respeita sua privacidade e está comprometida com a proteção de seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">2. Dados Coletados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informações de cadastro: nome, e-mail, telefone, endereço</li>
            <li>Documentos de identificação (CPF, RG) para verificação</li>
            <li>Dados de pagamento (via Stripe - nunca armazenados diretamente)</li>
            <li>Dados de navegação e uso da plataforma (via Google Analytics)</li>
            <li>Comunicações e mensagens entre usuários</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">3. Finalidade do Tratamento</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Criar e gerenciar sua conta</li>
            <li>Processar pagamentos e assinaturas</li>
            <li>Verificação de identidade (verificação de antecedentes)</li>
            <li>Melhorar a experiência do usuário</li>
            <li>Conformidade legal e combate ao abuso</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">4. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia HTTPS em trânsito. Documentos de identificação são armazenados em buckets privados com acesso restrito. Mensagens de pagamento são processadas via Stripe e nunca armazenadas em nossos servidores.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">5. Direitos do Usuário (LGPD)</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Acesso:</strong> Direito de acessar seus dados pessoais</li>
            <li><strong>Correção:</strong> Direito de corrigir dados imprecisos</li>
            <li><strong>Exclusão:</strong> Direito ao "direito ao esquecimento"</li>
            <li><strong>Portabilidade:</strong> Direito de receber dados em formato estruturado</li>
            <li><strong>Revogação:</strong> Direito de revogar consentimento</li>
          </ul>
          <p className="mt-4">Para exercer esses direitos, contacte: <strong>privacidade@trancosoresolve.com</strong></p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">6. Retenção de Dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, dados são retidos conforme exigências legais (ex: 5 anos para registros financeiros).
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">7. Cookies</h2>
          <p>
            Usamos cookies para análise de tráfego (Google Analytics) e funcionalidade da plataforma. Você pode aceitar ou rejeitar cookies no banner de consentimento exibido ao acessar o site.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">8. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A data da última atualização é mostrada abaixo.
          </p>
          <p className="text-sm text-muted-foreground">Última atualização: 12 de maio de 2026</p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">9. Contato</h2>
          <p>
            Para dúvidas sobre privacidade: <strong>privacidade@trancosoresolve.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}