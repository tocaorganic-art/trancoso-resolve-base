import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env['token-id-whatsapp'];
  const wabaId = '573485269177376';
  const appId = '908361385639766';
  const results: any = {};
  
  // Try 1: DELETE with app_id as query param
  try {
    const res1 = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?app_id=' + appId + '&access_token=' + token,
      { method: 'DELETE' }
    );
    results['delete_query_param'] = await res1.json();
  } catch (err: any) {
    results['delete_query_param_error'] = String(err);
  }
  
  // Try 2: POST to subscribed_apps with delete flag
  try {
    const res2 = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId })
      }
    );
    results['post_subscribe'] = await res2.json();
  } catch (err: any) {
    results['post_subscribe_error'] = String(err);
  }
  
  // Check current subscriptions after changes
  try {
    const res3 = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
    );
    results['current_subs'] = await res3.json();
  } catch (err: any) {
    results['current_subs_error'] = String(err);
  }
  
  return Response.json(results);
}
