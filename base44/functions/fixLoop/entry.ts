import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = '573485269177376';
  const appId = '908361385639766';
  
  // Unsubscribe the app from the WABA - this stops ALL webhook messages
  const unsubRes = await fetch(
    'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?app_id=' + appId + '&access_token=' + token,
    { method: 'DELETE' }
  );
  const unsubData = await unsubRes.json();
  
  // Verify the app was unsubscribed
  const verifyRes = await fetch(
    'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
  );
  const verifyData = await verifyRes.json();
  
  return Response.json({
    action: 'unsubscribe_app_from_waba',
    unsubscribe_result: unsubData,
    remaining_subscriptions: verifyData,
    instructions: 'To re-subscribe: POST /{wabaId}/subscribed_apps with { app_id: appId }'
  });
}
