import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, MessageSquare, Target, Lightbulb, Zap, Radio, Mail, Activity,
  Crown, UserCog, Copy, ExternalLink, Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "chat" | "mission" | "opportunity" | "action" | "signal" | "email" | "activity";

const TYPE_META: Record<Exclude<FilterKey, "all">, { label: string; icon: any; color: string }> = {
  chat: { label: "Chat", icon: MessageSquare, color: "text-sky-600 dark:text-sky-400" },
  mission: { label: "Misión", icon: Target, color: "text-violet-600 dark:text-violet-400" },
  opportunity: { label: "Oportunidad", icon: Lightbulb, color: "text-amber-600 dark:text-amber-400" },
  action: { label: "Acción", icon: Zap, color: "text-emerald-600 dark:text-emerald-400" },
  signal: { label: "Señal", icon: Radio, color: "text-pink-600 dark:text-pink-400" },
  email: { label: "Email", icon: Mail, color: "text-indigo-600 dark:text-indigo-400" },
  activity: { label: "Actividad", icon: Activity, color: "text-muted-foreground" },
};

export default function AdminUserTimelinePage() {
  const { userId = "" } = useParams();
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-timeline", userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-user-timeline", {
        body: { userId, limit: 400 },
      });
      if (error) throw error;
      return data as {
        profile: any;
        businesses: any[];
        items: any[];
        counts: Record<string, number>;
      };
    },
    enabled: !!userId,
  });

  const impersonate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-impersonate-user", {
        body: { userId },
      });
      if (error) throw error;
      return data as { email: string; action_link: string };
    },
    onSuccess: (res) => {
      if (res.action_link) {
        navigator.clipboard.writeText(res.action_link).catch(() => {});
        window.open(res.action_link, "_blank", "noopener");
        toast.success("Enlace de impersonación abierto y copiado");
      } else {
        toast.error("No se pudo generar el enlace");
      }
    },
    onError: (e: any) => toast.error(e?.message || "Error al impersonar"),
  });

  const items = useMemo(() => {
    const all = data?.items || [];
    return filter === "all" ? all : all.filter((i) => i.type === filter);
  }, [data, filter]);

  const counts = data?.counts || {};
  const profile = data?.profile;
  const businesses = data?.businesses || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/40 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/admin/usuarios">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Usuarios
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold truncate">
              {profile?.full_name || profile?.email || "Usuario"}
            </h1>
            <p className="text-[12px] text-muted-foreground truncate">
              {profile?.email}
              {profile?.created_at && (
                <> · alta {format(new Date(profile.created_at), "d MMM yyyy", { locale: es })}</>
              )}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={impersonate.isPending}
            onClick={() => impersonate.mutate()}
          >
            {impersonate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCog className="w-4 h-4" />
            )}
            Entrar como usuario
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Negocios */}
        {businesses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Badge key={b.id} variant="secondary" className="gap-1.5 py-1 px-2.5">
                <Crown className="w-3 h-3 opacity-60" />
                {b.name}
                <span className="text-muted-foreground/70 text-[10px] uppercase ml-1">
                  {b.country}
                </span>
              </Badge>
            ))}
          </div>
        )}

        {/* Filtros */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList className="flex flex-wrap h-auto bg-card/50 p-1">
            <TabsTrigger value="all" className="text-[12px]">
              Todo
              <span className="ml-2 text-muted-foreground">{data?.items.length ?? 0}</span>
            </TabsTrigger>
            {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((k) => {
              const { label, icon: Icon } = TYPE_META[k];
              return (
                <TabsTrigger key={k} value={k} className="text-[12px] gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className="ml-1 text-muted-foreground">{counts[k] ?? 0}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Timeline */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Sin actividad para este filtro.
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-260px)] pr-3">
            <ol className="relative border-l border-border/60 ml-3 space-y-3">
              {items.map((item) => {
                const meta = TYPE_META[item.type as keyof typeof TYPE_META];
                const Icon = meta?.icon || Activity;
                return (
                  <li key={item.id} className="ml-5 group">
                    <span
                      className={cn(
                        "absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-card border border-border/80",
                        meta?.color,
                      )}
                    >
                      <Icon className="w-3 h-3" />
                    </span>
                    <article className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 hover:border-border transition-colors">
                      <header className="flex items-start justify-between gap-3 mb-1">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <time
                          className="text-[11px] text-muted-foreground whitespace-nowrap"
                          title={format(new Date(item.created_at), "d MMM yyyy HH:mm", { locale: es })}
                        >
                          {formatDistanceToNow(new Date(item.created_at), { locale: es, addSuffix: true })}
                        </time>
                      </header>
                      {item.body && (
                        <p className="text-[12.5px] text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">
                          {item.body}
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
