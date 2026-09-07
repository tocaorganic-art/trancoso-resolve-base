import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// Função de limpeza de registros órfãos da entidade Verificacao.
// Apaga exclusivamente 5 IDs hardcoded, autorizados pelo dono do app.
// Sem gate de autenticação para permitir invocação por HTTP.

const ORFAO_IDS = [
  "6a619596a8a1cd2de489d8a5",
  "6a619596a8a1cd2de489d89d",
  "6a619596a8a1cd2de489d893",
  "6a619596a8a1cd2de489d888",
  "6a619596a8a1cd2de489d87f",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const apagados: any[] = [];
    const falhas: any[] = [];

    for (const id of ORFAO_IDS) {
      try {
        await base44.asServiceRole.entities.Verificacao.delete(id);
        apagados.push(id);
      } catch (error) {
        falhas.push({ id, erro: (error as Error).message });
      }
    }

    return Response.json({
      success: falhas.length === 0,
      apagados: apagados.length,
      apagados_ids: apagados,
      falhas: falhas.length,
      falhas_detalhe: falhas,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}