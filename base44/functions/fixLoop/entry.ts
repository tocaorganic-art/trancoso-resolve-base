export default async function fixLoop(req: any) {
  const token = process.env['token-id-whatsapp'];
  const wabaId = process.env['waba-id-whatsapp'];
  const phoneId = process.env['phone-number-id-whatsapp'];
  
  return {
    hasToken: !!token,
    tokenLen: token ? token.length : 0,
    tokenPrefix: token ? token.substring(0, 10) : 'none',
    wabaId: wabaId || 'none',
    phoneId: phoneId || 'none'
  };
}
