import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, Lock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PlanCard({
  badge, badgeColor, headerGradient, icon, name, price, priceSuffix,
  trialLabel, benefits, ctaLabel, ctaNote,
  onCta, loading, disabled, popular
}) {
  return (
    <Card className={`shadow-lg overflow-hidden relative flex flex-col ${popular ? 'border-2 border-primary ring-2 ring-primary/20' : 'border border-border'} ${disabled ? 'opacity-60' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 shadow-md">
            <Star className="w-3 h-3 mr-1" /> Mais popular
          </Badge>
        </div>
      )}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`font-bold text-xs ${badgeColor}`}>{badge}</Badge>
        </div>
      )}
      <div className={`p-6 text-center text-primary-foreground ${headerGradient}`}>
        {icon}
        <h2 className="text-xl font-bold mb-1 mt-2">{name}</h2>
        <p className="text-4xl font-extrabold mt-2">
          {price === 0 ? 'R$ 0' : `R$ ${price.toFixed(2).replace('.', ',')}`}
          {priceSuffix && <span className="text-sm font-normal opacity-90">{priceSuffix}</span>}
        </p>
        {trialLabel && (
          <p className="text-xs mt-2 flex items-center justify-center gap-1 opacity-95">
            <Check className="w-3 h-3" /> {trialLabel}
          </p>
        )}
      </div>

      <CardContent className="p-5 flex flex-col flex-1 bg-card">
        <ul className="space-y-2.5 mb-5">
          {benefits.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {!disabled ? (
            <>
              <Button
                className={`w-full text-sm font-bold ${popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                onClick={onCta}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {ctaLabel}
              </Button>

              {price > 0 && (
                <div className="flex items-center gap-2 mt-3 p-2.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 shrink-0 text-primary" />
                  Pagamento seguro via Mercado Pago — cancele quando quiser.
                </div>
              )}

              {ctaNote && <p className="text-xs text-center text-muted-foreground">{ctaNote}</p>}
            </>
          ) : (
            <p className="text-sm text-center py-2 text-muted-foreground">Indisponível.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}