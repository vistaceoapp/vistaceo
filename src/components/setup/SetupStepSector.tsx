// Step 1: Sector Selection - Enhanced UX/UI
import { motion } from 'framer-motion';
import { Check, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAreas, CountryCode } from '@/lib/setupBusinessTypes';
import { useState, useMemo } from 'react';

interface SetupStepSectorProps {
  countryCode: CountryCode;
  value: string;
  onChange: (areaId: string) => void;
}

// Enhanced sector data with icons, colors, and descriptions
const SECTOR_DATA: Record<string, { 
  icon: string; 
  gradient: string; 
  description: { es: string; 'pt-BR': string };
}> = {
  gastronomy: { 
    icon: '🍽️', 
    gradient: 'from-orange-500/20 to-red-500/20',
    description: { 
      es: 'Restaurantes, cafés, bares y más', 
      'pt-BR': 'Restaurantes, cafés, bares e mais' 
    }
  },
  retail: { 
    icon: '🛍️', 
    gradient: 'from-pink-500/20 to-purple-500/20',
    description: { 
      es: 'Tiendas, comercios y ventas', 
      'pt-BR': 'Lojas, comércios e vendas' 
    }
  },
  services: { 
    icon: '💼', 
    gradient: 'from-blue-500/20 to-cyan-500/20',
    description: { 
      es: 'Servicios profesionales', 
      'pt-BR': 'Serviços profissionais' 
    }
  },
  health: { 
    icon: '🏥', 
    gradient: 'from-green-500/20 to-emerald-500/20',
    description: { 
      es: 'Salud y bienestar', 
      'pt-BR': 'Saúde e bem-estar' 
    }
  },
  education: { 
    icon: '📚', 
    gradient: 'from-indigo-500/20 to-violet-500/20',
    description: { 
      es: 'Educación y capacitación', 
      'pt-BR': 'Educação e capacitação' 
    }
  },
  tech: { 
    icon: '💻', 
    gradient: 'from-cyan-500/20 to-blue-500/20',
    description: { 
      es: 'Tecnología y software', 
      'pt-BR': 'Tecnologia e software' 
    }
  },
  manufacturing: { 
    icon: '🏭', 
    gradient: 'from-gray-500/20 to-slate-500/20',
    description: { 
      es: 'Producción e industria', 
      'pt-BR': 'Produção e indústria' 
    }
  },
  real_estate: { 
    icon: '🏢', 
    gradient: 'from-amber-500/20 to-yellow-500/20',
    description: { 
      es: 'Inmuebles y propiedades', 
      'pt-BR': 'Imóveis e propriedades' 
    }
  },
  finance: { 
    icon: '💰', 
    gradient: 'from-emerald-500/20 to-green-500/20',
    description: { 
      es: 'Finanzas e inversiones', 
      'pt-BR': 'Finanças e investimentos' 
    }
  },
  entertainment: { 
    icon: '🎭', 
    gradient: 'from-fuchsia-500/20 to-pink-500/20',
    description: { 
      es: 'Entretenimiento y eventos', 
      'pt-BR': 'Entretenimento e eventos' 
    }
  },
  beauty: { 
    icon: '💄', 
    gradient: 'from-rose-500/20 to-pink-500/20',
    description: { 
      es: 'Belleza y estética', 
      'pt-BR': 'Beleza e estética' 
    }
  },
  fitness: { 
    icon: '💪', 
    gradient: 'from-orange-500/20 to-amber-500/20',
    description: { 
      es: 'Fitness y deportes', 
      'pt-BR': 'Fitness e esportes' 
    }
  },
  automotive: { 
    icon: '🚗', 
    gradient: 'from-red-500/20 to-orange-500/20',
    description: { 
      es: 'Automotriz y transporte', 
      'pt-BR': 'Automotivo e transporte' 
    }
  },
  travel: { 
    icon: '✈️', 
    gradient: 'from-sky-500/20 to-blue-500/20',
    description: { 
      es: 'Turismo y viajes', 
      'pt-BR': 'Turismo e viagens' 
    }
  },
};

const DEFAULT_SECTOR = { 
  icon: '🏪', 
  gradient: 'from-primary/20 to-primary/10',
  description: { es: 'Otros negocios', 'pt-BR': 'Outros negócios' }
};

// Get language based on country
const getLanguage = (countryCode: CountryCode): 'es' | 'pt-BR' => {
  return countryCode === 'BR' ? 'pt-BR' : 'es';
};

export const SetupStepSector = ({ countryCode, value, onChange }: SetupStepSectorProps) => {
  const [search, setSearch] = useState('');
  const areas = useMemo(() => getAreas(countryCode), [countryCode]);
  const lang = getLanguage(countryCode);

  const filteredAreas = useMemo(() => {
    if (!search) return areas;
    const q = search.toLowerCase();
    return areas.filter(a => a.label.toLowerCase().includes(q));
  }, [areas, search]);

  const getSectorData = (areaId: string) => SECTOR_DATA[areaId] || DEFAULT_SECTOR;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'pt-BR' ? 'Passo 1 de 4' : 'Paso 1 de 4'}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'pt-BR' ? 'Em qual setor você opera?' : '¿En qué sector operás?'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'pt-BR' 
            ? 'Selecione sua indústria principal para personalizar sua experiência'
            : 'Seleccioná tu industria principal para personalizar tu experiencia'}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={lang === 'pt-BR' ? 'Buscar setor...' : 'Buscar sector...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {filteredAreas.map((area, idx) => {
          const isSelected = value === area.id;
          const sectorData = getSectorData(area.id);
          
          return (
            <motion.button
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              onClick={() => onChange(area.id)}
              className={cn(
                'relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group',
                'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5'
              )}
            >
              {/* Gradient background on hover/selected */}
              <div className={cn(
                'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300',
                sectorData.gradient,
                (isSelected || 'group-hover:opacity-100') && 'opacity-100'
              )} />
              
              <div className="relative z-10">
                {/* Large emoji icon */}
                <motion.span 
                  className="text-5xl mb-3 block"
                  animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {sectorData.icon}
                </motion.span>
                
                {/* Title */}
                <span className="text-base font-semibold text-foreground block mb-1">
                  {area.label}
                </span>
                
                {/* Description */}
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {sectorData.description[lang]}
                </span>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-muted-foreground">
            {lang === 'pt-BR' 
              ? `Não encontramos setores com "${search}"`
              : `No encontramos sectores con "${search}"`}
          </p>
        </div>
      )}
    </div>
  );
};
