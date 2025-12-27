import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Check,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { DashboardCard, CardState, getCardState } from '@/lib/dashboardCards';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface AuditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: DashboardCard | null;
  cardState: { state: CardState; missingData: string[] };
  availableData: string[];
}

export const AuditDrawer = ({ 
  open, 
  onOpenChange, 
  card, 
  cardState, 
  availableData 
}: AuditDrawerProps) => {
  const navigate = useNavigate();
  
  if (!card) return null;

  const coverage = card.requiredData.length > 0
    ? Math.round(((card.requiredData.length - cardState.missingData.length) / card.requiredData.length) * 100)
    : 100;

  const getStateInfo = (state: CardState) => {
    switch (state) {
      case 'active':
        return { 
          label: 'ACTIVA', 
          color: 'text-success', 
          bg: 'bg-success/10',
          description: 'Datos completos, resultados reales'
        };
      case 'estimated':
        return { 
          label: 'ESTIMADA', 
          color: 'text-amber-500', 
          bg: 'bg-amber-500/10',
          description: 'Datos parciales, usando estimaciones'
        };
      case 'blocked':
        return { 
          label: 'BLOQUEADA', 
          color: 'text-destructive', 
          bg: 'bg-destructive/10',
          description: 'Faltan datos críticos'
        };
    }
  };

  const stateInfo = getStateInfo(cardState.state);

  const handleImproveClick = () => {
    // Navigate to chat with prompt about improving this metric
    const prompt = `Quiero mejorar la métrica "${card.title}". ¿Qué datos me faltan y cómo puedo obtenerlos?`;
    navigate(`/app/chat?prompt=${encodeURIComponent(prompt)}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg">{card.title}</SheetTitle>
              <SheetDescription className="mt-1">
                {card.description}
              </SheetDescription>
            </div>
            <Badge className={cn(stateInfo.bg, stateInfo.color, "border-0")}>
              {stateInfo.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* State explanation */}
          <div className={cn("p-4 rounded-xl", stateInfo.bg)}>
            <div className="flex items-center gap-2 mb-2">
              {cardState.state === 'active' && <Check className="w-4 h-4 text-success" />}
              {cardState.state === 'estimated' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              {cardState.state === 'blocked' && <X className="w-4 h-4 text-destructive" />}
              <span className={cn("font-medium", stateInfo.color)}>{stateInfo.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">{stateInfo.description}</p>
          </div>

          {/* Coverage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Cobertura de datos</span>
              </div>
              <span className="text-lg font-bold">{coverage}%</span>
            </div>
            <Progress value={coverage} className="h-2" />
          </div>

          {/* Data sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Fuentes de datos</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.source.map((src, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {src}
                </Badge>
              ))}
            </div>
          </div>

          {/* Required data status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Datos requeridos</span>
            </div>
            <div className="space-y-2">
              {card.requiredData.map((req, i) => {
                const hasData = availableData.includes(req);
                return (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg",
                      hasData ? "bg-success/10" : "bg-muted"
                    )}
                  >
                    <span className="text-sm capitalize">{req.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {hasData ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
              {card.requiredData.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Esta card no requiere datos específicos
                </p>
              )}
            </div>
          </div>

          {/* How to improve */}
          {cardState.state !== 'active' && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Cómo mejorar precisión</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {cardState.missingData.length > 0 
                  ? `Completá los siguientes datos: ${cardState.missingData.join(', ')}`
                  : 'Conectá integraciones para datos en tiempo real'}
              </p>
              <Button onClick={handleImproveClick} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Mejorar esta métrica
              </Button>
            </div>
          )}

          {/* Link to integrations if needed */}
          {cardState.state === 'blocked' && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate('/app/more')}
            >
              <ExternalLink className="w-4 h-4" />
              Ir a integraciones
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
