// Step 2: Business Type Selection - Dynamic for all sectors
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CountryCode } from '@/lib/setupBusinessTypes';
import { useState, useMemo } from 'react';
import { getBusinessTypesForArea, BusinessTypeData } from '@/lib/allBusinessTypes';

interface SetupStepTypeProps {
  countryCode: CountryCode;
  areaId: string;
  value: string;
  onChange: (typeId: string, typeLabel: string) => void;
}

export const SetupStepType = ({ countryCode, areaId, value, onChange }: SetupStepTypeProps) => {
  const [search, setSearch] = useState('');
  
  // Get language based on country
  const lang = countryCode === 'BR' ? 'pt-BR' : 'es';
  
  // Get business types for the selected area
  const businessTypes = useMemo(() => getBusinessTypesForArea(areaId), [areaId]);
  
  // Filter types based on search
  const displayTypes = useMemo(() => {
    if (search.length < 2) return businessTypes;
    
    const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return businessTypes.filter((bt: BusinessTypeData) => {
      const label = bt.labels[lang].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const desc = bt.description[lang].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return label.includes(normalizedSearch) || desc.includes(normalizedSearch);
    });
  }, [search, lang, businessTypes]);

  const title = lang === 'pt-BR' ? 'Qual é o tipo do seu negócio?' : '¿Qué tipo de negocio es?';
  const subtitle = lang === 'pt-BR' ? 'Selecione o tipo que melhor te descreve' : 'Seleccioná el tipo que mejor te describe';
  const searchPlaceholder = lang === 'pt-BR' ? 'Buscar tipo de negócio...' : 'Buscar tipo de negocio...';
  const noResultsText = lang === 'pt-BR' ? 'Não encontramos tipos com' : 'No encontramos tipos con';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-secondary/50"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto max-h-[450px] overflow-y-auto pr-2 pb-4">
        {displayTypes.map((bt: BusinessTypeData, idx: number) => {
          const isSelected = value === bt.id;
          const label = bt.labels[lang];
          const description = bt.description[lang];
          
          return (
            <motion.button
              key={bt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onChange(bt.id, label)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-300 text-left group',
                'hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card hover:bg-accent/5'
              )}
            >
              {/* Gradient background on hover/select */}
              <div className={cn(
                'absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300',
                bt.gradient,
                isSelected ? 'opacity-100' : 'group-hover:opacity-60'
              )} />
              
              <div className="relative z-10">
                {/* Emoji */}
                <span className="text-4xl mb-3 block" role="img" aria-label={label}>
                  {bt.emoji}
                </span>
                
                {/* Label */}
                <span className="text-sm font-semibold text-foreground block leading-tight mb-1">
                  {label}
                </span>
                
                {/* Description */}
                <span className="text-xs text-muted-foreground block line-clamp-2">
                  {description}
                </span>
              </div>
              
              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-20"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {displayTypes.length === 0 && search.length >= 2 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground py-8"
        >
          {noResultsText} "{search}"
        </motion.p>
      )}
    </div>
  );
};
