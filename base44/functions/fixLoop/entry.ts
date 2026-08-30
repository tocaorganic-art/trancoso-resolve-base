import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env["token-id-whatsapp"];
  const wabaId = process.env["waba-id-whatsapp"];
  const appId = process.env["meta-app-id-whatsapp"];
  if (!token || !wabaId || !appId) {
    return Response.json({ error: "Configuração ausente: defina token-id-whatsapp, waba-id-whatsapp e meta-app-id-whatsapp." }, { status: 500 });
  }
  const subRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/subscribed_apps?access_token=" + token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app_id: appId }) });
  const subData = await subRes.json();
  const verifyRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/subscribed_apps?access_token=" + token);
  const verifyData = await verifyRes.json();
  return Response.json({ action: "resubscribe", result: subData, subscriptions: verifyData });
}