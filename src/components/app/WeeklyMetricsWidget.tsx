import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, CheckCircle2, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";

interface WeeklyMetric {
  label: string;
  current: number;
  previous: number;
  icon: "opportunities" | "accepted" | "rejected" | "steps";
}

interface WeeklyMetricsWidgetProps {
  className?: string;
}

export const WeeklyMetricsWidget = ({ className }: WeeklyMetricsWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [currentBusiness]);

  const fetchMetrics = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);
      
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setMilliseconds(-1);

      // Fetch opportunities this week
      const [
        oppThisWeek,
        oppLastWeek,
        oppAcceptedThis,
        oppAcceptedLast,
        oppRejectedThis,
        oppRejectedLast,
        stepsThisWeek,
        stepsLastWeek,
      ] = await Promise.all([
        // Opportunities found this week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", thisWeekStart.toISOString()),
        // Opportunities found last week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", lastWeekStart.toISOString())
          .lt("created_at", thisWeekStart.toISOString()),
        // Opportunities accepted (converted) this week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("is_converted", true)
          .gte("created_at", thisWeekStart.toISOString()),
        // Opportunities accepted last week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("is_converted", true)
          .gte("created_at", lastWeekStart.toISOString())
          .lt("created_at", thisWeekStart.toISOString()),
        // Opportunities rejected this week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .not("dismissed_at", "is", null)
          .gte("created_at", thisWeekStart.toISOString()),
        // Opportunities rejected last week
        supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .not("dismissed_at", "is", null)
          .gte("created_at", lastWeekStart.toISOString())
          .lt("created_at", thisWeekStart.toISOString()),
        // Mission steps completed this week (from signals)
        supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("signal_type", "mission_step_completed")
          .gte("created_at", thisWeekStart.toISOString()),
        // Mission steps completed last week
        supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("signal_type", "mission_step_completed")
          .gte("created_at", lastWeekStart.toISOString())
          .lt("created_at", thisWeekStart.toISOString()),
      ]);

      setMetrics([
        {
          label: "Oportunidades",
          current: oppThisWeek.count || 0,
          previous: oppLastWeek.count || 0,
          icon: "opportunities",
        },
        {
          label: "Aceptadas",
          current: oppAcceptedThis.count || 0,
          previous: oppAcceptedLast.count || 0,
          icon: "accepted",
        },
        {
          label: "Rechazadas",
          current: oppRejectedThis.count || 0,
          previous: oppRejectedLast.count || 0,
          icon: "rejected",
        },
        {
          label: "Pasos misión",
          current: stepsThisWeek.count || 0,
          previous: stepsLastWeek.count || 0,
          icon: "steps",
        },
      ]);
    } catch (error) {
      console.error("Error fetching weekly metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "opportunities":
        return <Lightbulb className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      case "steps":
        return <Target className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getIconBg = (iconType: string) => {
    switch (iconType) {
      case "opportunities":
        return "bg-accent/10 text-accent";
      case "accepted":
        return "bg-success/10 text-success";
      case "rejected":
        return "bg-destructive/10 text-destructive";
      case "steps":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDelta = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff === 0) return null;
    return {
      value: diff > 0 ? `+${diff}` : `${diff}`,
      isPositive: diff > 0,
    };
  };

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">Esta semana</h4>
        <span className="text-[10px] text-muted-foreground">vs semana anterior</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {metrics.map((metric) => {
          const delta = getDelta(metric.current, metric.previous);

          return (
            <div
              key={metric.icon}
              className="p-3 rounded-xl bg-secondary/30 border border-border text-center relative overflow-hidden"
            >
              <div className={cn("w-7 h-7 rounded-lg mx-auto mb-2 flex items-center justify-center", getIconBg(metric.icon))}>
                {getIcon(metric.icon)}
              </div>
              
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-foreground">{metric.current}</span>
                {delta && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold flex items-center",
                      // For rejected, negative is actually good
                      metric.icon === "rejected"
                        ? delta.isPositive
                          ? "text-destructive"
                          : "text-success"
                        : delta.isPositive
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {metric.icon === "rejected" ? (
                      delta.isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )
                    ) : delta.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {delta.value}
                  </span>
                )}
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{metric.label}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default WeeklyMetricsWidget;
