import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function sha256Hash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const pixelId = '1469130194903035';
    const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
    const testEventCode = 'TEST67488';

    if (!accessToken) {
      return Response.json(
        { error: 'META_CONVERSIONS_API_TOKEN not configured' },
        { status: 400 }
      );
    }

    const emHash = await sha256Hash('test@example.com');
    const phHash = await sha256Hash('1234567890');

    const testEventData = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_id: `test_${Date.now()}`,
          user_data: {
            em: emHash,
            ph: phHash
          }
        }
      ],
      test_event_code: testEventCode
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testEventData,
          access_token: accessToken
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: result.error || 'Failed to send test event' },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      message: 'Test event sent successfully',
      testEventCode: testEventCode,
      facebookResponse: result,
      instruction: 'Verifique no Meta Events Manager se o evento apareceu em "Testar Eventos"'
    });

  } catch (error) {
    console.error('Test Meta Conversion Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});