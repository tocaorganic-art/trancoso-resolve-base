import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

// Garbage collection dos 5 registros orfaos de Verificacao (23/07/2026).
// Estrategia em cascata por registro, com diagnostico completo no response:
//   1) delete(id) com service role  (padrao usado em deleteServiceRequests)
//   2) deleteMany({id})             (fallback)
//   3) tombstone: update status -> "excluded"  (garante que o monitor pare
//      de alertar mesmo se a exclusao estiver bloqueada por permissao)
const ORFAO_IDS = [
  "6a619596a8a1cd2de489d8a5",
  "6a619596a8a1cd2de489d89d",
  "6a619596a8a1cd2de489d893",
  "6a619596a8a1cd2de489d888",
  "6a619596a8a1cd2de489d87f",
];

const corte = (msg: unknown): string => String((msg as Error)?.message ?? msg).slice(0, 300);

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole.entities.Verificacao;

  const resultados: Record<string, unknown>[] = [];

  for (const id of ORFAO_IDS) {
    const r: Record<string, unknown> = { id };

    // 1) delete simples
    try {
      await sr.delete(id);
      r.delete = "ok";
    } catch (e) {
      r.delete = corte(e);
    }

    // confere depois do delete
    try {
      const resto = await sr.filter({ id });
      const n = Array.isArray(resto) ? resto.length : -1;
      r.existeAposDelete = n;

      if (n > 0) {
        // 2) fallback deleteMany
        try {
          const dm = await sr.deleteMany({ id });
          r.deleteMany = JSON.stringify(dm).slice(0, 200);
        } catch (e) {
          r.deleteMany = corte(e);
        }

        const resto2 = await sr.filter({ id });
        const n2 = Array.isArray(resto2) ? resto2.length : -1;
        r.existeAposDeleteMany = n2;

        if (n2 > 0) {
          // 3) tombstone — status "expired" (dentro do enum do schema) para o monitor ignorar
          try {
            await sr.update(id, {
              status: "expired",
              admin_notes:
                "Registro orfao (provider inexistente, 23/07/2026) — tombstone aplicado pelo cleanupVerificacaoOrfaos v2 em 10/09/2026.",
            });
            r.tombstone = "ok";
          } catch (e) {
            r.tombstone = corte(e);
          }
        }
      }
    } catch (e) {
      r.erroVerificacao = corte(e);
    }

    resultados.push(r);
  }

  // estado final da base
  let finalCount = -1;
  let finalPendentes = -1;
  try {
    const todos = await sr.filter({});
    finalCount = Array.isArray(todos) ? todos.length : -1;
    let pendTotal = 0;
    for (const st of ["pending", "in_progress"]) {
      const pend = await sr.filter({ status: st });
      pendTotal += Array.isArray(pend) ? pend.length : 0;
    }
    finalPendentes = pendTotal;
  } catch (e) {
    finalCount = -1;
  }

  const apagadosDeVerdade = resultados.filter((x) => x.existeAposDelete === 0).length;
  const tombstoned = resultados.filter((x) => x.tombstone === "ok").length;

  return Response.json({
    success: apagadosDeVerdade + tombstoned === ORFAO_IDS.length,
    apagados: apagadosDeVerdade,
    tombstoned,
    totalRegistrosBase: finalCount,
    pendentesRestantes: finalPendentes,
    detalhes: resultados,
  });
};
