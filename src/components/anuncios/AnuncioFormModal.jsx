import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AnuncioFormModal({ open, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    imagem_url: "",
    cta_label: "",
    cta_url: "",
    categoria: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ titulo: "", descricao: "", imagem_url: "", cta_label: "", cta_url: "", categoria: "" });
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo anúncio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required placeholder="Ex: Promoção de verão na pousada" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} placeholder="Conte um pouco sobre o seu negócio ou promoção..." />
          </div>
          <div>
            <Label>URL da imagem</Label>
            <Input value={form.imagem_url} onChange={e => setForm(f => ({ ...f, imagem_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Pousada, Restaurante, Loja" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Texto do botão</Label>
              <Input value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="Ex: Ver oferta" />
            </div>
            <div>
              <Label>Link do botão</Label>
              <Input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-primary hover:bg-orange-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Anúncio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
