import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, CalendarDays, Search, Users } from "lucide-react";
import PermissionChecker from "@/components/auth/PermissionChecker";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ProviderScheduleCard from "@/components/agenda/ProviderScheduleCard";

const DAYS = [
  { key: '0', label: 'Dom' },
  { key: '1', label: 'Seg' },
  { key: '2', label: 'Ter' },
  { key: '3', label: 'Qua' },
  { key: '4', label: 'Qui' },
  { key: '5', label: 'Sex' },
  { key: '6', label: 'Sáb' },
];

function AgendaGeralContent() {
  const [selectedDay, setSelectedDay] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [search, setSearch] = useState('');

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['allServiceProviders'],
    queryFn: async () => {
      const result = await base44.entities.ServiceProvider.filter({}, '-rating', 500);
      return Array.isArray(result) ? result : [];
    },
  });

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['allProviderSchedules'],
    queryFn: async () => {
      const result = await base44.entities.ProviderSchedule.filter({}, '-created_date', 500);
      return Array.isArray(result) ? result : [];
    },
  });

  const scheduleByProvider = useMemo(() => {
    const map = {};
    schedules.forEach(s => {
      if (s.provider_id && !map[s.provider_id]) map[s.provider_id] = s;
    });
    return map;
  }, [schedules]);

  const isAvailableOnDay = (providerId, dayKey) => {
    const dayData = scheduleByProvider[providerId]?.weekly_availability?.[dayKey];
    return !!(dayData?.enabled && dayData.slots?.length);
  };

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (p.status_verificacao === 'reprovado') return false;
      const q = search.trim().toLowerCase();
      if (q && !(p.full_name?.toLowerCase().includes(q) || p.occupation?.toLowerCase().includes(q))) return false;
      if (onlyAvailable) {
        if (selectedDay !== 'all') {
          if (!isAvailableOnDay(p.id, selectedDay)) return false;
        } else if (!DAYS.some(d => isAvailableOnDay(p.id, d.key))) {
          return false;
        }
      }
      return true;
    });
  }, [providers, scheduleByProvider, search, onlyAvailable, selectedDay]);

  const isLoading = isLoadingProviders || isLoadingSchedules;

  const availableCount = filteredProviders.filter(p =>
    selectedDay !== 'all' ? isAvailableOnDay(p.id, selectedDay) : DAYS.some(d => isAvailableOnDay(p.id, d.key))
  ).length;

  const hasActiveFilters = selectedDay !== 'all' || onlyAvailable || search.trim() !== '';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-foreground">Agenda Geral</h1>
            <p className="text-sm text-muted-foreground">Horários de todos os profissionais em um só lugar</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-2xl shadow-warm-sm p-4 md:p-5 mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground mr-1">Dia da semana:</span>
            <button
              onClick={() => setSelectedDay('all')}
              className={cn("px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border",
                selectedDay === 'all' ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/50")}
            >
              Todos
            </button>
            {DAYS.map(day => (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={cn("px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border",
                  selectedDay === day.key ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/50")}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou profissão..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="only-available" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
              <Label htmlFor="only-available" className="text-sm font-medium text-foreground cursor-pointer">Apenas disponíveis</Label>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => { setSelectedDay('all'); setOnlyAvailable(false); setSearch(''); }}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span><strong className="text-foreground">{filteredProviders.length}</strong> profissional(is)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span><strong className="text-foreground">{availableCount}</strong> disponível(is)</span>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum profissional encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map(provider => (
              <ProviderScheduleCard
                key={provider.id}
                provider={provider}
                schedule={scheduleByProvider[provider.id]}
                selectedDay={selectedDay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgendaGeralPage() {
  return (
    <PermissionChecker requiredRole="admin">
      <AgendaGeralContent />
    </PermissionChecker>
  );
}