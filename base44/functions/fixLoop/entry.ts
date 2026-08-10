import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const phoneId = process.env['phone-number-id-whatsapp'];
  const PROXY_URL = 'https://untitled-copy-19211408.base44.app/functions/whatsappProxy';
  
  const results: any = {};
  
  // Try different field names
  const attempts = [
    { webhook_configuration: { url: PROXY_URL } },
    { webhook_configuration: { callback_url: PROXY_URL } },
    { webhook_configuration: { endpoint: PROXY_URL } },
    { webhook_configuration: { target: PROXY_URL } },
    { webhook_configuration: { webhook_url: PROXY_URL } },
    { webhook_configuration: PROXY_URL }
  ];
  
  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await fetch(
        'https://graph.facebook.com/v20.0/' + phoneId + '?access_token=' + token,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempts[i])
        }
      );
      const data = await res.json();
      results['attempt_' + i] = data;
      if (data.success) {
        results['working_attempt'] = i;
        results['working_body'] = attempts[i];
        break;
      }
    } catch (err: any) {
      results['attempt_' + i + '_error'] = String(err);
    }
  }
  
  // Also try to unsubscribe the app from WABA (last resort)
  const unsubRes = await fetch(
    'https://graph.facebook.com/v20.0/573485269177376/subscribed_apps/908361385639766?access_token=' + token,
    { method: 'DELETE' }
  );
  results['unsubscribe_attempt'] = await unsubRes.json();
  
  return Response.json(results);
}
