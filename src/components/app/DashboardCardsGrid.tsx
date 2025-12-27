import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  AlertTriangle,
  Info,
  DollarSign,
  Users,
  Star,
  Clock,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { 
  DashboardCard, 
  CardState, 
  getCardState,
  getCardsForCountry 
} from '@/lib/dashboardCards';
import { CountryCode } from '@/lib/countryPacks';
import { GlassCard } from './GlassCard';
import { AuditDrawer } from './AuditDrawer';
import { cn } from '@/lib/utils';

interface DashboardCardsGridProps {
  countryCode: CountryCode;
  availableData: string[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  market: <Users className="w-4 h-4" />,
  pricing: <DollarSign className="w-4 h-4" />,
  economics: <BarChart3 className="w-4 h-4" />,
  operations: <Clock className="w-4 h-4" />,
  reputation: <Star className="w-4 h-4" />,
  radar: <Target className="w-4 h-4" />,
};

const STATE_STYLES: Record<CardState, { badge: string; border: string; bg: string }> = {
  active: { 
    badge: 'bg-success/10 text-success border-success/30',
    border: 'border-success/30',
    bg: 'bg-success/5'
  },
  estimated: { 
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5'
  },
  blocked: { 
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    border: 'border-destructive/30',
    bg: 'bg-destructive/5'
  },
};

interface CardItemProps {
  card: DashboardCard;
  availableData: string[];
  onClick: () => void;
}

const DashboardCardItem = ({ card, availableData, onClick }: CardItemProps) => {
  const { state, missingData } = getCardState(card, availableData);
  const styles = STATE_STYLES[state];
  const icon = CATEGORY_ICONS[card.category] || <Zap className="w-4 h-4" />;

  return (
    <GlassCard
      interactive
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all",
        styles.border,
        state === 'blocked' && "opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          styles.bg
        )}>
          {state === 'blocked' ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            icon
          )}
        </div>
        <Badge variant="outline" className={cn("text-[10px] px-1.5", styles.badge)}>
          {state === 'active' && 'ACTIVA'}
          {state === 'estimated' && 'ESTIMADA'}
          {state === 'blocked' && 'BLOQUEADA'}
        </Badge>
      </div>
      
      <h4 className={cn(
        "font-medium text-sm mb-1",
        state === 'blocked' ? "text-muted-foreground" : "text-foreground"
      )}>
        {card.title}
      </h4>
      
      <p className="text-xs text-muted-foreground line-clamp-2">
        {card.description}
      </p>

      {/* Mock value for active cards */}
      {state === 'active' && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {card.category === 'pricing' && '+12%'}
            {card.category === 'economics' && '$45K'}
            {card.category === 'reputation' && '4.5★'}
            {card.category === 'operations' && '85%'}
            {card.category === 'market' && '#3'}
            {card.category === 'radar' && '3'}
          </span>
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
      )}

      {state === 'estimated' && (
        <div className="mt-3 flex items-center gap-1 text-xs text-amber-500">
          <AlertTriangle className="w-3 h-3" />
          <span>Datos parciales</span>
        </div>
      )}

      {state === 'blocked' && missingData.length > 0 && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Falta: {missingData[0]}</span>
        </div>
      )}
    </GlassCard>
  );
};

export const DashboardCardsGrid = ({ countryCode, availableData }: DashboardCardsGridProps) => {
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const cards = getCardsForCountry(countryCode);

  // Group cards by category
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, DashboardCard[]>);

  const categoryOrder = ['radar', 'economics', 'pricing', 'market', 'operations', 'reputation'];
  const categoryLabels: Record<string, string> = {
    radar: 'Radar',
    economics: 'Economía',
    pricing: 'Precios',
    market: 'Mercado',
    operations: 'Operaciones',
    reputation: 'Reputación',
  };

  const handleCardClick = (card: DashboardCard) => {
    setSelectedCard(card);
    setAuditOpen(true);
  };

  // Calculate stats
  const stats = {
    active: cards.filter(c => getCardState(c, availableData).state === 'active').length,
    estimated: cards.filter(c => getCardState(c, availableData).state === 'estimated').length,
    blocked: cards.filter(c => getCardState(c, availableData).state === 'blocked').length,
  };

  return (
    <>
      {/* Summary badges */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 whitespace-nowrap">
          {stats.active} Activas
        </Badge>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 whitespace-nowrap">
          {stats.estimated} Estimadas
        </Badge>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 whitespace-nowrap">
          {stats.blocked} Bloqueadas
        </Badge>
      </div>

      {/* Cards by category */}
      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryCards = groupedCards[category];
          if (!categoryCards?.length) return null;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {CATEGORY_ICONS[category]}
                <h3 className="font-semibold text-foreground">{categoryLabels[category]}</h3>
                <span className="text-xs text-muted-foreground">({categoryCards.length})</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryCards.map(card => (
                  <DashboardCardItem
                    key={card.id}
                    card={card}
                    availableData={availableData}
                    onClick={() => handleCardClick(card)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Drawer */}
      <AuditDrawer
        open={auditOpen}
        onOpenChange={setAuditOpen}
        card={selectedCard}
        cardState={selectedCard ? getCardState(selectedCard, availableData) : { state: 'blocked', missingData: [] }}
        availableData={availableData}
      />
    </>
  );
};
