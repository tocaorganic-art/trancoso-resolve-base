// ASSINATURA INSTITUCIONAL — TRANCOSO RESOLVE (v2 — refinada com ícones oficiais)
// Componente compartilhado para emails transacionais.
// Compatível com Gmail, Outlook, Apple Mail, iPhone, Android e webmail.

export const TRANCOSO_RESOLVE_INSTITUTIONAL = {
  brandName: "Trancoso Resolve",
  tagline: "Conectando pessoas, serviços e negócios locais.",
  region: "Costa do Descobrimento",
  localities: "Trancoso • Arraial d'Ajuda • Porto Seguro • Caraíva",
  site: "https://trancosoresolve.com.br",
  siteLabel: "trancosoresolve.com.br",
  whatsapp: "https://wa.me/5573998283579",
  whatsappLabel: "+55 73 99828-3579",
  instagram: "https://www.instagram.com/trancosoresolve/",
  instagramLabel: "@trancosoresolve",
  facebook: "https://www.facebook.com/share/1B7w8mmbMN/",
  facebookLabel: "Facebook",
  email: "contato@trancosoresolve.com.br",
  privacyUrl: "https://trancosoresolve.com.br/PoliticaPrivacidade",
  termsUrl: "https://trancosoresolve.com.br/TermosDeServico",
  logoUrl: "https://trancosoresolve.com.br/brand/logo-mark-512.png",
  logoWidth: 160,
  logoAlt: "Trancoso Resolve",
} as const;

const ICON = {
  globe: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#F26A21" stroke-width="1.8"/><path d="M2 12h20M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10c-2.5-2.5-4-6-4-10s1.5-7.5 4-10z" stroke="#F26A21" stroke-width="1.8"/></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F26A21" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  email: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="#F26A21" stroke-width="1.8"/><path d="M3 6l9 7 9-7" stroke="#F26A21" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#F26A21" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" stroke="#F26A21" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="#F26A21"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F26A21" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" stroke="#999999" stroke-width="1.5"/></svg>`,
} as const;

export function renderTrancosoResolveEmailSignatureHtml(): string {
  const d = TRANCOSO_RESOLVE_INSTITUTIONAL;
  return [
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">',
    '  <tr><td style="border-top:2px solid #E3DED5;padding-top:28px;">',
    '    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:Arial,Helvetica,sans-serif;">',
    '      <tr><td style="padding-bottom:20px;">',
    `        <img src="${d.logoUrl}" alt="${d.logoAlt}" width="${d.logoWidth}" style="width:${d.logoWidth}px;height:auto;border:0;outline:none;text-decoration:none;display:block;margin-bottom:16px;" />`,
    `        <p style="margin:0;font-size:20px;font-weight:bold;color:#20382C;letter-spacing:-0.3px;line-height:1.3;">${d.brandName}</p>`,
    `        <p style="margin:4px 0 0 0;font-size:14px;color:#666666;line-height:1.5;">${d.tagline}</p>`,
    '      </td></tr>',
    '      <tr><td style="padding:16px 0;border-top:1px solid #F5F5F5;">',
    `        <p style="margin:0;font-size:13px;color:#20382C;font-weight:600;line-height:1.4;">${d.region}</p>`,
    `        <p style="margin:4px 0 0 0;font-size:12px;color:#999999;line-height:1.5;">${d.localities}</p>`,
    '      </td></tr>',
    '      <tr><td style="padding:16px 0;border-top:1px solid #F5F5F5;">',
    '        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">',
    `          <tr><td style="padding:5px 0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:10px;">${ICON.globe}</td><td style="vertical-align:middle;"><a href="${d.site}" style="font-size:13px;color:#333333;text-decoration:none;">${d.siteLabel}</a></td></tr></table></td></tr>`,
    `          <tr><td style="padding:5px 0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:10px;">${ICON.whatsapp}</td><td style="vertical-align:middle;"><a href="${d.whatsapp}" style="font-size:13px;color:#333333;text-decoration:none;">WhatsApp: ${d.whatsappLabel}</a></td></tr></table></td></tr>`,
    `          <tr><td style="padding:5px 0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:10px;">${ICON.email}</td><td style="vertical-align:middle;"><a href="mailto:${d.email}" style="font-size:13px;color:#333333;text-decoration:none;">${d.email}</a></td></tr></table></td></tr>`,
    `          <tr><td style="padding:5px 0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:10px;">${ICON.instagram}</td><td style="vertical-align:middle;"><a href="${d.instagram}" style="font-size:13px;color:#333333;text-decoration:none;">Instagram: ${d.instagramLabel}</a></td></tr></table></td></tr>`,
    `          <tr><td style="padding:5px 0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:10px;">${ICON.facebook}</td><td style="vertical-align:middle;"><a href="${d.facebook}" style="font-size:13px;color:#333333;text-decoration:none;">${d.facebookLabel}</a></td></tr></table></td></tr>`,
    '        </table>',
    '      </td></tr>',
    '      <tr><td style="padding:14px 0;border-top:1px solid #F5F5F5;">',
    `        <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;"><a href="${d.privacyUrl}" style="color:#999999;text-decoration:underline;">Política de Privacidade</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="${d.termsUrl}" style="color:#999999;text-decoration:underline;">Termos de Uso</a></p>`,
    '      </td></tr>',
    '      <tr><td style="padding:16px 0 0 0;border-top:1px solid #F5F5F5;">',
    `        <p style="margin:0 0 6px 0;font-size:11px;color:#AAAAAA;line-height:1.6;">Você recebeu este email porque enviou seu interesse por meio da Trancoso Resolve.</p>`,
    `        <p style="margin:0;font-size:11px;color:#AAAAAA;line-height:1.6;">Este email confirma apenas o recebimento das informações enviadas. Ele não representa aprovação, contratação, verificação ou garantia de participação.</p>`,
    '      </td></tr>',
    '    </table>',
    '  </td></tr>',
    '</table>',
  ].join("");
}

export function renderTrancosoResolveEmailSignatureText(): string {
  const d = TRANCOSO_RESOLVE_INSTITUTIONAL;
  return [
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "TRANCOSO RESOLVE",
    d.tagline,
    "",
    d.region,
    d.localities,
    "",
    "CONTATOS",
    `Site:        ${d.site}`,
    `WhatsApp:    ${d.whatsappLabel}`,
    `Email:       ${d.email}`,
    `Instagram:   ${d.instagramLabel}`,
    `Facebook:    ${d.facebook}`,
    "",
    "LINKS INSTITUCIONAIS",
    `Política de Privacidade: ${d.privacyUrl}`,
    `Termos de Uso:          ${d.termsUrl}`,
    "",
    "AVISOS",
    "Você recebeu este email porque enviou seu interesse por meio da Trancoso Resolve.",
    "Este email confirma apenas o recebimento das informações enviadas. Ele não representa aprovação, contratação, verificação ou garantia de participação.",
    "",
  ].join("\n");
}