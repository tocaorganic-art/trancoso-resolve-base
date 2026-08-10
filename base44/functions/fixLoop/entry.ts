import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const phoneId = process.env['phone-number-id-whatsapp'];
  const PROXY_URL = 'https://untitled-copy-19211408.base44.app/functions/whatsappProxy';
  
  try {
    // Try to update the webhook configuration for the phone number
    // Method 1: POST to phone number endpoint with webhook_configuration
    const updateRes = await fetch(
      'https://graph.facebook.com/v20.0/' + phoneId,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_configuration: { application: PROXY_URL }
        })
      }
    );
    const updateData = await updateRes.json();
    
    // Also try with the access_token as query param
    const updateRes2 = await fetch(
      'https://graph.facebook.com/v20.0/' + phoneId + '?access_token=' + token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_configuration: { application: PROXY_URL }
        })
      }
    );
    const updateData2 = await updateRes2.json();
    
    // Verify the current webhook config
    const verifyRes = await fetch(
      'https://graph.facebook.com/v20.0/' + phoneId + '?fields=webhook_configuration&access_token=' + token
    );
    const verifyData = await verifyRes.json();
    
    return Response.json({
      updateMethod1: updateData,
      updateMethod2: updateData2,
      currentWebhook: verifyData
    });
  } catch (err: any) {
    return Response.json({ error: String(err) });
  }
}
