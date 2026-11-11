import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Sanitiza CPF legado que ficou gravado fora da entidade privada.
 *
 * Problema: antes de 11/11/2026 o CPF podia ser gravado também no
 * ServiceProvider (entidade mais exposta) e em Verificacao.ocr_resultado.
 * A entidade canônica é ServiceProviderPrivate.
 *
 * Esta função:
 * 1. Garante que o CPF exista em ServiceProviderPrivate (fonte da verdade).
 * 2. Substitui o CPF no ServiceProvider pelo valor mascarado.
 * 3. Mascara CPF encontrado em Verificacao.ocr_resultado.
 *
 * Segurança: exige admin, roda em modo dry-run por padrão e nunca devolve
 * o valor do CPF na resposta, apenas contagens e ids.
 */

const LIMITE_PADRAO = 200;
const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

function soDigitos(v: unknown): string {
  return typeof v === 'string' ? v.replace(/\D/g, '') : '';
}

function mascararCpf(v: unknown): string {
  const d = soDigitos(v);
  if (d.length !== 11) return '***.***.***-**';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

/** Mascara todo CPF (com ou sem pontuação) dentro de um texto livre. */
function mascararCpfEmTexto(texto: string): { texto: string; achados: number } {
  let achados = 0;
  const novo = texto.replace(CPF_REGEX, (match) => {
    const d = match.replace(/\D/g, '');
    if (d.length !== 11) return match;
    // Evita mascarar sequências que claramente não são CPF (ex: datas longas).
    achados += 1;
    return mascararCpf(d);
  });
  return { texto: novo, achados };
}

/** Achata qualquer estrutura (string, objeto, array) em texto para varredura. */
function varrerTexto(valor: unknown, encontrados: string[]): void {
  if (typeof valor === 'string') {
    if (soDigitos(valor).length >= 11 && CPF_REGEX.test(valor)) encontrados.push(valor);
    CPF_REGEX.lastIndex = 0;
    return;
  }
  if (Array.isArray(valor)) {
    for (const item of valor) varrerTexto(item, encontrados);
    return;
  }
  if (valor && typeof valor === 'object') {
    for (const v of Object.values(valor as Record<string, unknown>)) varrerTexto(v, encontrados);
  }
}

/** Aplica a máscara preservando a estrutura original do JSON. */
function mascararEstrutura(valor: unknown): unknown {
  if (typeof valor === 'string') return mascararCpfEmTexto(valor).texto;
  if (Array.isArray(valor)) return valor.map(mascararEstrutura);
  if (valor && typeof valor === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) out[k] = mascararEstrutura(v);
    return out;
  }
  return valor;
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body: { dry_run?: boolean; limite?: number } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const dryRun = body.dry_run !== false;
    const limite = Math.min(Math.max(Number(body.limite) || LIMITE_PADRAO, 1), 500);

    const svc = base44.asServiceRole;
    // WORKAROUND (12/09/2026): .get(id) e .filter({id}) falham no servidor com
    // asServiceRole. Padrão confiável: .list() e resolver em memória.
    const [providers, privados, verificacoes] = await Promise.all([
      svc.entities.ServiceProvider.list(),
      svc.entities.ServiceProviderPrivate.list(),
      svc.entities.Verificacao.list(),
    ]);

    const privadoPorProvider = new Map<string, any>();
    for (const p of privados || []) {
      if (p?.service_provider_id) privadoPorProvider.set(p.service_provider_id, p);
    }

    const relatorio = {
      dry_run: dryRun,
      limite,
      providers_com_cpf_legado: 0,
      privados_criados: 0,
      privados_atualizados: 0,
      providers_mascarados: 0,
      verificacoes_com_cpf: 0,
      verificacoes_mascaradas: 0,
      restantes: 0,
      erros: [] as string[],
      pendencias_sem_tratamento: { nome_mae: 0, data_nascimento: 0, cnpj: 0 },
    };

    let processados = 0;
    for (const provider of providers || []) {
      const cpfDigitos = soDigitos(provider?.cpf);
      if (cpfDigitos.length !== 11) continue;
      relatorio.providers_com_cpf_legado += 1;

      if (processados >= limite) {
        relatorio.restantes += 1;
        continue;
      }
      processados += 1;

      const priv = privadoPorProvider.get(provider.id);
      if (!dryRun) {
        try {
          if (!priv) {
            await svc.entities.ServiceProviderPrivate.create({
              service_provider_id: provider.id,
              cpf: cpfDigitos,
              ...(provider.data_nascimento ? { data_nascimento: provider.data_nascimento } : {}),
            });
            relatorio.privados_criados += 1;
          } else if (!soDigitos(priv.cpf)) {
            await svc.entities.ServiceProviderPrivate.update(priv.id, { cpf: cpfDigitos });
            relatorio.privados_atualizados += 1;
          }
        } catch (e) {
          relatorio.erros.push(`private:${provider.id}:${(e as Error)?.message || 'falha'}`);
          continue;
        }
      }

      if (!dryRun) {
        try {
          await svc.entities.ServiceProvider.update(provider.id, { cpf: mascararCpf(cpfDigitos) });
          relatorio.providers_mascarados += 1;
        } catch (e) {
          relatorio.erros.push(`provider:${provider.id}:${(e as Error)?.message || 'falha'}`);
        }
      }
    }

    for (const v of verificacoes || []) {
      const achados: string[] = [];
      varrerTexto(v?.ocr_resultado, achados);
      if (!achados.length) continue;
      relatorio.verificacoes_com_cpf += 1;
      if (dryRun) continue;
      try {
        await svc.entities.Verificacao.update(v.id, { ocr_resultado: mascararEstrutura(v.ocr_resultado) });
        relatorio.verificacoes_mascaradas += 1;
      } catch (e) {
        relatorio.erros.push(`verificacao:${v.id}:${(e as Error)?.message || 'falha'}`);
      }
    }

    // Contagens de pendências que esta função NÃO altera (decisão pendente do Tony).
    for (const provider of providers || []) {
      if (provider?.nome_mae) relatorio.pendencias_sem_tratamento.nome_mae += 1;
      if (provider?.data_nascimento) relatorio.pendencias_sem_tratamento.data_nascimento += 1;
      if (provider?.cnpj) relatorio.pendencias_sem_tratamento.cnpj += 1;
    }

    return Response.json(relatorio);
  } catch (error) {
    return Response.json({ error: (error as Error)?.message || 'Falha ao sanitizar' }, { status: 500 });
  }
});
