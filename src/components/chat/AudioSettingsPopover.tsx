import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Volume2, 
  VolumeX, 
  Settings2,
  Gauge,
  Speaker,
} from "lucide-react";

export interface AudioSettings {
  enabled: boolean;
  speed: number; // 0.7 - 1.2
  autoPlay: boolean;
}

interface AudioSettingsPopoverProps {
  settings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
  isPlaying?: boolean;
  onStop?: () => void;
  compact?: boolean;
}

const speedLabels: Record<number, string> = {
  0.7: "Lento",
  0.85: "Pausado",
  1.0: "Normal",
  1.1: "Rápido",
  1.2: "Muy rápido",
};

export const AudioSettingsPopover = ({
  settings,
  onSettingsChange,
  isPlaying,
  onStop,
  compact = false,
}: AudioSettingsPopoverProps) => {
  const [open, setOpen] = useState(false);

  const handleToggleEnabled = () => {
    const newEnabled = !settings.enabled;
    if (!newEnabled && isPlaying && onStop) {
      onStop();
    }
    onSettingsChange({ ...settings, enabled: newEnabled });
  };

  const handleSpeedChange = (value: number[]) => {
    onSettingsChange({ ...settings, speed: value[0] });
  };

  const handleAutoPlayChange = (checked: boolean) => {
    onSettingsChange({ ...settings, autoPlay: checked });
  };

  const getSpeedLabel = (speed: number) => {
    const closest = Object.keys(speedLabels)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
      );
    return speedLabels[closest];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex-shrink-0 rounded-xl transition-all",
            compact ? "h-9 w-9" : "h-10 w-10",
            settings.enabled 
              ? "text-primary bg-primary/10 hover:bg-primary/20" 
              : "text-muted-foreground hover:bg-muted",
            isPlaying && "animate-pulse"
          )}
        >
          {settings.enabled ? (
            <Volume2 className={cn("transition-all", compact ? "w-4 h-4" : "w-5 h-5")} />
          ) : (
            <VolumeX className={cn("transition-all", compact ? "w-4 h-4" : "w-5 h-5")} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        side="top"
        className="w-72 p-4"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Speaker className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">Configuración de Voz</h4>
            </div>
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">
                  Voz del CEO
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  {settings.enabled ? "Las respuestas se leen en voz alta" : "Solo texto"}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          {/* Speed Control */}
          <div className={cn(
            "space-y-3 transition-opacity",
            !settings.enabled && "opacity-50 pointer-events-none"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Velocidad</Label>
              </div>
              <span className="text-xs font-medium text-primary">
                {getSpeedLabel(settings.speed)} ({settings.speed}x)
              </span>
            </div>
            
            <Slider
              value={[settings.speed]}
              min={0.7}
              max={1.2}
              step={0.05}
              onValueChange={handleSpeedChange}
              className="w-full"
            />
            
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Lento</span>
              <span>Normal</span>
              <span>Rápido</span>
            </div>
          </div>

          {/* Auto-play Toggle */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl bg-secondary/30 transition-opacity",
            !settings.enabled && "opacity-50 pointer-events-none"
          )}>
            <div>
              <Label className="text-sm">Reproducir automáticamente</Label>
              <p className="text-[10px] text-muted-foreground">
                Leer respuestas al recibirlas
              </p>
            </div>
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={handleAutoPlayChange}
              disabled={!settings.enabled}
            />
          </div>

          {/* Status */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">
                Reproduciendo...
              </span>
              {onStop && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStop}
                  className="h-6 px-2 text-xs"
                >
                  Detener
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
