import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PILLARS, COUNTRIES, type PillarKey, type CountryCode } from '@/lib/blog/types';

interface BlogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  pillar: string;
  onPillarChange: (value: string) => void;
  onReset: () => void;
}

export function BlogFilters({
  search,
  onSearchChange,
  country,
  onCountryChange,
  pillar,
  onPillarChange,
  onReset,
}: BlogFiltersProps) {
  const hasFilters = search || country !== 'all' || pillar !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-lg border">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Country filter */}
      <Select value={country} onValueChange={onCountryChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="País" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">🌎 Todos los países</SelectItem>
          {(Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][]).map(([code, { name, flag }]) => (
            <SelectItem key={code} value={code}>
              {flag} {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pillar filter */}
      <Select value={pillar} onValueChange={onPillarChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">📚 Todas las categorías</SelectItem>
          {(Object.entries(PILLARS) as [PillarKey, typeof PILLARS[PillarKey]][]).map(([key, { label, emoji }]) => (
            <SelectItem key={key} value={key}>
              {emoji} {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset button */}
      {hasFilters && (
        <Button variant="ghost" onClick={onReset} className="shrink-0">
          Limpiar
        </Button>
      )}
    </div>
  );
}
