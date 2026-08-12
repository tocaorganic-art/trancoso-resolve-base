export type WhatsAppTemplateComponent = {
  type: 'HEADER' | 'BODY' | 'FOOTER';
  format?: 'TEXT';
  text: string;
};

export type WhatsAppTemplate = {
  name: string;
  language: { code: 'pt_BR' };
  components: WhatsAppTemplateComponent[];
  variables: string[];
};

/**
 * Chaves internas mantêm nomes legíveis; `name` é o nome cadastrado na Meta.
 * O template oficial de boas-vindas é `trc_bem_vindo_lead` (Regra 1).
 */
export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  boas_vindas_lead: {
    name: 'trc_bem_vindo_lead',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Trancoso Resolve' },
      { type: 'BODY', text: 'Olá, {{1}}! Recebemos seu contato. Nossa equipe vai ajudar você a encontrar uma solução pertinho de você.' },
      { type: 'FOOTER', text: 'Quem resolve, pertinho de você.' },
    ],
    variables: ['nome'],
  },
  prestador_aprovado: {
    name: 'trc_prestador_aprovado',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Cadastro aprovado' },
      { type: 'BODY', text: 'Olá, {{1}}! Sua verificação foi aprovada. Acesse a Trancoso Resolve para completar seu perfil.' },
      { type: 'FOOTER', text: 'Trancoso Resolve' },
    ],
    variables: ['nome'],
  },
  prestador_rejeitado: {
    name: 'trc_prestador_rejeitado',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Atualização do cadastro' },
      { type: 'BODY', text: 'Olá, {{1}}. Sua verificação precisa de atenção. Motivo informado: {{2}}. Fale com o suporte para revisar os próximos passos.' },
      { type: 'FOOTER', text: 'Trancoso Resolve' },
    ],
    variables: ['nome', 'motivo'],
  },
  nova_solicitacao: {
    name: 'trc_nova_solicitacao',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Nova solicitação' },
      { type: 'BODY', text: 'Você recebeu uma nova solicitação de {{1}} para {{2}} em {{3}}. Acesse seu painel para responder.' },
      { type: 'FOOTER', text: 'Trancoso Resolve' },
    ],
    variables: ['cliente', 'servico', 'localidade'],
  },
  lembrete_resposta: {
    name: 'trc_lembrete_resposta',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Lembrete de atendimento' },
      { type: 'BODY', text: 'Ainda há uma solicitação de {{1}} aguardando sua resposta. Confira seu painel quando puder.' },
      { type: 'FOOTER', text: 'Trancoso Resolve' },
    ],
    variables: ['cliente'],
  },
  follow_up_lead: {
    name: 'trc_lead_confirmado',
    language: { code: 'pt_BR' },
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Podemos ajudar?' },
      { type: 'BODY', text: 'Olá, {{1}}! Estamos acompanhando sua solicitação de {{2}}. Responda esta mensagem para continuarmos.' },
      { type: 'FOOTER', text: 'Trancoso Resolve' },
    ],
    variables: ['nome', 'servico'],
  },
};

export function getWhatsAppTemplate(keyOrName: string): WhatsAppTemplate | undefined {
  return Object.values(WHATSAPP_TEMPLATES).find((template) => template.name === keyOrName)
    || WHATSAPP_TEMPLATES[keyOrName];
}
