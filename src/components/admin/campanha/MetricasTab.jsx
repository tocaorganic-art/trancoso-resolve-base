import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

const EMPTY = {
  campaign_post_id: "",
  date: new Date().toISOString().slice(0, 10),
  channel: "",
  reach: 0,
  impressions: 0,
  likes: 0,
  comments: 0,
  saves: 0,
  shares: 0,
  clicks: 0,
  leads: 0,
  qualified_leads: 0,
};

export default function MetricasTab({ metrics, posts, onRefresh }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: field === "campaign_post_id" || field === "channel" || field === "date" ? value : Number(value) || 0 }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.campaign_post_id) {
      toast.error("Selecione um conteúdo.");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CampaignMetric.create(form);
      toast.success("Métrica registrada.");
      setForm(EMPTY);
      onRefresh?.();
    } catch {
      toast.error("Erro ao registrar métrica.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-[#E3DED5]">
        <CardContent className="p-5">
          <h3 className="font-bold text-[#333333] mb-4">Registrar métrica</h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#555]">Conteúdo</Label>
                <select
                  value={form.campaign_post_id}
                  onChange={set("campaign_post_id")}
                  className="w-full min-h-[40px] rounded-md border border-[#E3DED5] bg-white px-3 text-sm focus-visible:ring-[#F26A21] focus-visible:outline-none"
                >
                  <option value="">Selecione…</option>
                  {(posts || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.campaign_day ? `Dia ${p.campaign_day} — ` : ""}
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#555]">Data</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  className="min-h-[40px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#555]">Canal</Label>
                <Input
                  value={form.channel}
                  onChange={set("channel")}
                  placeholder="Instagram, Facebook…"
                  className="min-h-[40px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["reach", "Alcance"],
                ["impressions", "Impressões"],
                ["likes", "Curtidas"],
                ["comments", "Comentários"],
                ["saves", "Salvamentos"],
                ["shares", "Compartilhamentos"],
                ["clicks", "Cliques"],
                ["leads", "Leads"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs text-[#666]">{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form[field]}
                    onChange={set(field)}
                    className="min-h-[40px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                  />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#F26A21] hover:bg-[#d95a1a] text-white min-h-[44px] gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E3DED5]">
        <CardContent className="p-0">
          {(metrics || []).length === 0 ? (
            <p className="text-center text-[#999] py-10">Sem dados registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E3DED5] text-left text-[#666]">
                    <th className="p-3">Data</th>
                    <th className="p-3">Canal</th>
                    <th className="p-3">Alcance</th>
                    <th className="p-3">Impressões</th>
                    <th className="p-3">Cliques</th>
                    <th className="p-3">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics || []).map((m) => (
                    <tr key={m.id} className="border-b border-[#E3DED5]/50">
                      <td className="p-3 text-[#555]">{m.date}</td>
                      <td className="p-3 text-[#555]">{m.channel || "—"}</td>
                      <td className="p-3 text-[#333]">{m.reach || 0}</td>
                      <td className="p-3 text-[#333]">{m.impressions || 0}</td>
                      <td className="p-3 text-[#333]">{m.clicks || 0}</td>
                      <td className="p-3 text-[#333]">{m.leads || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}