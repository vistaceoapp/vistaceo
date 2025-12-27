import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SetupData } from '@/lib/setupSteps';

interface SetupStepToggleProps {
  stepId: string;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precision?: number) => void;
}

export const SetupStepToggle = ({ stepId, data, onUpdate }: SetupStepToggleProps) => {
  const hasDifferentPrices = data.hasDifferentPricesByChannel || false;
  const priceDiff = data.channelPriceDiff || 15;

  const handleToggle = (checked: boolean) => {
    onUpdate({ hasDifferentPricesByChannel: checked }, 5);
  };

  const handleDiffChange = (value: number[]) => {
    onUpdate({ channelPriceDiff: value[0] });
  };

  if (stepId === 'S12') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div className="space-y-1">
            <Label htmlFor="price-toggle" className="text-base font-medium">
              Precios diferentes por canal
            </Label>
            <p className="text-sm text-muted-foreground">
              Apps de delivery tienen precios distintos al salón
            </p>
          </div>
          <Switch
            id="price-toggle"
            checked={hasDifferentPrices}
            onCheckedChange={handleToggle}
          />
        </div>

        {hasDifferentPrices && (
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Diferencia promedio</span>
              <span className="text-lg font-bold text-primary">+{priceDiff}%</span>
            </div>
            <Slider
              value={[priceDiff]}
              onValueChange={handleDiffChange}
              min={5}
              max={40}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Esto afecta cómo calculamos tu rentabilidad por canal.
            </p>
          </div>
        )}

        <div className={cn(
          "p-4 rounded-xl border",
          hasDifferentPrices 
            ? "bg-amber-500/10 border-amber-500/30" 
            : "bg-emerald-500/10 border-emerald-500/30"
        )}>
          <p className="text-sm">
            {hasDifferentPrices 
              ? `📊 Consideraremos un +${priceDiff}% en apps cuando calculemos márgenes.`
              : '✓ Usaremos los mismos precios para todos los canales.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
