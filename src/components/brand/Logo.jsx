import { cn } from "@/lib/utils";

// Logo oficial Trancoso Resolve — SVG inline (não depende de arquivo externo).
// Squircle laranja (#E8571A) + igreja São João Batista branca.
export function LogoMark({ className = "h-12 w-12", title = "Trancoso Resolve", ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <rect width="64" height="64" rx="16" fill="#E8571A" />
      <rect x="30.7" y="9" width="2.6" height="11" rx="1.3" fill="#FFFFFF" />
      <rect x="27.5" y="12.2" width="9" height="2.6" rx="1.3" fill="#FFFFFF" />
      <path d="M32 18.5 L17 32.5 L17 53 Q17 54 18 54 L46 54 Q47 54 47 53 L47 32.5 Z" fill="#FFFFFF" />
      <path d="M27.5 54 L27.5 44.5 Q27.5 39.5 32 39.5 Q36.5 39.5 36.5 44.5 L36.5 54 Z" fill="#C1440E" />
      <circle cx="32" cy="32.5" r="3.1" fill="#C1440E" />
    </svg>);
}

// Lockup completo: símbolo + "Trancoso" (Nunito 700) + "RESOLVE" (Nunito 900, caixa-alta).
export default function Logo({ className, markClassName = "h-12 w-12", textClassName = "", showText = true }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {showText &&
        <span className={cn("font-nunito leading-none flex flex-col", textClassName)}>
          <span className="font-bold tracking-wide text-[#241D16] dark:text-white text-[0.95em]">Trancoso</span>
          <span className="font-black uppercase tracking-tight text-[#E8571A] text-[1.15em]">RESOLVE</span>
        </span>
      }
    </span>);
}
