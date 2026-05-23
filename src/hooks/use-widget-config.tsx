import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
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
  locked?: boolean;
}

// Orden predeterminado solicitado:
// Main: Centro de inteligencia (locked) → Salud → Radar de oportunidades → Misiones
// Sidebar: Foco actual → Conocimiento del negocio
const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "aiSummary", name: "Centro de inteligencia", icon: "Sparkles", visible: true, order: 0, section: "main", locked: true },
  { id: "health", name: "Salud del negocio", icon: "Heart", visible: true, order: 1, section: "main" },
  { id: "opportunities", name: "Radar de oportunidades", icon: "Radar", visible: true, order: 2, section: "main" },
  { id: "missions", name: "Misiones en curso", icon: "Target", visible: true, order: 3, section: "main" },
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

interface WidgetConfigContextValue {
  widgets: WidgetConfig[];
  loading: boolean;
  isPro: boolean;
  saveConfig: (widgets: WidgetConfig[]) => Promise<void>;
  toggleWidget: (widgetId: string) => WidgetConfig[];
  reorderWidgets: (section: "main" | "sidebar", fromIndex: number, toIndex: number) => WidgetConfig[];
  getVisibleWidgets: (section: "main" | "sidebar") => WidgetConfig[];
  resetToDefaults: () => Promise<WidgetConfig[]>;
}

const WidgetConfigContext = createContext<WidgetConfigContextValue | null>(null);

const persist = async (businessId: string, newWidgets: WidgetConfig[]) => {
  const { data: business } = await supabase
    .from("businesses")
    .select("settings")
    .eq("id", businessId)
    .single();
  const currentSettings = (business?.settings as Record<string, unknown>) || {};
  const widgetConfigJson = newWidgets.map(w => ({
    id: w.id, name: w.name, icon: w.icon, visible: w.visible,
    order: w.order, section: w.section, locked: w.locked ?? false,
  }));
  await supabase
    .from("businesses")
    .update({ settings: { ...currentSettings, widgetConfig: widgetConfigJson } as Json })
    .eq("id", businessId);
};

export const WidgetConfigProvider = ({ children }: { children: ReactNode }) => {
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentBusiness) { setLoading(false); return; }
      setLoading(true);
      try {
        const { data: business } = await supabase
          .from("businesses")
          .select("settings")
          .eq("id", currentBusiness.id)
          .single();
        const settings = (business?.settings as Record<string, any>) || {};
        if (settings.widgetConfig && Array.isArray(settings.widgetConfig)) {
          const saved = settings.widgetConfig as WidgetConfig[];
          const merged = DEFAULT_WIDGETS.map(def => {
            if (def.locked) return { ...def, visible: true };
            const s = saved.find(w => w.id === def.id);
            return s ? { ...def, visible: !!s.visible, order: typeof s.order === "number" ? s.order : def.order, section: s.section || def.section } : def;
          });
          if (!cancelled) setWidgets(merged);
        } else if (!cancelled) {
          setWidgets(DEFAULT_WIDGETS);
        }
      } catch (e) {
        console.error("Error loading widget config:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentBusiness?.id]);

  const scheduleSave = useCallback((next: WidgetConfig[]) => {
    if (!currentBusiness) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(currentBusiness.id, next).catch(e => console.error("Auto-save widget config:", e));
    }, 250);
  }, [currentBusiness?.id]);

  const saveConfig = useCallback(async (newWidgets: WidgetConfig[]) => {
    if (!currentBusiness) return;
    setWidgets(newWidgets);
    await persist(currentBusiness.id, newWidgets);
  }, [currentBusiness?.id]);

  const toggleWidget = useCallback((widgetId: string) => {
    let updated: WidgetConfig[] = [];
    setWidgets(prev => {
      updated = prev.map(w => w.id === widgetId && !w.locked ? { ...w, visible: !w.visible } : w);
      scheduleSave(updated);
      return updated;
    });
    return updated;
  }, [scheduleSave]);

  const reorderWidgets = useCallback((section: "main" | "sidebar", fromIndex: number, toIndex: number) => {
    let updated: WidgetConfig[] = [];
    setWidgets(prev => {
      const sectionWidgets = prev.filter(w => w.section === section).sort((a, b) => a.order - b.order);
      const others = prev.filter(w => w.section !== section);
      if (fromIndex < 0 || fromIndex >= sectionWidgets.length) return prev;
      const [removed] = sectionWidgets.splice(fromIndex, 1);
      if (!removed || removed.locked) return prev;
      const clampedTo = Math.max(0, Math.min(toIndex, sectionWidgets.length));
      sectionWidgets.splice(clampedTo, 0, removed);
      const reordered = sectionWidgets.map((w, idx) => ({ ...w, order: idx }));
      updated = [...others, ...reordered];
      scheduleSave(updated);
      return updated;
    });
    return updated;
  }, [scheduleSave]);

  const getVisibleWidgets = useCallback((section: "main" | "sidebar") => {
    return widgets.filter(w => w.section === section && w.visible).sort((a, b) => a.order - b.order);
  }, [widgets]);

  const resetToDefaults = useCallback(async () => {
    setWidgets(DEFAULT_WIDGETS);
    if (currentBusiness) {
      try { await persist(currentBusiness.id, DEFAULT_WIDGETS); }
      catch (e) { console.error("Reset widget config:", e); }
    }
    return DEFAULT_WIDGETS;
  }, [currentBusiness?.id]);

  return (
    <WidgetConfigContext.Provider value={{ widgets, loading, isPro, saveConfig, toggleWidget, reorderWidgets, getVisibleWidgets, resetToDefaults }}>
      {children}
    </WidgetConfigContext.Provider>
  );
};

export const useWidgetConfig = (): WidgetConfigContextValue => {
  const ctx = useContext(WidgetConfigContext);
  if (!ctx) {
    // Fallback seguro: hook usado fuera del provider (no rompe la app).
    return {
      widgets: DEFAULT_WIDGETS,
      loading: false,
      isPro: false,
      saveConfig: async () => {},
      toggleWidget: () => DEFAULT_WIDGETS,
      reorderWidgets: () => DEFAULT_WIDGETS,
      getVisibleWidgets: (section) => DEFAULT_WIDGETS.filter(w => w.section === section && w.visible).sort((a, b) => a.order - b.order),
      resetToDefaults: async () => DEFAULT_WIDGETS,
    };
  }
  return ctx;
};
