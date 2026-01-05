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
      "flex flex-wrap items-center gap-2 sm:gap-3",
      compact ? "p-2 sm:p-3" : "p-3 sm:p-4",
      className
    )}>
      {/* Filter label - hidden on compact/mobile */}
      {!compact && (
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros:</span>
        </div>
      )}
      
      {/* Area filter */}
      <Select value={areaFilter} onValueChange={onAreaFilterChange}>
        <SelectTrigger className={cn(
          "h-10 sm:h-9 min-w-0",
          compact ? "flex-1 min-w-[120px] max-w-[180px]" : "flex-[1_1_160px] min-w-[140px] max-w-[220px]"
        )}>
          <SelectValue placeholder="Área" />
        </SelectTrigger>
        <SelectContent>
          {AREA_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              <span className="mr-2">{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className={cn(
          "h-10 sm:h-9 min-w-0",
          compact ? "flex-1 min-w-[100px] max-w-[140px]" : "flex-[1_1_140px] min-w-[120px] max-w-[180px]"
        )}>
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

      {/* Starred filter - icon only on mobile for touch target */}
      <Button
        variant={showStarredOnly ? "default" : "outline"}
        size="sm"
        className="h-10 sm:h-9 min-w-[44px] px-3 flex-shrink-0"
        onClick={() => onShowStarredOnlyChange(!showStarredOnly)}
      >
        <Star className={cn("w-4 h-4 flex-shrink-0", showStarredOnly && "fill-current")} />
        {!compact && <span className="hidden sm:inline ml-2">Destacadas ({starredCount})</span>}
        {compact && starredCount > 0 && <span className="ml-1 text-xs">{starredCount}</span>}
      </Button>

      {/* Sort - pushed to the end */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className={cn(
            "h-10 sm:h-9 min-w-0",
            compact ? "w-[110px]" : "w-[140px] sm:w-[160px]"
          )}>
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
