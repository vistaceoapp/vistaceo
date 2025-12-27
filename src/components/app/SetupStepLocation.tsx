import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SetupData } from '@/lib/setupSteps';
import { CountryCode, COUNTRY_PACKS } from '@/lib/countryPacks';

interface SetupStepLocationProps {
  countryCode: CountryCode;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precision?: number) => void;
}

export const SetupStepLocation = ({ countryCode, data, onUpdate }: SetupStepLocationProps) => {
  const [address, setAddress] = useState(data.address || '');
  const [city, setCity] = useState(data.city || '');
  const [radius, setRadius] = useState(data.competitiveRadius || 2);
  
  const countryPack = COUNTRY_PACKS[countryCode];

  const handleAddressChange = (value: string) => {
    setAddress(value);
    onUpdate({ address: value }, value ? 5 : 0);
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    onUpdate({ city: value }, value ? 5 : 0);
  };

  const handleRadiusChange = (value: number[]) => {
    const r = value[0];
    setRadius(r);
    onUpdate({ competitiveRadius: r }, 2);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="Ej: Av. Corrientes 1234"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            placeholder={`Ej: ${countryPack.name === 'Argentina' ? 'Buenos Aires' : countryPack.name}`}
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 bg-card rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="font-medium">Radio competitivo</span>
          </div>
          <span className="text-lg font-bold text-primary">{radius} km</span>
        </div>
        
        <Slider
          value={[radius]}
          onValueChange={handleRadiusChange}
          min={0.5}
          max={10}
          step={0.5}
          className="py-2"
        />
        
        <p className="text-xs text-muted-foreground">
          Analizamos competencia y oportunidades en este radio desde tu ubicación.
        </p>
      </div>

      <Button variant="outline" className="w-full gap-2" disabled>
        <MapPin className="w-4 h-4" />
        Usar mi ubicación actual (próximamente)
      </Button>
    </div>
  );
};
