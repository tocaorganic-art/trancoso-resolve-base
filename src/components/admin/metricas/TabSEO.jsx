import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Plus } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek } from "date-fns";

export default function TabSEO({ pages, keywords }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    page_url: "", week_start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    clicks: "", impressions: "", position: ""
  });

  const currentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeek = format(startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const currentPages = (pages || []).filter(p => p.week_start === currentWeek);
  const lastPages = (pages || []).filter(p => p.week_start === lastWeek);

  const getLastWeekData = (url) => lastPages.find(p => p.page_url === url);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.SearchPageWeekly.create(data),
    onSuccess: () => {
      toast.success("Dados de página adicionados!");
      setShowForm(false);
      setForm({ page_url: "", week_start: currentWeek, clicks: "", impressions: "", position: "" });
      queryClient.invalidateQueries({ queryKey: ["searchPages"] });
    },
    onError: () => toast.error("Erro ao salvar dados."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      page_url: form.page_url,
      week_start: form.week_start,
      clicks: parseInt(form.clicks) || 0,
      impressions: parseInt(form.impressions) || 0,
      position: parseFloat(form.position) || 0,
      ctr: form.impressions > 0 ? ((parseInt(form.clicks) / parseInt(form.impressions)) * 100).toFixed(2) : 0,
    });
  };

  const sortedKeywords = (keywords || []).sort((a, b) => (a.position || 99) - (b.position || 99)).slice(0, 20);

  return (
    <div className="space-y-8">
      {/* Instrução importação */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardContent className="p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Como importar dados do Google Search Console:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-300">
              <li>Acesse <strong>search.google.com/search-console</strong></li>
              <li>Vá em Desempenho → Exportar → Download CSV</li>
              <li>Use os dados para preencher manualmente abaixo</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Botão add + formulário */}
      <div className="flex justify-between items-center">
        <h2 className="text-slate-200 font-semibold">Páginas — Semana Atual vs Anterior</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Dados
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3">
                <Label className="text-slate-300">URL da Página</Label>
                <Input value={form.page_url} onChange={e => setForm(f => ({ ...f, page_url: e.target.value }))}
                  placeholder="/servicos/diarista-trancoso" required className="bg-slate-700 border-slate-600 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300">Semana (segunda-feira)</Label>
                <Input type="date" value={form.week_start} onChange={e => setForm(f => ({ ...f, week_start: e.target.value }))}
                  required className="bg-slate-700 border-slate-600 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300">Cliques</Label>
                <Input type="number" value={form.clicks} onChange={e => setForm(f => ({ ...f, clicks: e.target.value }))}
                  placeholder="0" className="bg-slate-700 border-slate-600 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300">Impressões</Label>
                <Input type="number" value={form.impressions} onChange={e => setForm(f => ({ ...f, impressions: e.target.value }))}
                  placeholder="0" className="bg-slate-700 border-slate-600 text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-300">Posição Média</Label>
                <Input type="number" step="0.1" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="10.5" className="bg-slate-700 border-slate-600 text-slate-100" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={mutation.isPending} size="sm">Salvar</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabela páginas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="p-3">Página</th>
                  <th className="p-3">Cliques</th>
                  <th className="p-3">Δ Cliques</th>
                  <th className="p-3">Impressões</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Posição</th>
                </tr>
              </thead>
              <tbody>
                {currentPages.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-slate-500">Nenhum dado desta semana. Adicione manualmente acima.</td></tr>
                ) : currentPages.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).map(p => {
                  const prev = getLastWeekData(p.page_url);
                  const delta = prev ? (p.clicks || 0) - (prev.clicks || 0) : null;
                  return (
                    <tr key={p.id} className="border-b border-slate-700/40 text-slate-300 hover:bg-slate-700/30">
                      <td className="p-3 font-mono text-xs max-w-[200px] truncate">{p.page_url}</td>
                      <td className="p-3 font-bold text-cyan-400">{p.clicks || 0}</td>
                      <td className="p-3">
                        {delta !== null ? (
                          <span className={delta >= 0 ? "text-green-400" : "text-red-400"}>
                            {delta >= 0 ? "+" : ""}{delta}
                          </span>
                        ) : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="p-3">{p.impressions || 0}</td>
                      <td className="p-3">{p.ctr ? `${p.ctr}%` : "—"}</td>
                      <td className="p-3">{p.position ? p.position.toFixed(1) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela keywords */}
      {sortedKeywords.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-base">Keywords por Posição</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="p-3">Keyword</th>
                    <th className="p-3">Cliques</th>
                    <th className="p-3">Impressões</th>
                    <th className="p-3">CTR</th>
                    <th className="p-3">Posição</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedKeywords.map(k => (
                    <tr key={k.id} className="border-b border-slate-700/40 text-slate-300 hover:bg-slate-700/30">
                      <td className="p-3 font-medium">{k.keyword}</td>
                      <td className="p-3 text-cyan-400">{k.clicks || 0}</td>
                      <td className="p-3">{k.impressions || 0}</td>
                      <td className="p-3">{k.ctr ? `${k.ctr}%` : "—"}</td>
                      <td className="p-3">
                        <span className={`font-bold ${(k.position || 99) <= 10 ? "text-green-400" : (k.position || 99) <= 20 ? "text-amber-400" : "text-red-400"}`}>
                          {k.position ? k.position.toFixed(1) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}