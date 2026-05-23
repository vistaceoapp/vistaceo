import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/hooks/use-subscription";
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

// Orden y visibilidad predeterminados.
// Solo `aiSummary` (Centro de inteligencia) queda fijo (locked).
// El resto se puede ocultar y reordenar libremente desde "Personalizar".
const DEFAULT_WIDGETS: WidgetConfig[] = [
  // Main column
  { id: "aiSummary", name: "Centro de inteligencia", icon: "Sparkles", visible: true, order: 0, section: "main", locked: true },
  { id: "health", name: "Salud del negocio", icon: "Heart", visible: true, order: 1, section: "main" },
  { id: "opportunities", name: "Radar de oportunidades", icon: "Radar", visible: true, order: 2, section: "main" },
  { id: "missions", name: "Misiones en curso", icon: "Target", visible: true, order: 3, section: "main" },
  // Sidebar
  { id: "focus", name: "Foco actual del negocio", icon: "Crosshair", visible: true, order: 0, section: "sidebar" },
  { id: "brain", name: "Conocimiento del negocio", icon: "Brain", visible: true, order: 1, section: "sidebar" },
  // Opcionales (apagados por defecto)
  { id: "talkToCEO", name: "Contarle más a tu CEO", icon: "MessageCircle", visible: false, order: 4, section: "main" },
  { id: "predictions", name: "Predicciones", icon: "Orbit", visible: false, order: 5, section: "main" },
  { id: "weeklyMetrics", name: "Métricas semanales", icon: "BarChart3", visible: false, order: 6, section: "main" },
  { id: "pulse", name: "Registro rápido", icon: "TrendingUp", visible: false, order: 7, section: "main" },
  { id: "radar", name: "Radar Pro", icon: "Radar", visible: false, order: 2, section: "sidebar" },
  { id: "reputation", name: "Reputación", icon: "Star", visible: false, order: 3, section: "sidebar" },
];

export const useWidgetConfig = () => {
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);

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
          const savedConfig = settings.widgetConfig as WidgetConfig[];
          const mergedConfig = DEFAULT_WIDGETS.map(defaultWidget => {
            const saved = savedConfig.find(w => w.id === defaultWidget.id);
            // Locked widgets siempre fuerzan defaults del sistema
            if (defaultWidget.locked) {
              return { ...defaultWidget, visible: true };
            }
            // Para no-locked, respetamos visible/order/section del usuario
            if (saved) {
              return {
                ...defaultWidget,
                visible: saved.visible,
                order: typeof saved.order === "number" ? saved.order : defaultWidget.order,
                section: saved.section || defaultWidget.section,
              };
            }
            return defaultWidget;
          });
          setWidgets(mergedConfig);
          setLoading(false);
          return;
        }
      }
      setWidgets(DEFAULT_WIDGETS);
    } catch (error) {
      console.error("Error loading widget config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = useCallback(async (newWidgets: WidgetConfig[]) => {
    if (!currentBusiness) return;

    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("settings")
        .eq("id", currentBusiness.id)
        .single();

      const currentSettings = (business?.settings as Record<string, unknown>) || {};

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
      throw error;
    }
  }, [currentBusiness]);

  const toggleWidget = useCallback((widgetId: string) => {
    let updated: WidgetConfig[] = [];
    setWidgets(prev => {
      updated = prev.map(w =>
        w.id === widgetId && !w.locked ? { ...w, visible: !w.visible } : w
      );
      return updated;
    });
    return updated;
  }, []);

  const reorderWidgets = useCallback((section: "main" | "sidebar", fromIndex: number, toIndex: number) => {
    let updated: WidgetConfig[] = [];
    setWidgets(prev => {
      const sectionWidgets = prev.filter(w => w.section === section).sort((a, b) => a.order - b.order);
      const otherWidgets = prev.filter(w => w.section !== section);
      const [removed] = sectionWidgets.splice(fromIndex, 1);
      if (!removed) return prev;
      sectionWidgets.splice(toIndex, 0, removed);
      const reordered = sectionWidgets.map((w, idx) => ({ ...w, order: idx }));
      updated = [...otherWidgets, ...reordered];
      return updated;
    });
    return updated;
  }, []);

  const getVisibleWidgets = useCallback((section: "main" | "sidebar") => {
    return widgets
      .filter(w => w.section === section && w.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  const resetToDefaults = useCallback(async () => {
    setWidgets(DEFAULT_WIDGETS);
    // Persistir reset al backend para que no vuelva la config vieja
    if (currentBusiness) {
      try {
        const { data: business } = await supabase
          .from("businesses")
          .select("settings")
          .eq("id", currentBusiness.id)
          .single();
        const currentSettings = (business?.settings as Record<string, unknown>) || {};
        const updatedSettings = {
          ...currentSettings,
          widgetConfig: DEFAULT_WIDGETS.map(w => ({ ...w, locked: w.locked ?? false })),
        };
        await supabase
          .from("businesses")
          .update({ settings: updatedSettings as Json })
          .eq("id", currentBusiness.id);
      } catch (e) {
        console.error("Error resetting widget config:", e);
      }
    }
    return DEFAULT_WIDGETS;
  }, [currentBusiness]);

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
