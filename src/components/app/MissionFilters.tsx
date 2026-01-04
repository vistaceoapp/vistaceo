import { useEffect, useCallback } from "react";
import { Filter, Star, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Area categories for filtering
export const AREA_CATEGORIES = [
  { value: "all", label: "Todas las áreas", icon: "🎯" },
  { value: "Reputación", label: "Reputación", icon: "⭐" },
  { value: "Marketing", label: "Marketing", icon: "📱" },
  { value: "Operaciones", label: "Operaciones", icon: "⚙️" },
  { value: "Ventas", label: "Ventas", icon: "💰" },
  { value: "Equipo", label: "Equipo", icon: "👥" },
  { value: "Producto", label: "Producto", icon: "📦" },
  { value: "Finanzas", label: "Finanzas", icon: "📊" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activas" },
  { value: "paused", label: "Pausadas" },
];

export const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "impact", label: "Mayor impacto" },
  { value: "progress", label: "Más avanzadas" },
  { value: "effort", label: "Menor esfuerzo" },
];

const FILTERS_STORAGE_KEY = "mission_filters_v1";
const FILTERS_TTL_MS = 60 * 60 * 1000; // 1 hour

interface FiltersState {
  areaFilter: string;
  statusFilter: string;
  sortBy: string;
  showStarredOnly: boolean;
}

interface StoredFilters extends FiltersState {
  lastUsedAt: number;
  sessionId: string;
}

// Generate a session ID that changes on page reload or new tab
const getSessionId = () => {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("app_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("app_session_id", sessionId);
  }
  return sessionId;
};

export const getDefaultFilters = (): FiltersState => ({
  areaFilter: "all",
  statusFilter: "all",
  sortBy: "recent",
  showStarredOnly: false,
});

export const loadFiltersFromStorage = (): FiltersState => {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return getDefaultFilters();

    const stored: StoredFilters = JSON.parse(raw);
    const now = Date.now();
    const currentSessionId = getSessionId();

    // Reset if session changed or TTL expired
    if (stored.sessionId !== currentSessionId || now - stored.lastUsedAt > FILTERS_TTL_MS) {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
      return getDefaultFilters();
    }

    return {
      areaFilter: stored.areaFilter,
      statusFilter: stored.statusFilter,
      sortBy: stored.sortBy,
      showStarredOnly: stored.showStarredOnly,
    };
  } catch {
    return getDefaultFilters();
  }
};

export const saveFiltersToStorage = (filters: FiltersState) => {
  try {
    const stored: StoredFilters = {
      ...filters,
      lastUsedAt: Date.now(),
      sessionId: getSessionId(),
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

interface MissionFiltersProps {
  areaFilter: string;
  statusFilter: string;
  sortBy: string;
  showStarredOnly: boolean;
  starredCount: number;
  onAreaFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onShowStarredOnlyChange: (value: boolean) => void;
  compact?: boolean;
  className?: string;
}

export const MissionFilters = ({
  areaFilter,
  statusFilter,
  sortBy,
  showStarredOnly,
  starredCount,
  onAreaFilterChange,
  onStatusFilterChange,
  onSortByChange,
  onShowStarredOnlyChange,
  compact = false,
  className,
}: MissionFiltersProps) => {
  // Save to storage whenever filters change
  useEffect(() => {
    saveFiltersToStorage({
      areaFilter,
      statusFilter,
      sortBy,
      showStarredOnly,
    });
  }, [areaFilter, statusFilter, sortBy, showStarredOnly]);

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3",
      compact ? "p-3" : "p-4",
      className
    )}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {!compact && <span className="text-sm font-medium text-foreground">Filtros:</span>}
      </div>
      
      <Select value={areaFilter} onValueChange={onAreaFilterChange}>
        <SelectTrigger className={cn("h-9", compact ? "w-[140px]" : "w-[180px]")}>
          <SelectValue placeholder="Área" />
        </SelectTrigger>
        <SelectContent>
          {AREA_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className={cn("h-9", compact ? "w-[120px]" : "w-[160px]")}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Starred filter */}
      <Button
        variant={showStarredOnly ? "default" : "outline"}
        size="sm"
        className="h-9"
        onClick={() => onShowStarredOnlyChange(!showStarredOnly)}
      >
        <Star className={cn("w-4 h-4", showStarredOnly && "fill-current", !compact && "mr-2")} />
        {!compact && `Destacadas (${starredCount})`}
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className={cn("h-9", compact ? "w-[120px]" : "w-[160px]")}>
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
