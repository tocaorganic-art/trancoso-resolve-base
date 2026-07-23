import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MobileSelector — replaces <Select> on mobile screens.
 * On desktop it renders a standard <select> element styled like shadcn.
 * On mobile (touch devices / narrow screens) it opens a Drawer.
 *
 * Props mirror a subset of shadcn Select:
 *   value, onValueChange, placeholder, options: [{value, label}], className
 */
export default function MobileSelector({ value, onValueChange, placeholder = "Selecionar...", options = [], className }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  if (!isMobile) {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between font-normal", className)}
          style={{ minHeight: 44 }}
        >
          <span className={selected ? "text-foreground" : "text-muted-foreground"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{placeholder}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-1 overflow-y-auto max-h-[60vh]">
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm transition-colors",
                  isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-100 text-slate-800"
                )}
                style={{ minHeight: 44 }}
              >
                {o.label}
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}