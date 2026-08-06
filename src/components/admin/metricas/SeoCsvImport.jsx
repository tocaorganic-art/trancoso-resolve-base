import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek } from "date-fns";

/**
 * Importa CSV exportado do Google Search Console (Desempenho → Exportar → CSV).
 * O CSV do GSC tem linhas de metadados no topo; o header real começa com
 * "Page" ou "Query" seguido de Clicks, Impressions, CTR, Position.
 *
 * Props:
 *  - type: "pages" | "keywords"
 *  - weekStart: data ISO da semana (segunda-feira)
 */
export default function SeoCsvImport({ type, weekStart }) {
  const queryClient = useQueryClient();
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const entityName = type === "pages" ? "SearchPageWeekly" : "SearchKeywordWeekly";
  const queryKey = type === "pages" ? "searchPages" : "searchKeywords";
  const urlField = type === "pages" ? "page_url" : "keyword";

  const bulkMutation = useMutation({
    mutationFn: (records) => base44.entities[entityName].bulkCreate(records),
    onSuccess: (res) => {
      const count = Array.isArray(res) ? res.length : (res?.length ?? 0);
      toast.success(`${count || preview.length} registros importados!`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["searchPages"] });
      queryClient.invalidateQueries({ queryKey: ["searchKeywords"] });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: () => toast.error("Erro ao importar registros."),
  });

  // Parser simples de CSV que respeca aspas
  const parseCsvLine = (line) => {
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setPreview(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);

      // Encontrar o header (linha que contém "Clicks" e "Impressions")
      let headerIdx = -1;
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        if (/clicks/i.test(lines[i]) && /impressions/i.test(lines[i])) {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx === -1) {
        toast.error("CSV inválido — não encontrei colunas Clicks/Impressions. Exporte do Search Console → Desempenho → Exportar CSV.");
        setParsing(false);
        return;
      }

      const headers = parseCsvLine(lines[headerIdx]).map(h => h.toLowerCase());
      const keyIdx = headers.findIndex(h => h === "page" || h === "query" || h === "url" || h === "keyword" || h === "term");
      const clicksIdx = headers.findIndex(h => h === "clicks");
      const impressionsIdx = headers.findIndex(h => h === "impressions");
      const ctrIdx = headers.findIndex(h => h === "ctr");
      const positionIdx = headers.findIndex(h => h === "position");

      if (keyIdx === -1 || clicksIdx === -1) {
        toast.error("CSV sem colunas de Página/Query ou Cliques.");
        setParsing(false);
        return;
      }

      const records = [];
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cells = parseCsvLine(line);
        const keyValue = cells[keyIdx];
        if (!keyValue || /total/i.test(keyValue)) continue; // pular linha de totais

        const clicks = parseInt(cells[clicksIdx]) || 0;
        const impressions = parseInt(cells[impressionsIdx]) || 0;
        const ctrRaw = ctrIdx !== -1 ? (cells[ctrIdx] || "").replace("%", "").replace(",", ".") : "";
        const ctr = parseFloat(ctrRaw) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const position = positionIdx !== -1 ? parseFloat((cells[positionIdx] || "").replace(",", ".")) || 0 : 0;

        records.push({
          [urlField]: keyValue,
          week_start: weekStart,
          clicks,
          impressions,
          ctr: parseFloat(ctr.toFixed(2)),
          position,
        });
      }

      if (records.length === 0) {
        toast.error("Nenhum registro válido encontrado no CSV.");
        setParsing(false);
        return;
      }

      setPreview(records);
      toast.message(`${records.length} registros prontos para importar na semana ${weekStart}.`);
    } catch {
      toast.error("Erro ao ler o arquivo CSV.");
    } finally {
      setParsing(false);
    }
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    bulkMutation.mutate(preview);
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground">
            Importar CSV — {type === "pages" ? "Páginas" : "Palavras-chave"}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Exporte do Google Search Console (Desempenho → Exportar → CSV) e faça upload.
          A semana selecionada será atribuída a todos os registros.
        </p>

        {!preview && (
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:cursor-pointer file:hover:bg-brand-primary-hover"
            />
            {parsing && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
        )}

        {preview && (
          <div className="space-y-3">
            <div className="bg-muted border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {preview.length} registros encontrados — semana {weekStart}
              </p>
              <div className="space-y-1">
                {preview.slice(0, 8).map((r, i) => (
                  <div key={i} className="flex justify-between text-xs text-foreground">
                    <span className="font-mono truncate max-w-[60%]">{r[urlField]}</span>
                    <span>{r.clicks} cliq · {r.impressions} impr · pos {r.position?.toFixed(1)}</span>
                  </div>
                ))}
                {preview.length > 8 && (
                  <p className="text-xs text-muted-foreground">... e mais {preview.length - 8} registros</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={bulkMutation.isPending} size="sm" className="gap-2">
                {bulkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Confirmar importação
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}