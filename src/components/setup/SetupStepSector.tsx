// Step 1: Sector Selection
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAreas, CountryCode } from '@/lib/setupBusinessTypes';

import { useState, useMemo } from 'react';

interface SetupStepSectorProps {
  countryCode: CountryCode;
  value: string;
  onChange: (areaId: string) => void;
}

const SECTOR_ICONS: Record<string, string> = {
  gastronomy: '🍽️',
  retail: '🛍️',
  services: '💼',
  health: '🏥',
  education: '📚',
  tech: '💻',
  manufacturing: '🏭',
  real_estate: '🏢',
  finance: '💰',
  entertainment: '🎭',
  beauty: '💄',
  fitness: '💪',
  automotive: '🚗',
  travel: '✈️',
  default: '🏪',
};

export const SetupStepSector = ({ countryCode, value, onChange }: SetupStepSectorProps) => {
  const [search, setSearch] = useState('');
  const areas = useMemo(() => getAreas(countryCode), [countryCode]);

  const filteredAreas = useMemo(() => {
    if (!search) return areas;
    const q = search.toLowerCase();
    return areas.filter(a => a.label.toLowerCase().includes(q));
  }, [areas, search]);

  const getIcon = (areaId: string) => SECTOR_ICONS[areaId] || SECTOR_ICONS.default;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">¿En qué sector operás?</h2>
        <p className="text-muted-foreground">Seleccioná tu industria principal</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar sector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-secondary/50"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {filteredAreas.map((area, idx) => {
          const isSelected = value === area.id;
          return (
            <motion.button
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onChange(area.id)}
              className={cn(
                'relative p-5 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card'
              )}
            >
              <span className="text-3xl mb-2 block">{getIcon(area.id)}</span>
              <span className="text-base font-medium text-foreground">{area.label}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {filteredAreas.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No encontramos sectores con "{search}"
        </p>
      )}
    </div>
  );
};
