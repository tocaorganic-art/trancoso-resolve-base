import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Lightbulb } from "lucide-react";

const CATEGORIES = ["Limpeza", "Garçom", "Pedreiro", "Jardinagem", "Babá", "Eletricista", "Encanador", "Pintor", "Cozinheiro", "Outro"];
const PRICE_UNITS = ["hora", "dia", "serviço", "projeto", "sob consulta"];

// Sugestões de preço médio de mercado por categoria (R$)
const PRICE_SUGGESTIONS = {
  "Limpeza":     { hourly: 35, label: "R$ 30–40/hora" },
  "Garçom":      { hourly: 50, label: "R$ 45–55/hora" },
  "Pedreiro":    { hourly: 60, label: "R$ 55–70/hora" },
  "Jardinagem":  { hourly: 40, label: "R$ 35–45/hora" },
  "Babá":        { hourly: 30, label: "R$ 25–35/hora" },
  "Eletricista": { hourly: 80, label: "R$ 70–100/hora" },
  "Encanador":   { hourly: 80, label: "R$ 70–100/hora" },
  "Pintor":      { hourly: 55, label: "R$ 50–65/hora" },
  "Cozinheiro":  { hourly: 70, label: "R$ 60–80/hora" },
};

// Templates de descrição por categoria
const DESCRIPTION_TEMPLATES = {
  "Limpeza": "Serviço completo de limpeza residencial, incluindo aspiração, varrição, lavagem de banheiros e cozinha, limpeza de superfícies e vidros. Deixo tudo impecável para você!",
  "Garçom": "Serviço profissional para eventos, jantares e festas. Atendimento elegante, uniformizado e pontual para que seu evento seja inesquecível.",
  "Pedreiro": "Serviços de alvenaria, reforma e acabamento. Trabalho com qualidade e atenção aos detalhes, garantindo resistência e estética.",
  "Jardinagem": "Manutenção e criação de jardins, incluindo poda, adubação, plantio e irrigação. Deixo seu espaço verde e bonito.",
  "Babá": "Cuidados carinhosos e responsáveis para crianças de todas as idades. Experiência com atividades educativas e rotina infantil.",
  "Eletricista": "Instalação, manutenção e reparo de sistemas elétricos residenciais e comerciais. Trabalho com segurança e dentro das normas técnicas.",
  "Encanador": "Reparos de vazamentos, entupimentos, instalação de torneiras, chuveiros e tubulações. Atendimento rápido e eficiente.",
  "Pintor": "Pintura interna e externa com acabamento de alta qualidade. Preparo de superfícies, aplicação de massa corrida e tinta.",
  "Cozinheiro": "Preparo de refeições personalizadas para a sua família ou evento. Menu variado com foco na culinária baiana e frutos do mar.",
};

export default function ServiceFormModal({ open, onClose, onSubmit, initialData, isSubmitting }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    not_included: "",
    category: "",
    price: "",
    price_unit: "hora",
    duration_estimate: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        not_included: initialData.not_included || "",
        category: initialData.category || "",
        price: initialData.price?.toString() || "",
        price_unit: initialData.price_unit || "hora",
        duration_estimate: initialData.duration_estimate || "",
      });
    } else {
      setForm({ title: "", description: "", not_included: "", category: "", price: "", price_unit: "hora", duration_estimate: "" });
    }
  }, [initialData, open]);

  const handleCategoryChange = (category) => {
    const suggestion = PRICE_SUGGESTIONS[category];
    setForm(f => ({
      ...f,
      category,
      // Só preenche preço se ainda estiver vazio
      price: f.price || (suggestion ? suggestion.hourly.toString() : f.price),
    }));
  };

  const applyTemplate = () => {
    const template = DESCRIPTION_TEMPLATES[form.category];
    if (template) setForm(f => ({ ...f, description: template }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: parseFloat(form.price) });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ex: Limpeza Residencial Completa" />
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={handleCategoryChange} required>
              <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.category && PRICE_SUGGESTIONS[form.category] && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Média de mercado: <strong>{PRICE_SUGGESTIONS[form.category].label}</strong>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Descrição</Label>
              {form.category && DESCRIPTION_TEMPLATES[form.category] && !form.description && (
                <button type="button" onClick={applyTemplate} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Usar template
                </button>
              )}
            </div>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o que está incluso no serviço..." rows={3} />
          </div>

          <div>
            <Label>O que NÃO está incluso</Label>
            <Textarea value={form.not_included} onChange={e => setForm(f => ({ ...f, not_included: e.target.value }))} placeholder="Ex: Produtos de limpeza, deslocamento..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço (R$) *</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="0.00" />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.price_unit} onValueChange={v => setForm(f => ({ ...f, price_unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICE_UNITS.map(u => <SelectItem key={u} value={u}>por {u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Duração estimada</Label>
            <Input value={form.duration_estimate} onChange={e => setForm(f => ({ ...f, duration_estimate: e.target.value }))} placeholder="Ex: Aprox. 3 horas" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? "Salvar Alterações" : "Criar Serviço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}