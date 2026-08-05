import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Flame, Phone, Mail, Repeat2 } from "lucide-react";

/**
 * Seção de métricas de clientes para o Dashboard do prestador.
 * Deriva dados das ServiceRequests já carregadas — sem novas chamadas à API.
 *
 * @param {Array|undefined} serviceRequests - undefined = carregando; [] = sem dados
 */
export default function ClientMetrics({ serviceRequests }) {
  const metrics = useMemo(() => {
    // undefined significa que a query ainda não resolveu — mostra skeleton
    if (!Array.isArray(serviceRequests)) return null;

    // "Ativo" = pedido em aberto (não finalizado). Concluído é histórico, não ativo.
    const ACTIVE_STATUSES = ["Pendente", "Confirmado", "Em Andamento"];

    // Agrupa por identificador único do cliente (email normalizado → phone → nome)
    const clientMap = new Map();
    serviceRequests.forEach((req) => {
      const key =
        req.client_email?.trim().toLowerCase() ||
        req.client_phone?.trim() ||
        req.client_name?.trim() ||
        "sem-identificador";

      const existing = clientMap.get(key) || {
        name: req.client_name || "Cliente sem nome",
        email: req.client_email || "",
        phone: req.client_phone || "",
        totalRequests: 0,
        activeRequests: 0,
        lastDate: req.created_date || req.date || "",
      };

      existing.totalRequests += 1;
      if (ACTIVE_STATUSES.includes(req.status)) existing.activeRequests += 1;

      const d = req.created_date || req.date || "";
      if (d && d > existing.lastDate) existing.lastDate = d;

      clientMap.set(key, existing);
    });

    const allClients = Array.from(clientMap.values());
    const activeClients = allClients.filter((c) => c.activeRequests > 0);
    const returningClients = allClients.filter((c) => c.totalRequests > 1);
    const returnRate =
      allClients.length > 0
        ? Math.round((returningClients.length / allClients.length) * 100)
        : 0;

    const topEngaged = [...allClients]
      .sort((a, b) => b.totalRequests - a.totalRequests || b.activeRequests - a.activeRequests)
      .slice(0, 5);

    return {
      totalClients: allClients.length,
      activeCount: activeClients.length,
      returningCount: returningClients.length,
      returnRate,
      topEngaged,
    };
  }, [serviceRequests]);

  // Converte data ISO para texto relativo legível
  const relativeDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
      if (diff === 0) return "hoje";
      if (diff === 1) return "ontem";
      if (diff < 30) return `há ${diff} dias`;
      if (diff < 365) return `há ${Math.floor(diff / 30)} meses`;
      return `há ${Math.floor(diff / 365)} anos`;
    } catch {
      return "";
    }
  };

  const initials = (name) =>
    (name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

  // Skeleton enquanto serviceRequests ainda não carregou
  if (metrics === null) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-brand-primary" />
          <h2 className="text-xl font-bold text-foreground">Meus Clientes</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-36 rounded-2xl bg-muted animate-pulse" />
          <div className="h-36 rounded-2xl bg-muted animate-pulse" />
          <div className="lg:col-span-2 h-36 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-brand-primary" />
        <h2 className="text-xl font-bold text-foreground">Meus Clientes</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Card 1: Resumo */}
        <Card className="border border-border bg-card shadow-warm-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-extrabold text-brand-primary leading-tight">
                {metrics.activeCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">pedidos em aberto</p>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-2xl font-bold text-foreground">{metrics.totalClients}</div>
              <p className="text-xs text-muted-foreground mt-0.5">clientes no total</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Taxa de Retorno */}
        <Card className="border border-border bg-card shadow-warm-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Repeat2 className="w-4 h-4 text-green-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Fidelidade</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-extrabold text-green-600 dark:text-green-400 leading-tight">
                {metrics.returnRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">taxa de retorno</p>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-2xl font-bold text-foreground">{metrics.returningCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">clientes recorrentes</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Mais engajados (2 colunas) */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-warm-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Mais engajados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {metrics.topEngaged.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Seus clientes mais engajados aparecerão aqui assim que receber solicitações.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {metrics.topEngaged.map((client, idx) => (
                  <li
                    key={`${client.email || client.phone || client.name}-${idx}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold">
                        {initials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                        {client.activeRequests > 0 && (
                          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300">
                            ativo
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{client.email}</span>
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{client.phone}</span>
                          </span>
                        )}
                        {client.lastDate && (
                          <span className="text-muted-foreground/60">{relativeDate(client.lastDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-foreground">{client.totalRequests}</div>
                      <p className="text-xs text-muted-foreground">
                        {client.totalRequests === 1 ? "pedido" : "pedidos"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}