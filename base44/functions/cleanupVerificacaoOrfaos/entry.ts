import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// ─── Função TEMPORÁRIA de limpeza ────────────────────────────────────────────
// Apaga EXATAMENTE os 5 registros órfãos da entidade Verificacao listados abaixo
// (provider_ids inexistentes). Usa asServiceRole para contornar RLS.
// Esta função deve ser REMOVIDA após a execução — não é parte do app.

const ORPHAN_IDS = [
  "6a619596a8a1cd2de489d8a5",
  "6a619596a8a1cd2de489d89d",
  "6a619596a8a1cd2de489d893",
  "6a619596a8a1cd2de489d888",
  "6a619596a8a1cd2de489d87f",
];

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const apagados: string[] = [];
    const naoEncontrados: string[] = [];
    const falhas: { id: string; erro: string }[] = [];

    for (const id of ORPHAN_IDS) {
      try {
        // Confirma existência antes de apagar (consulta por filter é estável via asServiceRole)
        const rows = await base44.asServiceRole.entities.Verificacao.filter({ id });
        if (!rows || rows.length === 0) {
          naoEncontrados.push(id);
          continue;
        }
        // Apaga somente este registro, por ID exato
        await base44.asServiceRole.entities.Verificacao.deleteMany({ id });
        // Confirma que não existe mais
        const depois = await base44.asServiceRole.entities.Verificacao.filter({ id });
        if (!depois || depois.length === 0) {
          apagados.push(id);
        } else {
          falhas.push({ id, erro: "Registro ainda existe após deleteMany" });
        }
      } catch (e) {
        falhas.push({ id, erro: (e as Error).message });
      }
    }

    return Response.json({
      success: falhas.length === 0,
      total_solicitados: ORPHAN_IDS.length,
      apagados_count: apagados.length,
      apagados,
      nao_encontrados: naoEncontrados,
      falhas,
    });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
});