import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Plus, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";

const thisWeek = format(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)), "yyyy-MM-dd");
const lastWeek = format(subDays(new Date(thisWeek), 7), "yyyy-MM-dd");

export default function SeoTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ page_url: "", week_start: thisWeek, clicks: "", impressions: "", position: "" });
  const [showForm, setShowForm] = useState(false);

  const { data: pages = [] } = useQuery({
    queryKey: ["seo-pages"],
    queryFn: () => base44.entities.SearchPageWeekly.list("-week_start", 100),
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ["seo-keywords"],
    queryFn: () => base44.entities.SearchKeywordWeekly.list("-week_start", 100),
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.SearchPageWeekly.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seo-pages"] }); setShowForm(false); setForm({ page_url: "", week_start: thisWeek, clicks: "", impressions: "", position: "" }); },
  });

  const thisPages = pages.filter(p => p.week_start === thisWeek);
  const lastPages = pages.filter(p => p.week_start === lastWeek);
  const thisKws = keywords.filter(k => k.week_start === thisWeek);

  // Merge this/last for pages table
  const pagesTable = thisPages.map(p => {
    const prev = lastPages.find(l => l.page_url === p.page_url);
    return { ...p, prev_clicks: prev?.clicks ?? "-", prev_impressions: prev?.impressions ?? "-" };
  }).sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="space-y-6">
      {/* Import placeholder */}
      <Card className="bg-blue-900/30 border-blue-700">
        <CardContent className="p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Como importar dados do Google Search Console</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200">
              <li>Acesse <strong>search.google.com/search-console</strong> com a conta tocaorganic@gmail.com</li>
              <li>Vá em "Desempenho" → "Páginas" ou "Consultas"</li>
              <li>Selecione o período de 7 dias desejado e exporte via "Exportar dados"</li>
              <li>Use o formulário abaixo para inserir os dados manualmente, linha por linha</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Páginas tabela */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-100 text-base">Páginas — semana atual vs anterior</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar dado
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ page_url: form.page_url, week_start: form.week_start, clicks: parseInt(form.clicks) || 0, impressions: parseInt(form.impressions) || 0, position: parseFloat(form.position) || 0, ctr: form.impressions ? ((parseInt(form.clicks) / parseInt(form.impressions)) * 100).toFixed(2) : 0 }); }} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 bg-slate-700/50 rounded-xl">
              <div className="md:col-span-2">
                <Label className="text-slate-300 text-xs">URL da página</Label>
                <Input placeholder="/servicos/diarista-trancoso" value={form.page_url} onChange={e => setForm(f => ({...f, page_url: e.target.value}))} className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-xs" required />
              </div>
              <div><Label className="text-slate-300 text-xs">Semana (seg.)</Label><Input type="date" value={form.week_start} onChange={e => setForm(f => ({...f, week_start: e.target.value}))} className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-xs" /></div>
              <div><Label className="text-slate-300 text-xs">Cliques</Label><Input type="number" value={form.clicks} onChange={e => setForm(f => ({...f, clicks: e.target.value}))} className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-xs" /></div>
              <div><Label className="text-slate-300 text-xs">Impressões</Label><Input type="number" value={form.impressions} onChange={e => setForm(f => ({...f, impressions: e.target.value}))} className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-xs" /></div>
              <div><Label className="text-slate-300 text-xs">Posição média</Label><Input type="number" step="0.1" value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-xs" /></div>
              <div className="flex items-end gap-2 md:col-span-2">
                <Button type="submit" size="sm" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2">Página</th>
                <th className="pb-2 text-right">Cliques</th>
                <th className="pb-2 text-right">Anterior</th>
                <th className="pb-2 text-right">Impressões</th>
                <th className="pb-2 text-right">Posição</th>
              </tr></thead>
              <tbody>
                {pagesTable.map(p => (
                  <tr key={p.id} className="border-b border-slate-700/50">
                    <td className="py-2 text-slate-300 font-mono text-xs">{p.page_url}</td>
                    <td className="py-2 text-right text-slate-100 font-bold">{p.clicks}</td>
                    <td className="py-2 text-right text-slate-500 text-xs">{p.prev_clicks}</td>
                    <td className="py-2 text-right text-slate-300">{p.impressions}</td>
                    <td className="py-2 text-right text-slate-300">{p.position?.toFixed(1) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagesTable.length === 0 && <p className="text-slate-500 text-sm mt-4 text-center">Nenhum dado de páginas para esta semana.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-base">Keywords — semana atual</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2">Keyword</th>
                <th className="pb-2 text-right">Cliques</th>
                <th className="pb-2 text-right">Impressões</th>
                <th className="pb-2 text-right">CTR%</th>
                <th className="pb-2 text-right">Posição</th>
              </tr></thead>
              <tbody>
                {thisKws.sort((a,b) => b.clicks - a.clicks).map(k => (
                  <tr key={k.id} className="border-b border-slate-700/50">
                    <td className="py-2 text-slate-200">{k.keyword}</td>
                    <td className="py-2 text-right text-slate-100 font-bold">{k.clicks}</td>
                    <td className="py-2 text-right text-slate-300">{k.impressions}</td>
                    <td className="py-2 text-right text-slate-300">{k.ctr?.toFixed(1) ?? "-"}%</td>
                    <td className="py-2 text-right text-slate-300">{k.position?.toFixed(1) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {thisKws.length === 0 && <p className="text-slate-500 text-sm mt-4 text-center">Nenhum dado de keywords para esta semana.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}