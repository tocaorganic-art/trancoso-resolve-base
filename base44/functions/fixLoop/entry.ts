import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = process.env['waba-id-whatsapp'];
  const phoneId = process.env['phone-number-id-whatsapp'];
  
  return Response.json({
    hasToken: !!token,
    tokenLen: token ? token.length : 0,
    tokenPrefix: token ? token.substring(0, 10) : 'none',
    wabaId: wabaId || 'none',
    phoneId: phoneId || 'none'
  });
}
