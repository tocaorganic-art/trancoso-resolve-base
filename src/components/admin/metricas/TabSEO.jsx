import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek } from "date-fns";
import SeoCsvImport from "@/components/admin/metricas/SeoCsvImport";

export default function TabSEO({ pages, keywords }) {
  const queryClient = useQueryClient();
  const [showPageForm, setShowPageForm] = useState(false);
  const [showKwForm, setShowKwForm] = useState(false);
  const [importWeek, setImportWeek] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );

  const currentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeek = format(startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [pageForm, setPageForm] = useState({
    page_url: "", week_start: currentWeek,
    clicks: "", impressions: "", position: "",
  });
  const [kwForm, setKwForm] = useState({
    keyword: "", week_start: currentWeek,
    clicks: "", impressions: "", position: "",
  });

  const currentPages = (pages || []).filter(p => p.week_start === currentWeek);
  const lastPages = (pages || []).filter(p => p.week_start === lastWeek);
  const getLastWeekData = (url) => lastPages.find(p => p.page_url === url);

  const currentKeywords = (keywords || []).filter(k => k.week_start === currentWeek);

  const pageMutation = useMutation({
    mutationFn: (data) => base44.entities.SearchPageWeekly.create(data),
    onSuccess: () => {
      toast.success("Dados de página adicionados!");
      setShowPageForm(false);
      setPageForm({ page_url: "", week_start: currentWeek, clicks: "", impressions: "", position: "" });
      queryClient.invalidateQueries({ queryKey: ["searchPages"] });
      queryClient.invalidateQueries({ queryKey: ["seo-pages"] });
    },
    onError: () => toast.error("Erro ao salvar dados."),
  });

  const kwMutation = useMutation({
    mutationFn: (data) => base44.entities.SearchKeywordWeekly.create(data),
    onSuccess: () => {
      toast.success("Palavra-chave adicionada!");
      setShowKwForm(false);
      setKwForm({ keyword: "", week_start: currentWeek, clicks: "", impressions: "", position: "" });
      queryClient.invalidateQueries({ queryKey: ["searchKeywords"] });
      queryClient.invalidateQueries({ queryKey: ["seo-keywords"] });
    },
    onError: () => toast.error("Erro ao salvar palavra-chave."),
  });

  const handlePageSubmit = (e) => {
    e.preventDefault();
    pageMutation.mutate({
      page_url: pageForm.page_url,
      week_start: pageForm.week_start,
      clicks: parseInt(pageForm.clicks) || 0,
      impressions: parseInt(pageForm.impressions) || 0,
      position: parseFloat(pageForm.position) || 0,
      ctr: pageForm.impressions > 0
        ? ((parseInt(pageForm.clicks) / parseInt(pageForm.impressions)) * 100).toFixed(2)
        : 0,
    });
  };

  const handleKwSubmit = (e) => {
    e.preventDefault();
    kwMutation.mutate({
      keyword: kwForm.keyword,
      week_start: kwForm.week_start,
      clicks: parseInt(kwForm.clicks) || 0,
      impressions: parseInt(kwForm.impressions) || 0,
      position: parseFloat(kwForm.position) || 0,
      ctr: kwForm.impressions > 0
        ? ((parseInt(kwForm.clicks) / parseInt(kwForm.impressions)) * 100).toFixed(2)
        : 0,
    });
  };

  const sortedKeywords = (keywords || []).sort((a, b) => (a.position || 99) - (b.position || 99)).slice(0, 20);

  return (
    <div className="space-y-8">
      {/* Seletor de semana para importação */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <Label className="text-sm font-semibold text-foreground mb-2 block">
            Semana de referência para importação
          </Label>
          <Input
            type="date"
            value={importWeek}
            onChange={(e) => setImportWeek(e.target.value)}
            className="max-w-[200px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Todos os registros importados via CSV serão atribuídos a esta semana (segunda-feira).
          </p>
        </CardContent>
      </Card>

      {/* Importação CSV — Páginas */}
      <SeoCsvImport type="pages" weekStart={importWeek} />

      {/* Importação CSV — Keywords */}
      <SeoCsvImport type="keywords" weekStart={importWeek} />

      {/* Páginas — formulário manual + tabela */}
      <div className="flex justify-between items-center">
        <h2 className="text-foreground font-semibold">Páginas — Semana Atual vs Anterior</h2>
        <Button size="sm" onClick={() => setShowPageForm(!showPageForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Manualmente
        </Button>
      </div>

      {showPageForm && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <form onSubmit={handlePageSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3">
                <Label className="text-muted-foreground">URL da Página</Label>
                <Input value={pageForm.page_url} onChange={e => setPageForm(f => ({ ...f, page_url: e.target.value }))}
                  placeholder="/servicos/diarista-trancoso" required className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Semana (segunda-feira)</Label>
                <Input type="date" value={pageForm.week_start} onChange={e => setPageForm(f => ({ ...f, week_start: e.target.value }))}
                  required className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Cliques</Label>
                <Input type="number" value={pageForm.clicks} onChange={e => setPageForm(f => ({ ...f, clicks: e.target.value }))}
                  placeholder="0" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Impressões</Label>
                <Input type="number" value={pageForm.impressions} onChange={e => setPageForm(f => ({ ...f, impressions: e.target.value }))}
                  placeholder="0" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Posição Média</Label>
                <Input type="number" step="0.1" value={pageForm.position} onChange={e => setPageForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="10.5" className="bg-background border-border" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={pageMutation.isPending} size="sm">Salvar</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPageForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-3">Página</th>
                  <th className="p-3 text-right">Cliques</th>
                  <th className="p-3 text-right">Δ Cliques</th>
                  <th className="p-3 text-right">Impressões</th>
                  <th className="p-3 text-right">CTR</th>
                  <th className="p-3 text-right">Posição</th>
                </tr>
              </thead>
              <tbody>
                {currentPages.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum dado de páginas para esta semana. Importe via CSV ou adicione manualmente.</td></tr>
                ) : currentPages.sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).map(p => {
                  const prev = getLastWeekData(p.page_url);
                  const delta = prev ? (p.clicks || 0) - (prev.clicks || 0) : null;
                  return (
                    <tr key={p.id} className="border-b border-border/40 text-foreground hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs max-w-[200px] truncate">{p.page_url}</td>
                      <td className="p-3 text-right font-bold text-brand-primary">{p.clicks || 0}</td>
                      <td className="p-3 text-right">
                        {delta !== null ? (
                          <span className={delta >= 0 ? "text-green-600" : "text-red-600"}>
                            {delta >= 0 ? "+" : ""}{delta}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 text-right text-muted-foreground">{p.impressions || 0}</td>
                      <td className="p-3 text-right text-muted-foreground">{p.ctr ? `${p.ctr}%` : "—"}</td>
                      <td className="p-3 text-right text-muted-foreground">{p.position ? p.position.toFixed(1) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Keywords — formulário manual + tabela */}
      <div className="flex justify-between items-center">
        <h2 className="text-foreground font-semibold">Palavras-chave — Semana Atual</h2>
        <Button size="sm" onClick={() => setShowKwForm(!showKwForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Manualmente
        </Button>
      </div>

      {showKwForm && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <form onSubmit={handleKwSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3">
                <Label className="text-muted-foreground">Palavra-chave</Label>
                <Input value={kwForm.keyword} onChange={e => setKwForm(f => ({ ...f, keyword: e.target.value }))}
                  placeholder="diarista trancoso" required className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Semana (segunda-feira)</Label>
                <Input type="date" value={kwForm.week_start} onChange={e => setKwForm(f => ({ ...f, week_start: e.target.value }))}
                  required className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Cliques</Label>
                <Input type="number" value={kwForm.clicks} onChange={e => setKwForm(f => ({ ...f, clicks: e.target.value }))}
                  placeholder="0" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Impressões</Label>
                <Input type="number" value={kwForm.impressions} onChange={e => setKwForm(f => ({ ...f, impressions: e.target.value }))}
                  placeholder="0" className="bg-background border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground">Posição Média</Label>
                <Input type="number" step="0.1" value={kwForm.position} onChange={e => setKwForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="10.5" className="bg-background border-border" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={kwMutation.isPending} size="sm">Salvar</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowKwForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Keywords por Posição</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-3">Keyword</th>
                  <th className="p-3 text-right">Cliques</th>
                  <th className="p-3 text-right">Impressões</th>
                  <th className="p-3 text-right">CTR</th>
                  <th className="p-3 text-right">Posição</th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhum dado de keywords. Importe via CSV ou adicione manualmente.</td></tr>
                ) : sortedKeywords.map(k => (
                  <tr key={k.id} className="border-b border-border/40 text-foreground hover:bg-muted/30">
                    <td className="p-3 font-medium">{k.keyword}</td>
                    <td className="p-3 text-right text-brand-primary">{k.clicks || 0}</td>
                    <td className="p-3 text-right text-muted-foreground">{k.impressions || 0}</td>
                    <td className="p-3 text-right text-muted-foreground">{k.ctr ? `${k.ctr}%` : "—"}</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${(k.position || 99) <= 10 ? "text-green-600" : (k.position || 99) <= 20 ? "text-amber-600" : "text-red-600"}`}>
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
    </div>
  );
}