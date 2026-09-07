import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// Função TEMPORÁRIA de limpeza: apaga 5 registros órfãos conhecidos da
// entidade Verificacao, usando .delete(id) individual (não deleteMany).
// Será removida após a confirmação da exclusão.

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
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return Response.json({ error: "Apenas administradores podem executar esta limpeza" }, { status: 403 });
    }

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