import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function AnuncioFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    imagem_url: "",
    categoria: "",
    cta_label: "",
    cta_url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.titulo) return;
    setLoading(true);
    try {
      await base44.entities.Anuncio.create(form);
      onSaved?.();
      onClose();
      setForm({ titulo: "", descricao: "", imagem_url: "", categoria: "", cta_label: "", cta_url: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Anúncio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
          </div>
          <div>
            <Label>URL da Imagem</Label>
            <Input value={form.imagem_url} onChange={e => setForm(p => ({ ...p, imagem_url: e.target.value }))} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} />
          </div>
          <div>
            <Label>Texto do Botão (CTA)</Label>
            <Input value={form.cta_label} onChange={e => setForm(p => ({ ...p, cta_label: e.target.value }))} />
          </div>
          <div>
            <Label>URL do Link</Label>
            <Input value={form.cta_url} onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading || !form.titulo}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}