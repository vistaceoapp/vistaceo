import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { COUNTRY_PACKS, CountryCode, formatCurrency } from '@/lib/countryPacks';
import { SetupData } from '@/lib/setupSteps';

interface SetupStepSliderProps {
  stepId: string;
  countryCode: CountryCode;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precisionDelta?: number) => void;
}

export const SetupStepSlider = ({ stepId, countryCode, data, onUpdate }: SetupStepSliderProps) => {
  const pack = COUNTRY_PACKS[countryCode];

  // Different slider configs per step
  if (stepId === 'S05') {
    // Capacity
    return (
      <div className="space-y-6">
        <SliderField
          label="Capacidad de salón (cubiertos)"
          value={data.seatingCapacity || 40}
          min={0}
          max={200}
          step={5}
          unit=" cubiertos"
          onChange={(v) => onUpdate({ seatingCapacity: v }, 5)}
        />
        <SliderField
          label="Mesas"
          value={data.tablesCount || 10}
          min={0}
          max={50}
          step={1}
          unit=" mesas"
          onChange={(v) => onUpdate({ tablesCount: v })}
        />
        <SliderField
          label="Rotación promedio (minutos)"
          value={data.avgTurnoverMinutes || 60}
          min={15}
          max={180}
          step={5}
          unit=" min"
          onChange={(v) => onUpdate({ avgTurnoverMinutes: v })}
        />
      </div>
    );
  }

  if (stepId === 'S06') {
    // Sales base
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Facturación mensual (rango)</Label>
          <RangeSliderField
            minValue={data.monthlyRevenueMin || 0}
            maxValue={data.monthlyRevenueMax || 5000000}
            min={0}
            max={50000000}
            step={100000}
            formatValue={(v) => formatCurrency(v, countryCode)}
            onChange={(min, max) => onUpdate({ monthlyRevenueMin: min, monthlyRevenueMax: max }, 10)}
          />
        </div>
        
        <div className="space-y-4">
          <Label className="text-base font-medium">Ticket medio (rango)</Label>
          <RangeSliderField
            minValue={data.avgTicketMin || 0}
            maxValue={data.avgTicketMax || 50000}
            min={0}
            max={500000}
            step={500}
            formatValue={(v) => formatCurrency(v, countryCode)}
            onChange={(min, max) => onUpdate({ avgTicketMin: min, avgTicketMax: max }, 5)}
          />
        </div>

        <SliderField
          label="Transacciones por día"
          value={data.dailyTransactionsMin || 50}
          min={0}
          max={500}
          step={5}
          unit=" tx/día"
          onChange={(v) => onUpdate({ dailyTransactionsMin: v, dailyTransactionsMax: v * 1.2 }, 5)}
        />
      </div>
    );
  }

  if (stepId === 'S13') {
    // Costs
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Food Cost (%)</Label>
          <RangeSliderField
            minValue={data.foodCostPercentMin || 25}
            maxValue={data.foodCostPercentMax || 35}
            min={10}
            max={60}
            step={1}
            formatValue={(v) => `${v}%`}
            onChange={(min, max) => onUpdate({ foodCostPercentMin: min, foodCostPercentMax: max }, 10)}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Costos fijos mensuales (rango)</Label>
          <RangeSliderField
            minValue={data.fixedCostsMin || 0}
            maxValue={data.fixedCostsMax || 2000000}
            min={0}
            max={20000000}
            step={50000}
            formatValue={(v) => formatCurrency(v, countryCode)}
            onChange={(min, max) => onUpdate({ fixedCostsMin: min, fixedCostsMax: max }, 5)}
          />
        </div>

        {(data.channelMix?.delivery || 0) > 0 && (
          <SliderField
            label="Comisión apps (%)"
            value={data.appCommissionPercent || 25}
            min={10}
            max={40}
            step={1}
            unit="%"
            onChange={(v) => onUpdate({ appCommissionPercent: v }, 5)}
          />
        )}
      </div>
    );
  }

  if (stepId === 'S14') {
    // Times
    return (
      <div className="space-y-6">
        <SliderField
          label="Tiempo de preparación promedio"
          value={data.avgPrepTimeMinutes || 15}
          min={5}
          max={60}
          step={1}
          unit=" min"
          onChange={(v) => onUpdate({ avgPrepTimeMinutes: v }, 5)}
        />
        <SliderField
          label="Duración servicio promedio"
          value={data.avgServiceDurationMinutes || 45}
          min={15}
          max={120}
          step={5}
          unit=" min"
          onChange={(v) => onUpdate({ avgServiceDurationMinutes: v })}
        />
      </div>
    );
  }

  if (stepId === 'US_TAX') {
    // US specific
    return (
      <div className="space-y-6">
        <SliderField
          label="Sales Tax (%)"
          value={data.salesTaxPercent || 8}
          min={0}
          max={15}
          step={0.25}
          unit="%"
          onChange={(v) => onUpdate({ salesTaxPercent: v }, 5)}
        />
        <SliderField
          label="Tip promedio (%)"
          value={data.tipPercent || 18}
          min={0}
          max={30}
          step={1}
          unit="%"
          onChange={(v) => onUpdate({ tipPercent: v }, 5)}
        />
      </div>
    );
  }

  if (stepId === 'BR_SERVICE') {
    // BR specific
    return (
      <div className="space-y-6">
        <SliderField
          label="Taxa de serviço (%)"
          value={data.serviceFeePercent || 10}
          min={0}
          max={15}
          step={1}
          unit="%"
          onChange={(v) => onUpdate({ serviceFeePercent: v }, 5)}
        />
      </div>
    );
  }

  return null;
};

// Simple slider field
interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const SliderField = ({ label, value, min, max, step, unit, onChange }: SliderFieldProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Label className="text-base font-medium">{label}</Label>
      <span className="text-lg font-semibold text-primary">{value}{unit}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      className="w-full"
    />
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

// Range slider field
interface RangeSliderFieldProps {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  step: number;
  formatValue: (v: number) => string;
  onChange: (min: number, max: number) => void;
}

const RangeSliderField = ({ minValue, maxValue, min, max, step, formatValue, onChange }: RangeSliderFieldProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Mínimo</span>
      <span className="text-base font-semibold text-foreground">{formatValue(minValue)}</span>
    </div>
    <Slider
      value={[minValue]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v, Math.max(v, maxValue))}
      className="w-full"
    />
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Máximo</span>
      <span className="text-base font-semibold text-foreground">{formatValue(maxValue)}</span>
    </div>
    <Slider
      value={[maxValue]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(Math.min(v, minValue), v)}
      className="w-full"
    />
  </div>
);
