import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = process.env['waba-id-whatsapp'];
  
  try {
    // 1. Get current subscribed apps for the WABA
    const subRes = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
    );
    const subData = await subRes.json();
    
    // 2. Try to get the WhatsApp phone numbers
    const phoneRes = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/phone_numbers?access_token=' + token
    );
    const phoneData = await phoneRes.json();
    
    return Response.json({
      subscriptions: subData,
      phoneNumbers: phoneData
    });
  } catch (err: any) {
    return Response.json({ error: String(err) });
  }
}
