import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import type { Json } from "@/integrations/supabase/types";

export interface WidgetConfig {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
  order: number;
  section: "main" | "sidebar";
  locked?: boolean; // Non-removable widgets
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "health", name: "Salud del negocio", icon: "Heart", visible: true, order: 0, section: "main", locked: true },
  { id: "pulse", name: "Check-in de Pulso", icon: "TrendingUp", visible: true, order: 1, section: "main", locked: true },
  { id: "brain", name: "Conocimiento del negocio", icon: "Brain", visible: true, order: 2, section: "main", locked: true },
  { id: "weeklyMetrics", name: "Métricas semanales", icon: "BarChart3", visible: true, order: 3, section: "main" },
  { id: "missions", name: "Misiones activas", icon: "Target", visible: true, order: 4, section: "main" },
  { id: "focus", name: "Foco actual", icon: "Crosshair", visible: true, order: 0, section: "sidebar" },
  { id: "reputation", name: "Reputación", icon: "Star", visible: true, order: 1, section: "sidebar" },
  { id: "radar", name: "Radar de mercado", icon: "Radar", visible: true, order: 2, section: "sidebar" },
];

export const useWidgetConfig = () => {
  const { currentBusiness } = useBusiness();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [currentBusiness]);

  const loadConfig = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("settings")
        .eq("id", currentBusiness.id)
        .single();

      if (business?.settings) {
        const settings = business.settings as Record<string, any>;
        if (settings.widgetConfig && Array.isArray(settings.widgetConfig)) {
          // Merge saved config with defaults (in case new widgets were added)
          const savedConfig = settings.widgetConfig as WidgetConfig[];
          const mergedConfig = DEFAULT_WIDGETS.map(defaultWidget => {
            const saved = savedConfig.find(w => w.id === defaultWidget.id);
            return saved ? { ...defaultWidget, ...saved } : defaultWidget;
          });
          setWidgets(mergedConfig);
        }
        setIsPro(settings.isPro || false);
      }
    } catch (error) {
      console.error("Error loading widget config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = useCallback(async (newWidgets: WidgetConfig[]) => {
    if (!currentBusiness) return;

    try {
      // Get current settings
      const { data: business } = await supabase
        .from("businesses")
        .select("settings")
        .eq("id", currentBusiness.id)
        .single();

      const currentSettings = (business?.settings as Record<string, unknown>) || {};
      
      // Update with new widget config - convert to JSON-safe format
      const widgetConfigJson = newWidgets.map(w => ({
        id: w.id,
        name: w.name,
        icon: w.icon,
        visible: w.visible,
        order: w.order,
        section: w.section,
        locked: w.locked ?? false,
      }));
      
      const updatedSettings = {
        ...currentSettings,
        widgetConfig: widgetConfigJson,
      };

      await supabase
        .from("businesses")
        .update({ settings: updatedSettings as Json })
        .eq("id", currentBusiness.id);

      setWidgets(newWidgets);
    } catch (error) {
      console.error("Error saving widget config:", error);
    }
  }, [currentBusiness]);

  const toggleWidget = useCallback((widgetId: string) => {
    const updated = widgets.map(w => 
      w.id === widgetId && !w.locked ? { ...w, visible: !w.visible } : w
    );
    setWidgets(updated);
    return updated;
  }, [widgets]);

  const reorderWidgets = useCallback((section: "main" | "sidebar", fromIndex: number, toIndex: number) => {
    const sectionWidgets = widgets.filter(w => w.section === section).sort((a, b) => a.order - b.order);
    const otherWidgets = widgets.filter(w => w.section !== section);
    
    const [removed] = sectionWidgets.splice(fromIndex, 1);
    sectionWidgets.splice(toIndex, 0, removed);
    
    const reordered = sectionWidgets.map((w, idx) => ({ ...w, order: idx }));
    const updated = [...otherWidgets, ...reordered];
    setWidgets(updated);
    return updated;
  }, [widgets]);

  const getVisibleWidgets = useCallback((section: "main" | "sidebar") => {
    return widgets
      .filter(w => w.section === section && w.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    return DEFAULT_WIDGETS;
  }, []);

  return {
    widgets,
    loading,
    isPro,
    saveConfig,
    toggleWidget,
    reorderWidgets,
    getVisibleWidgets,
    resetToDefaults,
  };
};
