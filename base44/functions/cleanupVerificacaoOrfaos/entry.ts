import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

const ORFAO_IDS = ["6a619596a8a1cd2de489d8a5","6a619596a8a1cd2de489d89d","6a619596a8a1cd2de489d893","6a619596a8a1cd2de489d888","6a619596a8a1cd2de489d87f"];

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const apagados: string[] = [];
  const falhas: { id: string; erro: string }[] = [];
  for (const id of ORFAO_IDS) {
    try {
      await base44.asServiceRole.entities.Verificacao.deleteMany({ id });
      let resto = await base44.asServiceRole.entities.Verificacao.filter({ id });
      if (resto && resto.length > 0) {
        try { await base44.asServiceRole.entities.Verificacao.delete(id); } catch (e) {}
        resto = await base44.asServiceRole.entities.Verificacao.filter({ id });
      }
      if (!resto || resto.length === 0) { apagados.push(id); }
      else { falhas.push({ id, erro: "registro ainda existe após deleteMany e delete" }); }
    } catch (e: any) {
      falhas.push({ id, erro: String(e?.message || e) });
    }
  }
  return Response.json({ success: falhas.length === 0, apagados, falhas });
};