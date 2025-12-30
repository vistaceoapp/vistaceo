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

// Enhanced sector data with icons, colors, and descriptions - using actual area IDs from JSON
const SECTOR_DATA: Record<string, { 
  icon: string; 
  gradient: string; 
  description: { es: string; 'pt-BR': string };
}> = {
  // A1_GASTRO - Gastronomía y bebidas
  A1_GASTRO: { 
    icon: '🍽️', 
    gradient: 'from-orange-500/20 to-red-500/20',
    description: { 
      es: 'Restaurantes, cafés, bares y más', 
      'pt-BR': 'Restaurantes, cafés, bares e mais' 
    }
  },
  // A2_TURISMO - Turismo, hotelería, ocio y eventos
  A2_TURISMO: { 
    icon: '🏨', 
    gradient: 'from-sky-500/20 to-blue-500/20',
    description: { 
      es: 'Hoteles, viajes, eventos y entretenimiento', 
      'pt-BR': 'Hotéis, viagens, eventos e entretenimento' 
    }
  },
  // A3_RETAIL - Comercio minorista y e-commerce
  A3_RETAIL: { 
    icon: '🛍️', 
    gradient: 'from-pink-500/20 to-purple-500/20',
    description: { 
      es: 'Tiendas físicas y ventas online', 
      'pt-BR': 'Lojas físicas e vendas online' 
    }
  },
  // A4_SALUD - Salud, bienestar y belleza
  A4_SALUD: { 
    icon: '💆', 
    gradient: 'from-rose-500/20 to-pink-500/20',
    description: { 
      es: 'Clínicas, spas, peluquerías y más', 
      'pt-BR': 'Clínicas, spas, salões e mais' 
    }
  },
  // A5_EDUCACION - Educación, formación y academias
  A5_EDUCACION: { 
    icon: '🎓', 
    gradient: 'from-indigo-500/20 to-violet-500/20',
    description: { 
      es: 'Colegios, academias y capacitación', 
      'pt-BR': 'Escolas, academias e capacitação' 
    }
  },
  // A6_B2B - Servicios profesionales y B2B
  A6_B2B: { 
    icon: '💼', 
    gradient: 'from-blue-500/20 to-cyan-500/20',
    description: { 
      es: 'Consultorías, agencias y servicios corporativos', 
      'pt-BR': 'Consultorias, agências e serviços corporativos' 
    }
  },
  // A7_HOGAR_SERV - Hogar, mantenimiento y servicios técnicos
  A7_HOGAR_SERV: { 
    icon: '🔧', 
    gradient: 'from-amber-500/20 to-yellow-500/20',
    description: { 
      es: 'Reparaciones, instalaciones y servicios del hogar', 
      'pt-BR': 'Reparos, instalações e serviços domésticos' 
    }
  },
  // A8_CONSTRU_INMO - Construcción, inmobiliario y gestión de propiedades
  A8_CONSTRU_INMO: { 
    icon: '🏗️', 
    gradient: 'from-gray-500/20 to-slate-500/20',
    description: { 
      es: 'Construcción, inmuebles y propiedades', 
      'pt-BR': 'Construção, imóveis e propriedades' 
    }
  },
  // A9_LOGISTICA - Transporte, logística y movilidad
  A9_LOGISTICA: { 
    icon: '🚚', 
    gradient: 'from-emerald-500/20 to-green-500/20',
    description: { 
      es: 'Transporte, envíos y movilidad', 
      'pt-BR': 'Transporte, entregas e mobilidade' 
    }
  },
  // A10_AGRO - Agro, ganadería y agroindustria
  A10_AGRO: { 
    icon: '🌾', 
    gradient: 'from-lime-500/20 to-green-500/20',
    description: { 
      es: 'Agricultura, ganadería e industria rural', 
      'pt-BR': 'Agricultura, pecuária e agroindústria' 
    }
  },
};

const DEFAULT_SECTOR = { 
  icon: '🏢', 
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
          <span>{lang === 'pt-BR' ? 'Setor' : 'Sector'}</span>
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
