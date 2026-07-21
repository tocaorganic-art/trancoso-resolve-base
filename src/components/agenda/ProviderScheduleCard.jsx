import { Clock, CalendarX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: '0', label: 'Dom' },
  { key: '1', label: 'Seg' },
  { key: '2', label: 'Ter' },
  { key: '3', label: 'Qua' },
  { key: '4', label: 'Qui' },
  { key: '5', label: 'Sex' },
  { key: '6', label: 'Sáb' },
];

export default function ProviderScheduleCard({ provider, schedule, selectedDay }) {
  const weekly = schedule?.weekly_availability;
  const hasSchedule = weekly && Object.keys(weekly).length > 0;

  const renderDayView = () => {
    const dayData = weekly?.[selectedDay];
    if (!dayData?.enabled || !dayData.slots?.length) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarX className="w-4 h-4" />
          Indisponível neste dia
        </div>
      );
    }
    return (
      <div className="flex items-start gap-2 flex-wrap">
        <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex flex-wrap gap-1.5">
          {dayData.slots.map(slot => (
            <Badge key={slot} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
              {slot}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    if (!hasSchedule) {
      return <span className="text-sm text-muted-foreground">Sem horários cadastrados</span>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {DAYS.map(day => {
          const dayData = weekly[day.key];
          const active = dayData?.enabled && dayData.slots?.length;
          return (
            <Badge
              key={day.key}
              variant={active ? "default" : "outline"}
              className={cn(!active && "opacity-40")}
            >
              {day.label}{active ? ` · ${dayData.slots.length}h` : ''}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {provider.photo_url ? (
            <img src={provider.photo_url} alt={provider.full_name} className="w-11 h-11 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary shrink-0">
              {provider.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{provider.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{provider.occupation}</p>
          </div>
          {provider.location?.city && (
            <Badge variant="outline" className="text-xs shrink-0">{provider.location.city}</Badge>
          )}
        </div>
        {selectedDay !== 'all' ? renderDayView() : renderWeekView()}
      </CardContent>
    </Card>
  );
}