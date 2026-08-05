import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const LOCALIDADES = ["Trancoso", "Arraial d'Ajuda", "Porto Seguro", "Caraíva"];
const PERFIS = [
  { value: "cliente", label: "Sou cliente" },
  { value: "prestador", label: "Sou prestador" },
  { value: "lojista", label: "Sou lojista ou empresa" },
];

export default function Participar() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    profile_type: "",
    locality: "",
    category_interest: "",
    whatsapp: "",
    email: "",
    message: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const getUTM = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    };
  };

  const validate = () => {
    if (!form.nome.trim()) return "Informe seu nome.";
    if (!form.profile_type) return "Escolha como deseja participar.";
    if (!form.locality) return "Escolha uma localidade.";
    if (!form.consent) return "É necessário aceitar ser contatado.";
    if (!form.whatsapp.trim() && !form.email.trim())
      return "Informe pelo menos um WhatsApp ou email para contato.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Lead.create({
        nome: form.nome.trim(),
        profile_type: form.profile_type,
        locality: form.locality,
        category_interest: form.category_interest.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        consent: form.consent,
        origem: "pagina-participar",
        lead_status: "new",
        ...getUTM(),
      });
      setDone(true);
      toast.success("Recebemos seu interesse! Em breve entraremos em contato.");
    } catch {
      toast.error("Algo deu errado. Tente novamente ou nos chame no WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full bg-white border-[#E3DED5]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#333333] mb-2">Interesse registrado!</h2>
            <p className="text-[#666] mb-6">
              Recebemos seu interesse! Em breve entraremos em contato.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#F26A21] hover:bg-[#d95a1a] text-white min-h-[44px]"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#F5F5F5] py-10 px-4">
      <div className="container mx-auto max-w-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#333333] font-heading mb-2">
            Escolha como participar
          </h1>
          <p className="text-[#666]">Preencha o formulário abaixo. Entraremos em contato.</p>
        </div>

        <Card className="bg-white border-[#E3DED5]">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-[#333333] font-semibold">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={set("nome")}
                  required
                  className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#333333] font-semibold">Como deseja participar? *</Label>
                <Select value={form.profile_type} onValueChange={set("profile_type")}>
                  <SelectTrigger className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]">
                    <SelectValue placeholder="Escolha uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERFIS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#333333] font-semibold">Localidade *</Label>
                <Select value={form.locality} onValueChange={set("locality")}>
                  <SelectTrigger className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]">
                    <SelectValue placeholder="Escolha uma localidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALIDADES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#333333] font-semibold">
                  Categoria de interesse (opcional)
                </Label>
                <Input
                  id="category"
                  value={form.category_interest}
                  onChange={set("category_interest")}
                  className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                  placeholder="Ex: Eletricista, Pousada, Restaurante…"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-[#333333] font-semibold">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={set("whatsapp")}
                    className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                    placeholder="(73) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#333333] font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    className="min-h-[44px] border-[#E3DED5] focus-visible:ring-[#F26A21]"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <p className="text-xs text-[#888] -mt-2">
                Informe pelo menos um WhatsApp ou email para que possamos entrar em contato.
              </p>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#333333] font-semibold">
                  Mensagem (opcional)
                </Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={set("message")}
                  rows={3}
                  className="border-[#E3DED5] focus-visible:ring-[#F26A21]"
                  placeholder="Conte um pouco sobre o que procura ou oferece"
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={form.consent}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))}
                  className="mt-1 border-[#20382C] data-[state=checked]:bg-[#20382C] data-[state=checked]:border-[#20382C]"
                />
                <Label htmlFor="consent" className="text-sm text-[#555] leading-relaxed cursor-pointer">
                  Aceito ser contatado pela Trancoso Resolve
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#F26A21] hover:bg-[#d95a1a] text-white font-bold min-h-[44px] text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…
                  </>
                ) : (
                  "Enviar meu interesse"
                )}
              </Button>

              <p className="text-xs text-[#999] text-center">
                Não solicitamos documentos, dados financeiros ou informações sensíveis neste formulário.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}