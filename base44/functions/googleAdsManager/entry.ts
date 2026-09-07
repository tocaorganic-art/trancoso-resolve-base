import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// ─── googleAdsManager ─────────────────────────────────────────────────────────
// Consulta e gerencia a conta Google Ads 714-209-2343 (campanha Performance Max
// ID 24222579748) via conector 'googleads' do app.
//
// Contrato: POST { "action": "<nome>", "params": { ... } }
// Resposta: { "ok": true, "data": ... } | { "ok": false, "error": {...crus...} }
//
// Ações:
// - overview       (read-only): campanhas, asset groups e conversion actions
// - list_assets    (read-only): assets do asset group da campanha
// - add_videos                 : cria assets YOUTUBE_VIDEO e vincula ao asset group
// - conversion_tag             : busca/cria conversão STANDARD_LEAD + tag do Google
//
// Nenhuma ação altera orçamento, lances, status ou qualquer campo da campanha.

const GA_VERSION = "v24";
const CAMPAIGN_ID = "24222579748";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}) as { action?: string; params?: Record<string, any> });
    const action = body.action;
    const params = body.params || {};

    // Conector Google Ads: developer_token e customer_id vêm do connectionConfig
    const { accessToken, connectionConfig } = await base44.asServiceRole.connectors.getConnection('googleads');
    const developerToken = (connectionConfig as any)?.developer_token;
    const customerId = String((connectionConfig as any)?.customer_id || '').replace(/\D/g, '');
    if (!developerToken || !customerId) {
      return Response.json({ ok: false, error: { message: 'Google Ads connection missing developer_token or customer_id.' } });
    }

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    };
    // Conta regular (não MCC): nunca enviar login-customer-id
    const apiBase = `https://googleads.googleapis.com/${GA_VERSION}/customers/${customerId}`;

    // POST na API Google Ads; em erro devolve os detalhes crus (status, request-id, body)
    const gaPost = async (path: string, payload: any): Promise<any> => {
      const res = await fetch(apiBase + path, { method: "POST", headers, body: JSON.stringify(payload) });
      const text = await res.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = { raw_body: text }; }
      if (!res.ok) {
        return {
          __gaError: true,
          error: {
            http_status: res.status,
            request_id: res.headers.get("request-id"),
            body: parsed,
          },
        };
      }
      return parsed;
    };

    const gaFail = (err: any, stage: string) =>
      Response.json({ ok: false, error: { stage, ...(err || {}) } });

    // ── 1. overview (read-only) ────────────────────────────────────────────────
    if (action === "overview") {
      const campaignQuery = "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign_budget.amount_micros, campaign.start_date FROM campaign";
      const assetGroupQuery = `SELECT asset_group.id, asset_group.name, asset_group.status, asset_group.resource_name FROM asset_group WHERE campaign.id = ${CAMPAIGN_ID}`;
      const conversionQuery = "SELECT conversion_action.resource_name, conversion_action.name, conversion_action.status, conversion_action.type, conversion_action.category, conversion_action.primary_for_goal, conversion_action.counting, conversion_action.value_settings, conversion_action.google_tag_settings FROM conversion_action";

      const campaigns = await gaPost("/googleAds:search", { query: campaignQuery });
      if (campaigns.__gaError) return gaFail(campaigns.error, "search campaigns");
      const assetGroups = await gaPost("/googleAds:search", { query: assetGroupQuery });
      if (assetGroups.__gaError) return gaFail(assetGroups.error, "search asset_groups");
      const conversionActions = await gaPost("/googleAds:search", { query: conversionQuery });
      if (conversionActions.__gaError) return gaFail(conversionActions.error, "search conversion_actions");

      return Response.json({
        ok: true,
        data: { campaigns, asset_groups: assetGroups, conversion_actions: conversionActions },
      });
    }

    // ── 2. list_assets (read-only) ─────────────────────────────────────────────
    if (action === "list_assets") {
      const query = `SELECT asset_group_asset.asset_group, asset_group_asset.asset, asset_group_asset.field_type, asset_group_asset.status, asset.resource_name, asset.name, asset.type, asset.text_asset.text, asset.youtube_video_asset.youtube_video_id, asset.youtube_video_asset.youtube_video_title, asset.image_asset.file_size, asset.long_headline_asset.headline_text, asset.headline_asset.headline_text, asset.description_asset.description_text FROM asset_group_asset WHERE campaign.id = ${CAMPAIGN_ID}`;
      const result = await gaPost("/googleAds:search", { query });
      if (result.__gaError) return gaFail(result.error, "search asset_group_asset");
      return Response.json({ ok: true, data: result });
    }

    // ── 3. add_videos ─────────────────────────────────────────────────────────
    if (action === "add_videos") {
      const videos = params.videos;
      const assetGroupResourceName = params.asset_group_resource_name;
      if (!Array.isArray(videos) || videos.length === 0) {
        return Response.json({ ok: false, error: { message: "params.videos deve ser um array não vazio [{ youtube_id, title }]" } });
      }
      if (!assetGroupResourceName) {
        return Response.json({ ok: false, error: { message: "params.asset_group_resource_name é obrigatório (customers/<cid>/assetGroups/<id>)" } });
      }

      const created: any[] = [];
      for (const video of videos) {
        if (!video?.youtube_id || !video?.title) {
          return Response.json({ ok: false, error: { message: "Cada vídeo precisa de youtube_id e title" } });
        }
        // a) cria o asset YOUTUBE_VIDEO
        const assetRes = await gaPost("/assets:mutate", {
          operations: [{
            create: {
              youtube_video_asset: {
                youtube_video_id: video.youtube_id,
                youtube_video_title: video.title,
              },
            },
          }],
        });
        if (assetRes.__gaError) return gaFail(assetRes.error, `assets:mutate (youtube_id=${video.youtube_id})`);
        const assetResourceName = assetRes?.results?.[0]?.resourceValue || assetRes?.results?.[0]?.resourceName;
        if (!assetResourceName) {
          return Response.json({ ok: false, error: { stage: "assets:mutate", message: "Asset criado sem resourceName na resposta", body: assetRes } });
        }
        // b) vincula ao asset group como YOUTUBE_VIDEO
        const linkRes = await gaPost("/assetGroupAssets:mutate", {
          operations: [{
            create: {
              asset_group: assetGroupResourceName,
              asset: assetResourceName,
              field_type: "YOUTUBE_VIDEO",
            },
          }],
        });
        if (linkRes.__gaError) return gaFail(linkRes.error, `assetGroupAssets:mutate (asset=${assetResourceName})`);
        created.push({
          youtube_id: video.youtube_id,
          title: video.title,
          asset_resource_name: assetResourceName,
          link_resource_name: linkRes?.results?.[0]?.resourceValue || linkRes?.results?.[0]?.resourceName || null,
        });
      }
      return Response.json({ ok: true, data: { created } });
    }

    // ── 4. conversion_tag ──────────────────────────────────────────────────────
    if (action === "conversion_tag") {
      const createIfMissing = params.create_if_missing === true;
      const searchQuery = "SELECT conversion_action.resource_name, conversion_action.name, conversion_action.status, conversion_action.category, conversion_action.type, conversion_action.google_tag_settings FROM conversion_action WHERE conversion_action.category = 'STANDARD_LEAD'";

      const searchRes = await gaPost("/googleAds:search", { query: searchQuery });
      if (searchRes.__gaError) return gaFail(searchRes.error, "search conversion_action STANDARD_LEAD");
      const existing = searchRes?.results || [];

      let createdResourceName: string | null = null;
      if (existing.length === 0 && createIfMissing) {
        const name = params.name;
        if (!name) {
          return Response.json({ ok: false, error: { message: "params.name é obrigatório quando create_if_missing=true" } });
        }
        const createRes = await gaPost("/conversionActions:mutate", {
          operations: [{
            create: {
              name,
              type: "WEBPAGE",
              category: "STANDARD_LEAD",
              status: "ENABLED",
              primary_for_goal: true,
              counting: "ONE_PER_CLICK",
              value_settings: {
                default_value: 0,
                default_currency_code: "BRL",
                always_use_default_value: true,
              },
            },
          }],
        });
        if (createRes.__gaError) return gaFail(createRes.error, "conversionActions:mutate");
        createdResourceName = createRes?.results?.[0]?.resourceValue || createRes?.results?.[0]?.resourceName || null;

        // Re-busca para obter google_tag_settings da conversão recém-criada
        const recheck = await gaPost("/googleAds:search", { query: searchQuery });
        if (recheck.__gaError) return gaFail(recheck.error, "re-search conversion_action após criação");
        existing.push(...(recheck?.results || []));
      }

      const convActions = existing.map((c: any) => ({
        resource_name: c?.conversion_action?.resource_name,
        name: c?.conversion_action?.name,
        status: c?.conversion_action?.status,
        category: c?.conversion_action?.category,
        type: c?.conversion_action?.type,
        google_tag_settings: c?.conversion_action?.google_tag_settings || null,
      }));

      return Response.json({
        ok: true,
        data: {
          created: createdResourceName !== null,
          created_resource_name: createdResourceName,
          conversion_actions: convActions,
          // Tag de conversão a instalar no site (presente quando a API retorna google_tag_settings)
          google_tag_settings: convActions[0]?.google_tag_settings || null,
        },
      });
    }

    return Response.json({ ok: false, error: { message: `Ação desconhecida: ${action}. Use: overview, list_assets, add_videos, conversion_tag` } });
  } catch (error) {
    return Response.json({ ok: false, error: { message: (error as Error).message } });
  }
};