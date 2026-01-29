// Step 0: Country Selection
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountryCode, getCountries } from '@/lib/setupBusinessTypes';


interface SetupStepCountryProps {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
}

// Países ordenados alfabéticamente (solo español)
const COUNTRY_FLAGS: Record<string, string> = {
  AR: '🇦🇷',
  CL: '🇨🇱',
  CO: '🇨🇴',
  CR: '🇨🇷',
  EC: '🇪🇨',
  MX: '🇲🇽',
  PA: '🇵🇦',
  PY: '🇵🇾',
  UY: '🇺🇾',
};

export const SetupStepCountry = ({ value, onChange }: SetupStepCountryProps) => {
  const countries = getCountries();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Dónde está tu negocio?</h2>
        <p className="text-muted-foreground">Esto define moneda, impuestos y plataformas locales</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {countries.map((country, idx) => {
          const isSelected = value === country.code;
          return (
            <motion.button
              key={country.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onChange(country.code as CountryCode)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200',
                'flex flex-col items-center gap-2',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border bg-card'
              )}
            >
              <span className="text-4xl">{COUNTRY_FLAGS[country.code] || '🌍'}</span>
              <span className="text-sm font-medium text-foreground">{country.name}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
