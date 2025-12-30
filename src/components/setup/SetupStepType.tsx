// Step 2: Business Type Selection - Refined UX/UI with emojis
import { motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CountryCode } from '@/lib/setupBusinessTypes';
import { useState, useMemo } from 'react';

// Refined 18 business types for Gastronomía y Bebidas with emojis
const GASTRO_BUSINESS_TYPES = [
  {
    id: 'restaurant_general',
    emoji: '🍽️',
    labels: { es: 'Restaurant General', 'pt-BR': 'Restaurante Geral' },
    description: { es: 'Cocina variada y menú diverso', 'pt-BR': 'Cozinha variada e cardápio diversificado' },
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'alta_cocina',
    emoji: '👨‍🍳',
    labels: { es: 'Alta Cocina - Gourmet', 'pt-BR': 'Alta Gastronomia - Gourmet' },
    description: { es: 'Fine dining y experiencia premium', 'pt-BR': 'Fine dining e experiência premium' },
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'bodegon_cantina',
    emoji: '🍲',
    labels: { es: 'Bodegón - Cantina', 'pt-BR': 'Boteco - Cantina' },
    description: { es: 'Comida casera y ambiente tradicional', 'pt-BR': 'Comida caseira e ambiente tradicional' },
    gradient: 'from-yellow-600/20 to-amber-600/20',
  },
  {
    id: 'parrilla_asador',
    emoji: '🥩',
    labels: { es: 'Parrilla / Asador', 'pt-BR': 'Churrascaria / Assador' },
    description: { es: 'Carnes a la parrilla y cortes', 'pt-BR': 'Carnes na brasa e cortes' },
    gradient: 'from-red-500/20 to-orange-600/20',
  },
  {
    id: 'cocina_criolla',
    emoji: '🫕',
    labels: { es: 'Cocina Criolla / Regional', 'pt-BR': 'Cozinha Regional / Típica' },
    description: { es: 'Sabores locales y tradicionales', 'pt-BR': 'Sabores locais e tradicionais' },
    gradient: 'from-green-600/20 to-yellow-600/20',
  },
  {
    id: 'pescados_mariscos',
    emoji: '🦐',
    labels: { es: 'Pescados, Mariscos y Ceviche', 'pt-BR': 'Peixes, Frutos do Mar e Ceviche' },
    description: { es: 'Especialidad en productos del mar', 'pt-BR': 'Especialidade em frutos do mar' },
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 'pizzeria',
    emoji: '🍕',
    labels: { es: 'Pizzería', 'pt-BR': 'Pizzaria' },
    description: { es: 'Pizzas artesanales y al horno', 'pt-BR': 'Pizzas artesanais e de forno' },
    gradient: 'from-red-500/20 to-yellow-500/20',
  },
  {
    id: 'panaderia',
    emoji: '🥖',
    labels: { es: 'Panadería', 'pt-BR': 'Padaria' },
    description: { es: 'Pan artesanal y productos horneados', 'pt-BR': 'Pães artesanais e produtos assados' },
    gradient: 'from-amber-400/20 to-yellow-500/20',
  },
  {
    id: 'pastas_italiana',
    emoji: '🍝',
    labels: { es: 'Pastas - Cocina Italiana', 'pt-BR': 'Massas - Cozinha Italiana' },
    description: { es: 'Pastas frescas y cocina italiana', 'pt-BR': 'Massas frescas e cozinha italiana' },
    gradient: 'from-green-500/20 to-red-500/20',
  },
  {
    id: 'heladeria',
    emoji: '🍦',
    labels: { es: 'Heladería', 'pt-BR': 'Sorveteria' },
    description: { es: 'Helados artesanales y postres fríos', 'pt-BR': 'Sorvetes artesanais e sobremesas geladas' },
    gradient: 'from-pink-400/20 to-blue-400/20',
  },
  {
    id: 'fast_food',
    emoji: '🍔',
    labels: { es: 'Fast Food (Hamburguesas, Panchos)', 'pt-BR': 'Fast Food (Hambúrgueres, Hot Dogs)' },
    description: { es: 'Incluye food trucks y comida rápida', 'pt-BR': 'Inclui food trucks e comida rápida' },
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'cafeteria_pasteleria',
    emoji: '☕',
    labels: { es: 'Cafetería y Pastelería', 'pt-BR': 'Cafeteria e Confeitaria' },
    description: { es: 'Café de especialidad y dulces', 'pt-BR': 'Café especial e doces' },
    gradient: 'from-amber-600/20 to-pink-400/20',
  },
  {
    id: 'cocina_asiatica',
    emoji: '🍜',
    labels: { es: 'Cocina Asiática (Sushi, Ramen)', 'pt-BR': 'Cozinha Asiática (Sushi, Ramen)' },
    description: { es: 'Sushi, ramen, wok y más', 'pt-BR': 'Sushi, ramen, wok e mais' },
    gradient: 'from-rose-500/20 to-red-600/20',
  },
  {
    id: 'cocina_arabe',
    emoji: '🧆',
    labels: { es: 'Cocina Árabe - Oriental', 'pt-BR': 'Cozinha Árabe - Oriental' },
    description: { es: 'Sabores del medio oriente', 'pt-BR': 'Sabores do oriente médio' },
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    id: 'cocina_saludable',
    emoji: '🥗',
    labels: { es: 'Cocina Saludable / Veggie', 'pt-BR': 'Cozinha Saudável / Veggie' },
    description: { es: 'Vegetariano, vegano y healthy', 'pt-BR': 'Vegetariano, vegano e saudável' },
    gradient: 'from-green-400/20 to-emerald-500/20',
  },
  {
    id: 'bar_cerveceria',
    emoji: '🍺',
    labels: { es: 'Bar / Cervecería / Coctelería', 'pt-BR': 'Bar / Cervejaria / Coquetelaria' },
    description: { es: 'Bebidas, tragos y ambiente nocturno', 'pt-BR': 'Bebidas, drinks e ambiente noturno' },
    gradient: 'from-amber-500/20 to-yellow-600/20',
  },
  {
    id: 'servicio_comida',
    emoji: '📦',
    labels: { es: 'Servicio de Comida', 'pt-BR': 'Serviço de Comida' },
    description: { es: 'Take away, viandas, catering', 'pt-BR': 'Take away, marmitas, catering' },
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 'dark_kitchen',
    emoji: '👻',
    labels: { es: 'Cocina Oculta (Dark/Ghost Kitchen)', 'pt-BR': 'Cozinha Fantasma (Dark/Ghost Kitchen)' },
    description: { es: 'Solo delivery, sin salón', 'pt-BR': 'Apenas delivery, sem salão' },
    gradient: 'from-slate-500/20 to-gray-600/20',
  },
];

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
  
  // Filter types based on search
  const displayTypes = useMemo(() => {
    if (search.length < 2) return GASTRO_BUSINESS_TYPES;
    
    const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return GASTRO_BUSINESS_TYPES.filter(bt => {
      const label = bt.labels[lang].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const desc = bt.description[lang].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return label.includes(normalizedSearch) || desc.includes(normalizedSearch);
    });
  }, [search, lang]);

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
        {displayTypes.map((bt, idx) => {
          const isSelected = value === bt.id;
          const label = bt.labels[lang];
          const description = bt.description[lang];
          
          return (
            <motion.button
              key={bt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
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
