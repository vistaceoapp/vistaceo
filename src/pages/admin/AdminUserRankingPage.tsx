import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Trophy, Crown, Flame, MessageSquare, Target, Activity,
  CheckCircle2, Eye, Calendar, ChevronRight, Search, Loader2, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface RankRow {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  lastActiveAt: string;
  businessName: string | null;
  country: string | null;
  setupCompleted: boolean;
  isPro: boolean;
  loginCount: number;
  metrics: {
    events: number; events7d: number; daysActive: number; pageViews: number;
    chats: number; missions: number; missionsCompleted: number;
    checkins: number; radarViews: number;
  };
  score: number;
}

const tierColor = (rank: number) => {
  if (rank === 0) return { from: '#FBBF24', to: '#F59E0B', label: '🥇' };
  if (rank === 1) return { from: '#E5E7EB', to: '#9CA3AF', label: '🥈' };
  if (rank === 2) return { from: '#FB923C', to: '#C2410C', label: '🥉' };
  return null;
};

export default function AdminUserRankingPage() {
  const [days, setDays] = useState('30');
  const [includeInternal, setIncludeInternal] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-user-ranking', days, includeInternal],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-user-ranking', {
        body: { days: parseInt(days), includeInternal, limit: 200 },
      });
      if (error) throw error;
      return data as { ranking: RankRow[]; totalUsers: number; days: number };
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data?.ranking || [];
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.email || '').toLowerCase().includes(q) ||
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.businessName || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const summary = useMemo(() => {
    const rows = data?.ranking || [];
    return {
      active: rows.filter((r) => r.metrics.events7d > 0).length,
      power: rows.filter((r) => r.score >= 100).length,
      idle: rows.filter((r) => r.metrics.events7d === 0).length,
      pro: rows.filter((r) => r.isPro).length,
    };
  }, [data]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking de usuarios activos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score multifactor: días activos · eventos · chats · misiones · check-ins · recencia · Pro.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          Refrescar
        </Button>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar email, nombre o negocio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="14">Últimos 14 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="60">Últimos 60 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card">
          <Switch id="internal" checked={includeInternal} onCheckedChange={setIncludeInternal} />
          <label htmlFor="internal" className="text-xs text-muted-foreground cursor-pointer">Incluir internos</label>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Power users', value: summary.power, icon: Flame, color: '#EF4444' },
          { label: 'Activos 7d', value: summary.active, icon: Activity, color: '#10B981' },
          { label: 'Pro', value: summary.pro, icon: Crown, color: '#F59E0B' },
          { label: 'Dormidos', value: summary.idle, icon: Calendar, color: '#6B7280' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${s.color}14` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[50px_minmax(220px,2fr)_70px_minmax(120px,1fr)_repeat(6,minmax(60px,80px))_90px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          <div>#</div>
          <div>Usuario</div>
          <div className="text-center">Score</div>
          <div>Negocio</div>
          <div className="text-center" title="Días activos en el período">Días</div>
          <div className="text-center" title="Eventos últimos 7d">Ev 7d</div>
          <div className="text-center" title="Chats con CEO">Chat</div>
          <div className="text-center" title="Misiones (totales / completadas)">Mis</div>
          <div className="text-center" title="Check-ins">CK</div>
          <div className="text-center" title="Radar views">Rad</div>
          <div className="text-right">Última act.</div>
        </div>

        <ScrollArea className="h-[640px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Calculando ranking…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Sin resultados.</div>
          ) : (
            filtered.map((row, idx) => {
              const tier = tierColor(idx);
              return (
                <Link
                  key={row.userId}
                  to={`/admin/usuarios/${row.userId}/timeline`}
                  className={cn(
                    'grid grid-cols-[50px_minmax(220px,2fr)_70px_minmax(120px,1fr)_repeat(6,minmax(60px,80px))_90px] gap-3 px-4 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors items-center text-[12px]',
                    idx < 3 && 'bg-gradient-to-r from-amber-50/30 to-transparent dark:from-amber-950/10'
                  )}
                >
                  <div className="font-mono font-semibold text-muted-foreground">
                    {tier ? <span className="text-base">{tier.label}</span> : `#${idx + 1}`}
                  </div>
                  <div className="min-w-0 flex items-center gap-2">
                    {row.avatarUrl ? (
                      <img src={row.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {(row.fullName || row.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate flex items-center gap-1.5">
                        {row.fullName || row.email}
                        {row.isPro && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground truncate">{row.email}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[44px] px-2 py-0.5 rounded-md font-bold tabular-nums',
                        row.score >= 100 ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : row.score >= 60 ? 'bg-primary/10 text-primary'
                          : row.score >= 25 ? 'bg-muted text-foreground'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {row.score}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-foreground">{row.businessName || <span className="text-muted-foreground/60 italic">sin negocio</span>}</p>
                    {row.country && <p className="text-[10px] text-muted-foreground">{row.country} {!row.setupCompleted && '· en setup'}</p>}
                  </div>
                  <div className="text-center tabular-nums text-foreground font-medium">{row.metrics.daysActive}</div>
                  <div className="text-center tabular-nums">{row.metrics.events7d}</div>
                  <div className="text-center tabular-nums">{row.metrics.chats}</div>
                  <div className="text-center tabular-nums">
                    {row.metrics.missions}
                    {row.metrics.missionsCompleted > 0 && (
                      <span className="text-emerald-600 text-[10px]">/{row.metrics.missionsCompleted}</span>
                    )}
                  </div>
                  <div className="text-center tabular-nums">{row.metrics.checkins}</div>
                  <div className="text-center tabular-nums">{row.metrics.radarViews}</div>
                  <div className="text-right text-[10.5px] text-muted-foreground">
                    {row.lastActiveAt ? formatDistanceToNow(new Date(row.lastActiveAt), { addSuffix: false, locale: es }) : '—'}
                  </div>
                </Link>
              );
            })
          )}
        </ScrollArea>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3">
        Score = consistencia (días) · intensidad 7d · chats × 2.5 · misiones × 4 (+6 completadas) · check-ins × 3 · radar · recencia (≤24h +25) + Pro (+25) + setup (+15).
      </p>
    </div>
  );
}
