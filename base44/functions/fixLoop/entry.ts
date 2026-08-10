import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const APP_ID = '908361385639766';
  const PROXY_URL = 'https://untitled-copy-19211408.base44.app/functions/whatsappProxy';
  const VERIFY_TOKEN = 'trancoso_resolve_2026';
  
  try {
    // 1. Get current app subscriptions
    const getRes = await fetch(
      'https://graph.facebook.com/v20.0/' + APP_ID + '/subscriptions?access_token=' + token
    );
    const getData = await getRes.json();
    
    // 2. Try to update the callback_url via POST
    const formData = new URLSearchParams();
    formData.append('callback_url', PROXY_URL);
    formData.append('verify_token', VERIFY_TOKEN);
    formData.append('object', 'whatsapp_business_account');
    formData.append('fields', 'messages');
    
    const postRes = await fetch(
      'https://graph.facebook.com/v20.0/' + APP_ID + '/subscriptions?access_token=' + token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }
    );
    const postData = await postRes.json();
    
    return Response.json({
      currentSubscriptions: getData,
      updateResult: postData
    });
  } catch (err: any) {
    return Response.json({ error: String(err) });
  }
}
