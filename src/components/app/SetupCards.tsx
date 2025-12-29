import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Area icons mapping
const AREA_ICONS: Record<string, string> = {
  A1_GASTRO: '🍽️',
  A2_TURISMO: '✈️',
  A3_RETAIL: '🛒',
  A4_SALUD: '💆',
  A5_EDUCACION: '📚',
  A6_B2B: '💼',
  A7_HOGAR_SERV: '🏠',
  A8_CONSTRU_INMO: '🏗️',
  A9_LOGISTICA: '🚚',
  A10_AGRO: '🌾',
};

interface AreaCardProps {
  id: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function AreaCard({ id, label, selected, onClick }: AreaCardProps) {
  const icon = AREA_ICONS[id] || '📦';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        selected
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-200",
        selected ? "bg-primary/20 scale-110" : "bg-secondary group-hover:scale-105"
      )}>
        {icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <p className={cn(
          "font-semibold text-sm leading-tight",
          selected ? "text-primary" : "text-foreground"
        )}>
          {label}
        </p>
      </div>
      
      {/* Check indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

interface BusinessTypeCardProps {
  id: string;
  label: string;
  definition?: string;
  areaLabel?: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function BusinessTypeCard({ 
  id, 
  label, 
  definition, 
  areaLabel,
  selected, 
  onClick,
  compact = false
}: BusinessTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col text-left rounded-xl border-2 transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        compact ? "p-3" : "p-4",
        selected
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md shadow-primary/20"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn(
          "font-medium leading-tight",
          compact ? "text-sm" : "text-base",
          selected ? "text-primary" : "text-foreground"
        )}>
          {label}
        </p>
        
        {selected && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {areaLabel && (
        <span className="text-xs text-muted-foreground mt-1">{areaLabel}</span>
      )}
      
      {definition && !compact && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {definition}
        </p>
      )}
    </button>
  );
}

interface CountryCardProps {
  code: string;
  name: string;
  flag: string;
  selected: boolean;
  onClick: () => void;
}

export function CountryCard({ code, name, flag, selected, onClick }: CountryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-1",
        selected
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span className={cn(
        "text-5xl mb-3 transition-transform duration-200",
        selected ? "scale-110" : "group-hover:scale-110"
      )}>
        {flag}
      </span>
      <p className={cn(
        "font-semibold text-sm",
        selected ? "text-primary" : "text-foreground"
      )}>
        {name}
      </p>
      
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

interface SearchResultCardProps {
  label: string;
  areaLabel: string;
  definition?: string;
  onClick: () => void;
}

export function SearchResultCard({ label, areaLabel, definition, onClick }: SearchResultCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-150",
        "border border-transparent hover:border-primary/30",
        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent"
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-lg">✨</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-primary/80 font-medium">{areaLabel}</p>
        {definition && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{definition}</p>
        )}
      </div>
    </button>
  );
}
