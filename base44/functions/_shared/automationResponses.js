// Conteúdo aprovado em 2026-08-26 a partir das páginas ComoFunciona e Planos.
// Atualizar este arquivo quando essas páginas mudarem; não é uma leitura dinâmica do site.
export const AUTOMATION_CONTENT_VERSION = '2026-08-26';

const SITE_URL = 'https://trancosoresolve.com.br';

export function normalizeAutomationText(value) {
  return typeof value === 'string'
    ? value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    : '';
}

export function getAutomationReply(message) {
  const text = normalizeAutomationText(message);

  if (text.includes('cadastro') || text.includes('prestador')) {
    return {
      intent: 'prestador',
      text: `Para se cadastrar como prestador, acesse ${SITE_URL}/SejaPrestador, crie sua conta e complete os dados, serviços, fotos e preços. O perfil fica disponível após a verificação.`,
    };
  }

  if (text.includes('como funciona') || text.includes('como contratar') || text.includes('como contrato')) {
    return {
      intent: 'como_funciona',
      text: `Como funciona:\n1. Encontre o serviço por categoria ou busca.\n2. Escolha o prestador e envie sua solicitação.\n3. Combine os detalhes diretamente com o prestador.\n\nSaiba mais em ${SITE_URL}/ComoFunciona.`,
    };
  }

  if (text.includes('preco') || text.includes('plano') || text.includes('valor') || text.includes('quanto custa')) {
    return {
      intent: 'planos',
      text: `Para clientes, o uso da plataforma é gratuito e o valor do serviço é combinado diretamente com o prestador. Para prestadores e lojistas, os planos e condições vigentes estão em ${SITE_URL}/Planos.`,
    };
  }

  if (text.includes('cliente') || text.includes('contratar') || text.includes('servico') || text.includes('pousada') || text.includes('villa')) {
    return {
      intent: 'cliente',
      text: `Para solicitar um serviço, acesse ${SITE_URL}, pesquise por categoria, escolha um prestador e envie sua solicitação. O pagamento e os detalhes são combinados diretamente com o prestador.`,
    };
  }

  return {
    intent: 'geral',
    text: 'Olá! Recebemos sua mensagem. Escreva se precisa contratar um serviço, cadastrar-se como prestador ou consultar planos, e enviaremos a orientação correspondente.',
  };
}
