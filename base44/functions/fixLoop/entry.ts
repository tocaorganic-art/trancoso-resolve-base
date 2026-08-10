import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function fixLoop(req: Request): Promise<Response> {
  const token = process.env["token-id-whatsapp"];
  const wabaId = "573485269177376";
  const appId = "908361385639766";
  
  const subRes = await fetch(
    "https://graph.facebook.com/v20.0/" + wabaId + "/subscribed_apps?access_token=" + token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId })
    }
  );
  const subData = await subRes.json();
  
  const verifyRes = await fetch(
    "https://graph.facebook.com/v20.0/" + wabaId + "/subscribed_apps?access_token=" + token
  );
  const verifyData = await verifyRes.json();
  
  return Response.json({
    action: "resubscribe",
    result: subData,
    subscriptions: verifyData
  });
}
