import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Check, 
  X,
  Sparkles,
  Target,
  Shield
} from 'lucide-react';
import { SetupData, validatePMO } from '@/lib/setupSteps';
import { CountryCode, formatCurrency } from '@/lib/countryPacks';
import { cn } from '@/lib/utils';

interface SetupStepPreviewProps {
  stepId: string;
  countryCode: CountryCode;
  data: Partial<SetupData>;
  precisionScore: number;
}

export const SetupStepPreview = ({ stepId, countryCode, data, precisionScore }: SetupStepPreviewProps) => {
  // S17 - Price verification preview
  if (stepId === 'S17') {
    const competitors = data.competitors || [];
    const verified = competitors.filter(c => c.hasVerifiedPrices).length;
    const coverage = competitors.length > 0 
      ? Math.round((verified / competitors.length) * 100) 
      : 0;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Cobertura de precios verificados</span>
            <Badge variant="secondary">{coverage}%</Badge>
          </div>
          <Progress value={coverage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {verified} de {competitors.length} competidores con precios públicos verificables.
          </p>
        </div>

        <div className="grid gap-2">
          {competitors.slice(0, 5).map(comp => (
            <div 
              key={comp.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <span className="text-sm font-medium">{comp.name}</span>
              <Badge variant={comp.hasVerifiedPrices ? "default" : "secondary"}>
                {comp.hasVerifiedPrices ? 'Verificado' : 'Pendiente'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // S18 - Opportunities map preview
  if (stepId === 'S18') {
    const mockOpportunities = [
      { title: 'Precio desayuno 15% bajo competencia', impact: 'high', type: 'opportunity' },
      { title: 'Rating superior al promedio zona', impact: 'high', type: 'opportunity' },
      { title: 'Brunch no activado (competencia sí)', impact: 'medium', type: 'opportunity' },
    ];

    const mockRisks = [
      { title: 'Food cost 8% sobre promedio', impact: 'high', type: 'risk' },
      { title: '3 competidores nuevos en 6 meses', impact: 'medium', type: 'risk' },
    ];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Oportunidades detectadas</span>
          </div>
          {mockOpportunities.map((opp, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
            >
              <Target className="w-4 h-4 text-emerald-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{opp.title}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  Impacto {opp.impact === 'high' ? 'alto' : 'medio'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Riesgos a monitorear</span>
          </div>
          {mockRisks.map((risk, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
            >
              <TrendingDown className="w-4 h-4 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{risk.title}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  Impacto {risk.impact === 'high' ? 'alto' : 'medio'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // S19 - PMO validation
  if (stepId === 'S19') {
    const pmo = validatePMO(data);
    
    const pmoSections = [
      { key: 'identity', label: 'Identidad', valid: !pmo.missing.some(m => m.includes('Identidad')) },
      { key: 'model', label: 'Modelo', valid: !pmo.missing.some(m => m.includes('Modelo')) },
      { key: 'sales', label: 'Ventas', valid: !pmo.missing.some(m => m.includes('Ventas')) },
      { key: 'menu', label: 'Menú', valid: !pmo.missing.some(m => m.includes('Menú')) },
      { key: 'costs', label: 'Costos', valid: !pmo.missing.some(m => m.includes('Costos')) },
      { key: 'competition', label: 'Competencia', valid: !pmo.missing.some(m => m.includes('Competencia')) },
    ];

    const validCount = pmoSections.filter(s => s.valid).length;
    const progress = Math.round((validCount / pmoSections.length) * 100);

    return (
      <div className="space-y-4">
        <div className={cn(
          "p-4 rounded-xl border",
          pmo.valid 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-amber-500/10 border-amber-500/30"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <Shield className={cn(
              "w-6 h-6",
              pmo.valid ? "text-emerald-500" : "text-amber-500"
            )} />
            <div>
              <p className="font-medium">
                {pmo.valid ? 'PMO Completo' : 'PMO Incompleto'}
              </p>
              <p className="text-xs text-muted-foreground">
                {validCount} de {pmoSections.length} secciones completas
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-2">
          {pmoSections.map(section => (
            <div 
              key={section.key}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <span className="font-medium">{section.label}</span>
              {section.valid ? (
                <div className="flex items-center gap-1 text-emerald-500">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Completo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-500">
                  <X className="w-4 h-4" />
                  <span className="text-sm">Pendiente</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">Precisión final</span>
          </div>
          <p className="text-3xl font-bold text-primary">{precisionScore}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuanto mayor la precisión, mejores las recomendaciones
          </p>
        </div>
      </div>
    );
  }

  return null;
};
