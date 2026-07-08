import React, { useState } from "react";
import { trackSolicitacaoServico } from '@/utils/analytics';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ArrowLeft, Check, ChevronRight, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SlotPicker from "@/components/agenda/SlotPicker";
import ServiceLocationMap from "@/components/map/ServiceLocationMap";

const formatPhone = (value) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 3) return `(${digits}`;
  if (digits.length < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function BookingForm({ provider, services, user, onCancel }) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState({
    client_name: user?.full_name || "",
    client_phone: "",
    service_id: services?.length === 1 ? services[0].id : "",
    date: undefined,
    time: "",
    message: "",
    location: { address: '', number: '', complement: '', reference: '', lat: null, lng: null },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => base44.entities.ServiceRequest.create(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['serviceRequests'] });
      const previous = queryClient.getQueryData(['serviceRequests']);
      const optimistic = { ...payload, id: 'temp-' + Date.now(), status: 'Pendente' };
      queryClient.setQueryData(['serviceRequests'], (old) => old ? [optimistic, ...old] : [optimistic]);
      return { previous };
    },
    onSuccess: (_result, payload) => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      const selectedService = services?.find(s => s.id === payload.service_id);
      trackSolicitacaoServico({
        service_title: selectedService?.title || provider?.full_name || '',
        category: selectedService?.category || '',
        price: selectedService?.price || 0,
      });
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(['serviceRequests'], context.previous);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    },
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const updateLocation = (field, value) => setData(prev => ({
    ...prev,
    location: { ...prev.location, [field]: value }
  }));

  const handleNext = () => {
    if (!data.client_name.trim()) return toast.error("Informe seu nome.");
    if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(data.client_phone)) return toast.error("Informe um telefone válido.");
    if (!data.service_id) return toast.error("Selecione um serviço.");
    if (!data.date) return toast.error("Selecione uma data.");
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.location.lat || !data.location.lng) return toast.error("Selecione uma localização no mapa.");
    if (!data.location.address.trim()) return toast.error("Preencha a rua/avenida.");
    if (!user?.id || !user?.email) return toast.error("Erro: usuário não autenticado. Faça login novamente.");
    
    // Buscar email do prestador antes de criar a solicitação
    const createRequest = async () => {
      try {
        // Buscar ServiceProvider pelo ID para pegar o email
        const providers = await base44.entities.ServiceProvider.filter({ id: provider.id });
        const providerEmail = providers[0]?.email || providers[0]?.created_by || provider.email;
        
        mutation.mutate({
          ...data,
          client_id: user.id,
          client_email: user.email,
          provider_id: provider.id,
          provider_email: providerEmail,
          date: data.date ? format(data.date, "yyyy-MM-dd") : null,
          time: data.time || null,
        });
      } catch (error) {
        toast.error("Erro ao buscar dados do prestador.");
      }
    };
    
    createRequest();
  };

  if (success) {
    return (
      <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-cyan-50">
        <CardContent className="p-8 text-center">
          <PartyPopper className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
          <p className="text-slate-600 mb-6">
            {provider.full_name.split(' ')[0]} foi notificado e entrará em contato em breve para confirmar.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to={createPageUrl("MeusPedidos")}>
              <Button>Ver Meus Pedidos</Button>
            </Link>
            <Button variant="outline" onClick={onCancel}>Fechar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {step === 1 && (
            <>
              <p className="text-sm font-semibold text-slate-500 mb-4">Etapa 1 de 2 — Detalhes do agendamento</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Seu Nome *</Label>
                  <Input value={data.client_name} onChange={e => update('client_name', e.target.value)} />
                </div>
                <div>
                  <Label>Telefone (WhatsApp) *</Label>
                  <Input
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    value={data.client_phone}
                    onChange={e => update('client_phone', formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>

              {services && services.length > 0 && (
                <div>
                  <Label>Serviço Desejado *</Label>
                  <Select value={data.service_id} onValueChange={v => update('service_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title} — R$ {s.price.toFixed(2)} / {s.price_unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Data Desejada *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.date ? format(data.date, "PPP", { locale: ptBR }) : "Escolha uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data.date}
                      onSelect={date => update('date', date)}
                      initialFocus
                      locale={ptBR}
                      disabled={date => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {data.date && (
                <div>
                  <Label>Horário Disponível</Label>
                  <div className="mt-1">
                    <SlotPicker
                      providerId={provider.id}
                      selectedDate={data.date}
                      selectedTime={data.time}
                      onTimeSelect={time => update('time', time || "")}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={data.message}
                  onChange={e => update('message', e.target.value)}
                  placeholder="Detalhes adicionais, necessidades especiais..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
                <Button type="button" onClick={handleNext} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600">
                  Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm font-semibold text-slate-500 mb-4">Etapa 2 de 2 — Localização do serviço</p>

              <div>
                <Label>Onde o serviço será realizado?</Label>
                <ServiceLocationMap
                  initialPosition={[-16.5925, -39.0931]}
                  onLocationSelect={pos => {
                    updateLocation('lat', pos[0]);
                    updateLocation('lng', pos[1]);
                  }}
                />
                {data.location.lat && (
                  <p className="text-xs text-slate-500 mt-1">
                    📍 Localização selecionada: {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="sm:col-span-2">
                  <Label>Rua / Avenida *</Label>
                  <Input
                    value={data.location.address}
                    onChange={e => updateLocation('address', e.target.value)}
                    placeholder="Ex: Rua das Flores"
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    value={data.location.number}
                    onChange={e => updateLocation('number', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <Label>Complemento</Label>
                <Input value={data.location.complement} onChange={e => updateLocation('complement', e.target.value)} placeholder="Apto, casa..." />
              </div>
              <div>
                <Label>Ponto de Referência</Label>
                <Input value={data.location.reference} onChange={e => updateLocation('reference', e.target.value)} placeholder="Próximo à..." />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                  {mutation.isPending ? "Enviando..." : <><Check className="w-4 h-4 mr-1" /> Confirmar Agendamento</>}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}