export default async function fixLoop(req: any) {
  try {
    const token = process.env['token-id-whatsapp'];
    const wabaId = process.env['waba-id-whatsapp'];
    const phoneId = process.env['phone-number-id-whatsapp'];
    
    if (!token || !wabaId) {
      return { error: 'Missing secrets', hasToken: !!token, hasWaba: !!wabaId, hasPhone: !!phoneId };
    }
    
    // Get current webhook subscriptions for the WABA
    const subResponse = await fetch(
      'https://graph.facebook.com/v20.0/' + wabaId + '/subscribed_apps?access_token=' + token
    );
    const subData = await subResponse.json();
    
    return {
      tokenPrefix: token.substring(0, 15) + '...',
      wabaId,
      phoneId,
      subscriptions: subData
    };
  } catch (err) {
    return { error: String(err) };
  }
}
