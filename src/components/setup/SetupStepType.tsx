// Step 2: Business Type Selection
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CountryCode, getBusinessTypes, searchBusinessTypes, getAreaById } from '@/lib/setupBusinessTypes';

import { useState, useMemo } from 'react';

interface SetupStepTypeProps {
  countryCode: CountryCode;
  areaId: string;
  value: string;
  onChange: (typeId: string, typeLabel: string) => void;
}

export const SetupStepType = ({ countryCode, areaId, value, onChange }: SetupStepTypeProps) => {
  const [search, setSearch] = useState('');
  
  const area = useMemo(() => getAreaById(areaId, countryCode), [areaId, countryCode]);
  const businessTypes = useMemo(() => getBusinessTypes(areaId, countryCode), [areaId, countryCode]);
  
  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    return searchBusinessTypes(search, countryCode);
  }, [search, countryCode]);

  const displayTypes = search.length >= 2 ? searchResults : businessTypes;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Qué tipo de negocio es?</h2>
        <p className="text-muted-foreground">
          {area ? `Tipos de ${area.label}` : 'Seleccioná el tipo que mejor te describe'}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar tipo de negocio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-secondary/50"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto max-h-[400px] overflow-y-auto pr-2">
        {displayTypes.map((bt, idx) => {
          const isSelected = value === bt.id;
          const label = bt.label;
          const areaLabel = 'area' in bt ? (bt as any).area?.label : area?.label;
          
          return (
            <motion.button
              key={bt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onChange(bt.id, label)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card'
              )}
            >
              <span className="text-sm font-medium text-foreground block">{label}</span>
              {search.length >= 2 && areaLabel && (
                <span className="text-xs text-muted-foreground mt-1 block">{areaLabel}</span>
              )}
              {bt.definition && (
                <span className="text-xs text-muted-foreground mt-1 block line-clamp-2">{bt.definition}</span>
              )}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {displayTypes.length === 0 && search.length >= 2 && (
        <p className="text-center text-muted-foreground py-8">
          No encontramos tipos con "{search}"
        </p>
      )}
    </div>
  );
};
