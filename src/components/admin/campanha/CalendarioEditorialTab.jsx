import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ExternalLink, Check } from "lucide-react";

const STATUS_PROD = [
  "planned",
  "in_production",
  "ready_for_review",
  "approved",
  "scheduled",
  "published",
  "cancelled",
];
const STATUS_VALID = [
  "confirmed",
  "partially_confirmed",
  "pending_validation",
  "blocked",
];

export default function CalendarioEditorialTab({ posts, onRefresh }) {
  const [filtroLocal, setFiltroLocal] = useState("todas");
  const [filtroCanal, setFiltroCanal] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [saving, setSaving] = useState(null);

  const localidades = useMemo(() => {
    const set = new Set((posts || []).map((p) => p.localities).filter(Boolean));
    return [...set];
  }, [posts]);
  const canais = useMemo(() => {
    const set = new Set((posts || []).map((p) => p.channels).filter(Boolean));
    return [...set];
  }, [posts]);

  const filtered = useMemo(() => {
    let data = [...(posts || [])];
    if (filtroLocal !== "todas") data = data.filter((p) => p.localities === filtroLocal);
    if (filtroCanal !== "todos") data = data.filter((p) => p.channels === filtroCanal);
    if (filtroStatus !== "todos") data = data.filter((p) => p.production_status === filtroStatus);
    return data.sort((a, b) => (a.campaign_day || 0) - (b.campaign_day || 0));
  }, [posts, filtroLocal, filtroCanal, filtroStatus]);

  const updatePost = async (id, patch) => {
    setSaving(id);
    try {
      await base44.entities.CampaignPost.update(id, patch);
      toast.success("Conteúdo atualizado.");
      onRefresh?.();
    } catch {
      toast.error("Erro ao atualizar conteúdo.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white border-[#E3DED5]">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs text-[#666] mb-1">Localidade</p>
            <Select value={filtroLocal} onValueChange={setFiltroLocal}>
              <SelectTrigger className="w-40 min-h-[40px] border-[#E3DED5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {localidades.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-[#666] mb-1">Canal</p>
            <Select value={filtroCanal} onValueChange={setFiltroCanal}>
              <SelectTrigger className="w-40 min-h-[40px] border-[#E3DED5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {canais.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-[#666] mb-1">Status produção</p>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44 min-h-[40px] border-[#E3DED5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {STATUS_PROD.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-8 text-center text-[#999]">
            Sem dados registrados. Adicione conteúdos via entidade CampaignPost.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card className="bg-white border-[#E3DED5]">
            <CardContent className="p-0">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#E3DED5] text-left text-[#666]">
                    <th className="p-2">Dia</th>
                    <th className="p-2">Fase</th>
                    <th className="p-2">Canal</th>
                    <th className="p-2">Formato</th>
                    <th className="p-2">Tema</th>
                    <th className="p-2">Local</th>
                    <th className="p-2">Público</th>
                    <th className="p-2">CTA</th>
                    <th className="p-2">Validação</th>
                    <th className="p-2">Produção</th>
                    <th className="p-2">URL</th>
                    <th className="p-2">Canva</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#E3DED5]/50 hover:bg-[#FAFAF7]">
                      <td className="p-2 font-semibold text-[#20382C]">{p.campaign_day || "—"}</td>
                      <td className="p-2 text-[#555]">{p.phase || "—"}</td>
                      <td className="p-2 text-[#555]">{p.channels || "—"}</td>
                      <td className="p-2 text-[#555]">{p.format || "—"}</td>
                      <td className="p-2 text-[#333] font-medium max-w-[180px] truncate" title={p.title}>
                        {p.title || "—"}
                      </td>
                      <td className="p-2 text-[#555]">{p.localities || "—"}</td>
                      <td className="p-2 text-[#555]">{p.audience || "—"}</td>
                      <td className="p-2 text-[#555]">{p.cta || "—"}</td>
                      <td className="p-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                          {p.validation_status || "—"}
                        </span>
                      </td>
                      <td className="p-2">
                        <Select
                          value={p.production_status || "planned"}
                          onValueChange={(v) => updatePost(p.id, { production_status: v })}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs border-[#E3DED5]" disabled={saving === p.id}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_PROD.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          defaultValue={p.publication_url || ""}
                          onBlur={(e) => {
                            if (e.target.value !== (p.publication_url || ""))
                              updatePost(p.id, { publication_url: e.target.value });
                          }}
                          className="h-8 w-28 text-xs border-[#E3DED5]"
                          placeholder="URL"
                        />
                      </td>
                      <td className="p-2">
                        {p.canva_url ? (
                          <a
                            href={p.canva_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F26A21] hover:underline inline-flex items-center gap-1 text-xs"
                          >
                            Abrir <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#bbb]">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={saving === p.id}
                          onClick={() =>
                            updatePost(p.id, {
                              validation_status: "confirmed",
                              production_status: "approved",
                              approved_at: new Date().toISOString(),
                            })
                          }
                          className="h-8 text-xs text-green-600 hover:text-green-700 gap-1"
                        >
                          <Check className="w-3 h-3" /> Aprovar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}