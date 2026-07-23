import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function VerificacaoBadge({ verified, size = "sm", showLabel = false }) {
  if (!verified) return null;

  const sizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-2 align-middle" style={{ verticalAlign: "middle" }}>
            <BadgeCheck className={`${sizes[size]} text-amber-600 fill-amber-50 shrink-0`} />
            {showLabel && (
              <span className="text-xs font-semibold text-amber-700 leading-none">Verificado</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Identidade verificada pela plataforma</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}