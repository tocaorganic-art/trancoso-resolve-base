import { Clock } from "lucide-react";

export default function BadgeEmVerificacao() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" />
      Em verificação
    </span>
  );
}