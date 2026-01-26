import { useState, useEffect } from "react";
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
  Gauge,
  Speaker,
  Play,
  Square,
  Zap,
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

const speedPresets = [
  { value: 0.8, label: "Lento", icon: "🐢" },
  { value: 1.0, label: "Normal", icon: "▶️" },
  { value: 1.15, label: "Rápido", icon: "⚡" },
];

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
    // If disabling and audio is playing, stop it
    if (!newEnabled && isPlaying && onStop) {
      onStop();
    }
    onSettingsChange({ ...settings, enabled: newEnabled });
  };

  const handleSpeedPreset = (value: number) => {
    onSettingsChange({ ...settings, speed: value });
  };

  const handleSpeedChange = (value: number[]) => {
    onSettingsChange({ ...settings, speed: value[0] });
  };

  const handleAutoPlayChange = (checked: boolean) => {
    onSettingsChange({ ...settings, autoPlay: checked });
  };

  const getSpeedLabel = () => {
    if (settings.speed <= 0.85) return "Lento";
    if (settings.speed <= 1.05) return "Normal";
    return "Rápido";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "flex-shrink-0 rounded-xl transition-all relative",
            compact ? "h-9 w-9" : "h-10 w-10",
            settings.enabled 
              ? "text-primary bg-primary/10 hover:bg-primary/20" 
              : "text-muted-foreground hover:bg-muted",
            isPlaying && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          {settings.enabled ? (
            <Volume2 className={cn("transition-all", compact ? "w-4 h-4" : "w-5 h-5", isPlaying && "animate-pulse")} />
          ) : (
            <VolumeX className={cn("transition-all", compact ? "w-4 h-4" : "w-5 h-5")} />
          )}
          
          {/* Playing indicator dot */}
          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        side="top"
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Speaker className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-semibold">Voz del CEO</h4>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            settings.enabled 
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          )}>
            {settings.enabled ? "Activada" : "Desactivada"}
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Master Toggle */}
          <div 
            onClick={handleToggleEnabled}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
              settings.enabled 
                ? "bg-primary/10 border-2 border-primary/30" 
                : "bg-secondary/50 border-2 border-transparent hover:border-muted-foreground/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                settings.enabled ? "bg-primary/20" : "bg-muted"
              )}>
                {settings.enabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label className="text-sm font-medium cursor-pointer">
                  Leer respuestas en voz alta
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {settings.enabled ? "El CEO te hablará" : "Solo texto"}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          {/* Speed Presets - Quick Selection */}
          <div className={cn(
            "space-y-3 transition-all",
            !settings.enabled && "opacity-40 pointer-events-none"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Velocidad</Label>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary">
                {getSpeedLabel()} ({settings.speed.toFixed(2)}x)
              </span>
            </div>
            
            {/* Preset buttons */}
            <div className="grid grid-cols-3 gap-2">
              {speedPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleSpeedPreset(preset.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all",
                    Math.abs(settings.speed - preset.value) < 0.08
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
            
            {/* Fine-tune slider */}
            <div className="pt-1">
              <Slider
                value={[settings.speed]}
                min={0.7}
                max={1.2}
                step={0.05}
                onValueChange={handleSpeedChange}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0.7x</span>
                <span>1.0x</span>
                <span>1.2x</span>
              </div>
            </div>
          </div>

          {/* Auto-play Toggle */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl bg-secondary/30 transition-all",
            !settings.enabled && "opacity-40 pointer-events-none"
          )}>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <Label className="text-sm">Reproducción automática</Label>
                <p className="text-[10px] text-muted-foreground">
                  Leer al recibir respuesta
                </p>
              </div>
            </div>
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={handleAutoPlayChange}
              disabled={!settings.enabled}
            />
          </div>

          {/* Playing Status */}
          {isPlaying && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Reproduciendo...
                </span>
              </div>
              {onStop && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStop}
                  className="h-7 px-3 text-xs hover:bg-red-500/10 hover:text-red-500"
                >
                  <Square className="w-3 h-3 mr-1.5 fill-current" />
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
