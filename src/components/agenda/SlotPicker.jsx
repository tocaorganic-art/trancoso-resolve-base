import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Clock, CalendarOff } from 'lucide-react';

export default function SlotPicker({ providerId, selectedDate, selectedTime, onTimeSelect }) {
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['providerSchedule', providerId],
    queryFn: async () => {
      const records = await base44.entities.ProviderSchedule.filter({ provider_id: providerId });
      return records?.[0] || null;
    },
    enabled: !!providerId,
  });

  // Fetch existing confirmed requests for the selected date to check conflicts
  const { data: existingRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['requestsForDate', providerId, selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return base44.entities.ServiceRequest.filter({
        provider_id: providerId,
        date: dateStr,
        status: 'Confirmado',
      });
    },
    enabled: !!providerId && !!selectedDate,
    initialData: [],
  });

  const { availableSlots, isBlocked, dayEnabled } = useMemo(() => {
    if (!selectedDate || !schedule) {
      return { availableSlots: [], isBlocked: false, dayEnabled: true };
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const blockedDates = schedule.blocked_dates || [];

    if (blockedDates.includes(dateStr)) {
      return { availableSlots: [], isBlocked: true, dayEnabled: false };
    }

    const dayOfWeek = String(getDay(selectedDate)); // 0=Sun, 1=Mon...
    const dayConfig = schedule.weekly_availability?.[dayOfWeek];

    if (!dayConfig?.enabled) {
      return { availableSlots: [], isBlocked: false, dayEnabled: false };
    }

    const bookedTimes = (existingRequests || []).map(r => r.time).filter(Boolean);
    const slots = (dayConfig.slots || []).filter(slot => !bookedTimes.includes(slot));

    return { availableSlots: slots, isBlocked: false, dayEnabled: true };
  }, [schedule, selectedDate, existingRequests]);

  if (!selectedDate) return null;

  if (isLoadingSchedule || isLoadingRequests) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        Verificando disponibilidade...
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3 text-sm">
        <CalendarOff className="w-4 h-4 shrink-0" />
        <span>Esta data está bloqueada pelo prestador.</span>
      </div>
    );
  }

  if (!dayEnabled) {
    return (
      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-sm">
        <CalendarOff className="w-4 h-4 shrink-0" />
        <span>O prestador não trabalha neste dia da semana.</span>
      </div>
    );
  }

  if (!schedule) {
    // No schedule configured — allow any time, show text input
    return (
      <div className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
        O prestador ainda não configurou horários. Deixe uma observação com o horário desejado.
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 text-sm">
        <Clock className="w-4 h-4 shrink-0" />
        <span>Todos os horários deste dia já estão reservados.</span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">
        Horários disponíveis em {format(selectedDate, "EEEE, dd/MM", { locale: ptBR })}:
      </p>
      <div className="flex flex-wrap gap-2">
        {availableSlots.map(slot => (
          <button
            key={slot}
            type="button"
            onClick={() => onTimeSelect(slot === selectedTime ? null : slot)}
            className={`text-sm px-4 py-2 rounded-lg border font-medium transition-all ${
              selectedTime === slot
                ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                : 'bg-slate-700 text-slate-200 border-slate-600 hover:border-orange-500 hover:bg-slate-600'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
      {selectedTime && (
        <p className="mt-2 text-xs text-green-600 font-medium">✓ Horário selecionado: {selectedTime}</p>
      )}
    </div>
  );
}