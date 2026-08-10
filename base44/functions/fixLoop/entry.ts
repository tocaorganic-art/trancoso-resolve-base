import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = '573485269177376';
  const appId = '908361385639766';
  
  // Check current subscriptions
  const subRes = await fetch(
    'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
  );
  const subData = await subRes.json();
  
  // Check if TR app is in the list
  const isSubscribed = subData.data?.some((s: any) => 
    s.whatsapp_business_api_data?.id === appId
  );
  
  // If still subscribed, unsubscribe again
  let unsubResult = null;
  if (isSubscribed) {
    const unsubRes = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?app_id=' + appId + '&access_token=' + token,
      { method: 'DELETE' }
    );
    unsubResult = await unsubRes.json();
  }
  
  // Also check the webhook endpoint directly
  const webhookRes = await fetch(
    'https://trancoso-resolve-app.base44.app/functions/whatsappWebhook',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '5573998283579',
                id: 'test123',
                text: { body: 'test' }
              }],
              contacts: [{ profile: { name: 'Test' } }]
            }
          }]
        }]
      })
    }
  );
  const webhookData = await webhookRes.json();
  
  return Response.json({
    currentSubscriptions: subData,
    isTRSubscribed: isSubscribed,
    unsubscribeResult: unsubResult,
    webhookTest: webhookData
  });
}
