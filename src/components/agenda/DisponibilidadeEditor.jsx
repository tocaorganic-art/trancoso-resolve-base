import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Clock, CalendarOff, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

const DAYS = [
  { key: '1', label: 'Segunda-feira' },
  { key: '2', label: 'Terça-feira' },
  { key: '3', label: 'Quarta-feira' },
  { key: '4', label: 'Quinta-feira' },
  { key: '5', label: 'Sexta-feira' },
  { key: '6', label: 'Sábado' },
  { key: '0', label: 'Domingo' },
];

const DEFAULT_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const DEFAULT_AVAILABILITY = DAYS.reduce((acc, d) => {
  acc[d.key] = { enabled: ['1','2','3','4','5'].includes(d.key), slots: ['08:00','09:00','10:00','14:00','15:00','16:00'] };
  return acc;
}, {});

export default function DisponibilidadeEditor({ providerId }) {
  const queryClient = useQueryClient();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['providerSchedule', providerId],
    queryFn: async () => {
      const records = await base44.entities.ProviderSchedule.filter({ provider_id: providerId });
      return records?.[0] || null;
    },
    enabled: !!providerId,
  });

  const [availability, setAvailability] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [customSlotInput, setCustomSlotInput] = useState({});

  // Initialize from fetched data
  React.useEffect(() => {
    if (schedule && !availability) {
      setAvailability(schedule.weekly_availability || DEFAULT_AVAILABILITY);
      setBlockedDates(schedule.blocked_dates || []);
    } else if (!schedule && !isLoading && !availability) {
      setAvailability(DEFAULT_AVAILABILITY);
    }
  }, [schedule, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (schedule?.id) {
        return base44.entities.ProviderSchedule.update(schedule.id, data);
      } else {
        return base44.entities.ProviderSchedule.create({ ...data, provider_id: providerId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerSchedule', providerId] });
      toast.success('Disponibilidade salva com sucesso!');
    },
    onError: () => toast.error('Erro ao salvar disponibilidade.'),
  });

  const toggleDay = (dayKey) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled }
    }));
  };

  const toggleSlot = (dayKey, slot) => {
    setAvailability(prev => {
      const current = prev[dayKey].slots || [];
      const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot].sort();
      return { ...prev, [dayKey]: { ...prev[dayKey], slots: updated } };
    });
  };

  const addCustomSlot = (dayKey) => {
    const val = customSlotInput[dayKey]?.trim();
    if (!val) {
      toast.error('Selecione um horário antes de adicionar.');
      return;
    }
    setAvailability(prev => {
      const current = prev[dayKey].slots || [];
      if (current.includes(val)) return prev;
      return { ...prev, [dayKey]: { ...prev[dayKey], slots: [...current, val].sort() } };
    });
    setCustomSlotInput(prev => ({ ...prev, [dayKey]: '' }));
  };

  const toggleBlockedDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  if (isLoading || !availability) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Weekly availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-blue-600" />
            Horários por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map(day => {
            const dayData = availability[day.key] || { enabled: false, slots: [] };
            return (
              <div key={day.key} className={`rounded-xl border p-4 transition-colors ${dayData.enabled ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-semibold text-slate-800">{day.label}</Label>
                  <Switch checked={dayData.enabled} onCheckedChange={() => toggleDay(day.key)} />
                </div>
                {dayData.enabled && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Clique nos horários para ativar/desativar:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {DEFAULT_SLOTS.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(day.key, slot)}
                          className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                            dayData.slots?.includes(slot)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                      {/* Custom slots not in DEFAULT_SLOTS */}
                      {(dayData.slots || []).filter(s => !DEFAULT_SLOTS.includes(s)).map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(day.key, slot)}
                          className="text-xs px-3 py-1 rounded-full border font-medium bg-green-600 text-white border-green-600"
                        >
                          {slot} ✕
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={customSlotInput[day.key] || ''}
                        onChange={e => setCustomSlotInput(prev => ({ ...prev, [day.key]: e.target.value }))}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <Button type="button" size="sm" variant="outline" onClick={() => addCustomSlot(day.key)} className="text-xs gap-1">
                        <Plus className="w-3 h-3" /> Adicionar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blocked dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="w-5 h-5 text-red-500" />
            Datas Bloqueadas (Folgas / Feriados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Clique nas datas para bloquear/desbloquear.</p>
          <Calendar
            mode="multiple"
            selected={blockedDates.map(d => new Date(d + 'T12:00:00'))}
            onSelect={(dates) => {
              setBlockedDates((dates || []).map(d => format(d, 'yyyy-MM-dd')));
            }}
            locale={ptBR}
            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            className="rounded-xl border"
          />
          {blockedDates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {blockedDates.map(d => (
                <Badge key={d} variant="destructive" className="gap-1 cursor-pointer" onClick={() => setBlockedDates(prev => prev.filter(x => x !== d))}>
                  {format(new Date(d + 'T12:00:00'), "dd/MM/yyyy")}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={() => saveMutation.mutate({ weekly_availability: availability, blocked_dates: blockedDates })}
        disabled={saveMutation.isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
        size="lg"
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar Disponibilidade
      </Button>
    </div>
  );
}