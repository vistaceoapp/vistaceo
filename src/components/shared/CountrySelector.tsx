import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { COUNTRY_CONFIG } from "@/hooks/use-country-detection";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/countryPacks";

interface CountrySelectorProps {
  value: string;
  onChange: (code: CountryCode) => void;
  variant?: "light" | "dark";
  showName?: boolean;
  className?: string;
}

/**
 * Selector de país compartido — muestra bandera y permite cambio manual.
 * Si la geolocalización falla, el usuario puede seleccionar su país.
 */
export const CountrySelector = ({
  value,
  onChange,
  variant = "light",
  showName = false,
  className,
}: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const code = value === "DEFAULT" ? "AR" : value;
  const current = COUNTRY_CONFIG[code] || COUNTRY_CONFIG.AR;

  const options = Object.entries(COUNTRY_CONFIG)
    .filter(([c]) => c !== "DEFAULT")
    .sort(([, a], [, b]) => a.name.localeCompare(b.name));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isLight = variant === "light";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`País: ${current.name}. Cambiar país`}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-200 active:scale-[0.97]",
          showName ? "px-3 py-1.5" : "px-2 py-1.5",
          isLight
            ? "border border-border/60 bg-background/80 hover:bg-muted/60 hover:border-border"
            : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        {showName && (
          <span className={cn("text-[12px] font-medium", isLight ? "text-foreground" : "text-white")}>
            {current.name}
          </span>
        )}
        <ChevronDown className={cn("w-3 h-3 transition-transform", isLight ? "text-muted-foreground" : "text-white/60", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 mt-2 w-[220px] max-h-[320px] overflow-y-auto rounded-xl shadow-xl z-50 animate-in fade-in-0 zoom-in-95",
            "border border-border bg-popover text-popover-foreground p-1"
          )}
        >
          {options.map(([c, info]) => {
            const selected = c === code;
            return (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(c as CountryCode);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-left transition-colors",
                  selected ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/60"
                )}
              >
                <span className="text-base leading-none">{info.flag}</span>
                <span className="flex-1 truncate">{info.name}</span>
                {selected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
