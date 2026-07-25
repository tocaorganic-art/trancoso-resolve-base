import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Selo Prestador Fundador — visual distinto do selo de prestador verificado.
// Exibe a posição única do fundador quando disponível.
export default function FounderBadge({ position, className, size = "md" }) {
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };
  const iconSize = size === "lg" ? "w-4 h-4" : size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full whitespace-nowrap",
        "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm",
        sizes[size],
        className
      )}
    >
      <Crown className={iconSize} />
      {position ? `Prestador Fundador nº ${String(position).padStart(3, "0")}` : "Prestador Fundador"}
    </span>
  );
}