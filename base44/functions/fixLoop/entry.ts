import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = '573485269177376';
  const CTWA_APP_ID = '4010281385957546';
  
  // Unsubscribe the CTWA app too
  const unsubRes = await fetch(
    'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?app_id=' + CTWA_APP_ID + '&access_token=' + token,
    { method: 'DELETE' }
  );
  const unsubData = await unsubRes.json();
  
  // Verify no apps are subscribed anymore
  const verifyRes = await fetch(
    'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
  );
  const verifyData = await verifyRes.json();
  
  return Response.json({
    action: 'unsubscribe_CTWA_app',
    unsubscribe_result: unsubData,
    remaining_subscriptions: verifyData
  });
}
