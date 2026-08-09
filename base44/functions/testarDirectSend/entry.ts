export default async function testarDirectSend(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const phoneNumberId = Deno.env.get("phone-number-id-whatsapp");
    
    if (!token || !phoneNumberId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    // Test 1: Try Direct Send with category=utility (text message)
    const directSendPayload = {
      messaging_product: "whatsapp",
      to: "5573999854625",
      type: "text",
      text: {
        body: "Teste Direct Send API - Trancoso Resolve. Se voce recebeu esta mensagem, a Direct Send API esta funcionando!",
        category: "utility"
      }
    };
    
    const directSendRes = await fetch("https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(directSendPayload)
    });
    
    const directSendData = await directSendRes.json();
    
    // Test 2: Try Direct Send with category=utility and a named template
    const namedPayload = {
      messaging_product: "whatsapp",
      to: "5573999854625",
      type: "text",
      text: {
        body: "Oi! Aqui e da Trancoso Resolve. Recebemos sua mensagem e estamos aqui pra te ajudar. Que tipo de servico voce precisa?",
        category: "utility",
        name: "trancoso_boas_vindas_direct"
      }
    };
    
    const namedRes = await fetch("https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(namedPayload)
    });
    
    const namedData = await namedRes.json();
    
    return new Response(JSON.stringify({
      success: true,
      test_1_basic_direct_send: {
        status: directSendRes.status,
        response: directSendData
      },
      test_2_named_direct_send: {
        status: namedRes.status,
        response: namedData
      }
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, headers: { "Content-Type": "application/json" } });
  }
}