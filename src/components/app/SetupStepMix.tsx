import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Store, Bike, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelMix {
  dineIn: number;
  delivery: number;
  takeaway: number;
}

interface SetupStepMixProps {
  data: ChannelMix;
  onUpdate: (mix: ChannelMix) => void;
}

const CHANNELS = [
  { key: 'dineIn', label: 'Salón', icon: Store, color: 'bg-primary' },
  { key: 'delivery', label: 'Delivery', icon: Bike, color: 'bg-accent' },
  { key: 'takeaway', label: 'Take away', icon: ShoppingBag, color: 'bg-warning' },
] as const;

export const SetupStepMix = ({ data, onUpdate }: SetupStepMixProps) => {
  const total = data.dineIn + data.delivery + data.takeaway;
  const isValid = total === 100;

  const handleChange = (key: keyof ChannelMix, value: number) => {
    const newData = { ...data, [key]: value };
    const newTotal = Object.values(newData).reduce((a, b) => a + b, 0);
    
    // Auto-adjust other values to maintain 100%
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      const otherKeys = Object.keys(newData).filter(k => k !== key) as (keyof ChannelMix)[];
      const adjustment = diff / otherKeys.length;
      
      otherKeys.forEach(k => {
        newData[k] = Math.max(0, Math.round(newData[k] + adjustment));
      });
      
      // Final adjustment for rounding
      const finalTotal = Object.values(newData).reduce((a, b) => a + b, 0);
      if (finalTotal !== 100) {
        newData[otherKeys[0]] += 100 - finalTotal;
      }
    }
    
    onUpdate(newData);
  };

  return (
    <div className="space-y-6">
      {/* Visual Bar */}
      <div className="h-8 rounded-full overflow-hidden flex bg-muted">
        {CHANNELS.map(channel => {
          const value = data[channel.key];
          if (value === 0) return null;
          return (
            <div
              key={channel.key}
              className={cn("flex items-center justify-center text-xs font-medium text-white transition-all", channel.color)}
              style={{ width: `${value}%` }}
            >
              {value >= 15 && `${value}%`}
            </div>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {CHANNELS.map(channel => {
          const Icon = channel.icon;
          const value = data[channel.key];
          
          return (
            <div key={channel.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", channel.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <Label className="font-medium">{channel.label}</Label>
                </div>
                <span className="text-lg font-bold">{value}%</span>
              </div>
              <Slider
                value={[value]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => handleChange(channel.key, v)}
                className="w-full"
              />
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className={cn(
        "text-center p-3 rounded-xl border",
        isValid ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"
      )}>
        <span className="font-medium">
          Total: {total}% {isValid ? '✓' : '(debe sumar 100%)'}
        </span>
      </div>
    </div>
  );
};
