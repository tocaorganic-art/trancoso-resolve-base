import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileSelector from "@/components/MobileSelector";

/**
 * ResponsiveSelect — mantém o Select Radix no desktop (web inalterada)
 * e usa o MobileSelector (bottom sheet nativo via Drawer) em telas <= 768px.
 * Props: value, onValueChange, placeholder, options [{value,label}], className, triggerPrefix
 */
export default function ResponsiveSelect({ value, onValueChange, placeholder = "Selecionar...", options = [], className, triggerPrefix = null }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileSelector
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        options={options}
        className={className}
      />
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        {triggerPrefix}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}