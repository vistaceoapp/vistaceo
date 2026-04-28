import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, TrendingUp, Newspaper, Brain, Target, MessageSquare,
  Eye, DollarSign, Activity, Zap, CheckCircle, Clock,
  AlertTriangle, ArrowUpRight, Crown, BarChart3, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = '#2692DC', href }: {
  title: string; value: string | number; subtitle?: string; icon: any; trend?: string; color?: string; href?: string;
}) => {
  const content = (
    <div className="rounded-xl bg-card border border-border p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend && (
          <span className={cn(
            "text-[11px] font-medium px-1.5 py-0.5 rounded",
            trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>{trend}</span>
        )}
        {href && <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
      </div>
      <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
      <p className="text-[12px] text-muted-foreground">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
};

const MiniSparkline = ({ data, color = '#2692DC' }: { data: number[]; color?: string }) => {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-cmd-stats'],
    queryFn: async () => {
      const [profilesRes, businessesRes, setupRes, subsRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('setup_completed', true),
        supabase.from('subscriptions').select('payment_amount, status').eq('status', 'active'),
        supabase.from('blog_posts').select('status', { count: 'exact' }),
      ]);
      const publishedPosts = postsRes.data?.filter(p => p.status === 'published').length || 0;
      const totalRevenue = subsRes.data?.reduce((a, s) => a + (s.payment_amount || 0), 0) || 0;
      return {
        totalUsers: profilesRes.count || 0,
        totalBusinesses: businessesRes.count || 0,
        setupComplete: setupRes.count || 0,
        proUsers: subsRes.data?.length || 0,
        totalRevenue,
        publishedPosts,
      };
    },
    refetchInterval: 30000,
  });

  const { data: engagement } = useQuery({
    queryKey: ['admin-cmd-engagement'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('user_daily_metrics')
        .select('*')
        .gte('metric_date', sevenDaysAgo)
        .order('metric_date', { ascending: true });
      
      const byDay: Record<string, { logins: number; missions: number; chats: number }> = {};
      data?.forEach(m => {
        if (!byDay[m.metric_date]) byDay[m.metric_date] = { logins: 0, missions: 0, chats: 0 };
        byDay[m.metric_date].logins += m.logins_count || 0;
        byDay[m.metric_date].missions += m.missions_completed || 0;
        byDay[m.metric_date].chats += m.chat_messages_sent || 0;
      });
      const dailyData = Object.values(byDay);
      return {
        totalLogins: data?.reduce((a, m) => a + (m.logins_count || 0), 0) || 0,
        totalMissions: data?.reduce((a, m) => a + (m.missions_completed || 0), 0) || 0,
        totalChats: data?.reduce((a, m) => a + (m.chat_messages_sent || 0), 0) || 0,
        loginTrend: dailyData.map(d => d.logins),
        missionTrend: dailyData.map(d => d.missions),
        chatTrend: dailyData.map(d => d.chats),
      };
    },
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['admin-cmd-health'],
    queryFn: async () => {
      const [brainRes, snapshotRes, gapRes, predRes] = await Promise.all([
        supabase.from('business_brains').select('confidence_score, mvc_completion_pct, total_signals'),
        supabase.from('snapshots').select('total_score').order('created_at', { ascending: false }).limit(50),
        supabase.from('data_gaps').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      // confidence_score is stored as 0-100 (sometimes >100 due to legacy). Clamp to [0,100].
      const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
      const avgConfidence = brainRes.data?.length
        ? clamp(brainRes.data.reduce((a, b) => a + (b.confidence_score || 0), 0) / brainRes.data.length) : 0;
      const avgMVC = brainRes.data?.length
        ? clamp(brainRes.data.reduce((a, b) => a + (b.mvc_completion_pct || 0), 0) / brainRes.data.length) : 0;
      const avgHealth = snapshotRes.data?.length
        ? clamp(snapshotRes.data.reduce((a, b) => a + (b.total_score || 0), 0) / snapshotRes.data.length) : 0;
      return { avgConfidence, avgMVC, avgHealth, totalSignals: brainRes.data?.reduce((a, b) => a + (b.total_signals || 0), 0) || 0, pendingGaps: gapRes.count || 0, activePredictions: predRes.count || 0, totalBrains: brainRes.data?.length || 0 };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-cmd-activity'],
    queryFn: async () => {
      const [activityRes, runsRes] = await Promise.all([
        supabase.from('user_activity_logs').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('blog_runs').select('*').order('run_at', { ascending: false }).limit(5),
      ]);
      return { activity: activityRes.data || [], blogRuns: runsRes.data || [] };
    },
    refetchInterval: 15000,
  });

  const { data: webStats } = useQuery({
    queryKey: ['admin-cmd-web'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase.from('web_analytics').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo);
      return { pageviews7d: count || 0 };
    },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono">Live</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] w-fit">
          <Activity className="w-3 h-3 mr-1 text-emerald-500" />
          Auto-refresh: 15s
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Usuarios" value={stats?.totalUsers || 0} icon={Users} color="#2692DC" href="/admin/usuarios" subtitle={`${stats?.proUsers || 0} Pro`} />
        <StatCard title="Negocios" value={stats?.totalBusinesses || 0} icon={TrendingUp} color="#746CE6" subtitle={`${stats?.setupComplete || 0} con setup`} />
        <StatCard title="Revenue" value={`$${stats?.totalRevenue || 0}`} icon={DollarSign} color="#22c55e" subtitle={`${stats?.proUsers || 0} suscripciones`} />
        <StatCard title="Posts Blog" value={stats?.publishedPosts || 0} icon={Newspaper} color="#f59e0b" href="/admin/centro-control" />
        <StatCard title="Pageviews 7d" value={webStats?.pageviews7d || 0} icon={Eye} color="#ef4444" href="/admin/analytics" />
        <StatCard title="Logins 7d" value={engagement?.totalLogins || 0} icon={Activity} color="#06b6d4" />
      </div>

      {/* Engagement sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Misiones completadas (7d)', value: engagement?.totalMissions || 0, data: engagement?.missionTrend || [], icon: Target, color: '#746CE6' },
          { label: 'Mensajes chat IA (7d)', value: engagement?.totalChats || 0, data: engagement?.chatTrend || [], icon: MessageSquare, color: '#2692DC' },
          { label: 'Logins diarios (7d)', value: engagement?.totalLogins || 0, data: engagement?.loginTrend || [], icon: Activity, color: '#22c55e' },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${m.color}12` }}>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
              </div>
            </div>
            {m.data.length > 1 && <MiniSparkline data={m.data} color={m.color} />}
          </div>
        ))}
      </div>

      {/* System Intelligence */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary" />
          <h2 className="text-[15px] font-semibold text-foreground">Inteligencia del Sistema</h2>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {systemHealth?.totalBrains || 0} cerebros activos
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Confianza IA', value: `${systemHealth?.avgConfidence || 0}%`, color: (systemHealth?.avgConfidence || 0) >= 60 ? '#22c55e' : '#f59e0b' },
            { label: 'MVC promedio', value: `${systemHealth?.avgMVC || 0}%`, color: (systemHealth?.avgMVC || 0) >= 50 ? '#22c55e' : '#f59e0b' },
            { label: 'Salud promedio', value: `${systemHealth?.avgHealth || 0}/100`, color: (systemHealth?.avgHealth || 0) >= 60 ? '#22c55e' : '#ef4444' },
            { label: 'Señales totales', value: systemHealth?.totalSignals || 0, color: '#2692DC' },
            { label: 'Gaps pendientes', value: systemHealth?.pendingGaps || 0, color: '#f59e0b' },
            { label: 'Predicciones', value: systemHealth?.activePredictions || 0, color: '#746CE6' },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-accent/50 border border-border p-3 text-center">
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Blog Engine</h3>
            </div>
            <Link to="/admin/centro-control" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              Ver todo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(!recentActivity?.blogRuns?.length) && <p className="text-sm text-muted-foreground text-center py-6">Sin ejecuciones recientes</p>}
            {recentActivity?.blogRuns?.map((run: any) => (
              <div key={run.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/30 border border-border">
                {run.result === 'published' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : run.result === 'skipped' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground truncate">{run.notes || run.result}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(run.run_at), "dd MMM HH:mm", { locale: es })}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px]", run.result === 'published' && "text-emerald-600")}>{run.result}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
            </div>
            <Link to="/admin/usuarios" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              Usuarios <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <ScrollArea className="h-[240px]">
            <div className="space-y-1.5">
              {recentActivity?.activity?.slice(0, 12).map((act: any) => (
                <div key={act.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-muted-foreground truncate">
                      <span className="text-foreground font-medium">{act.event_type}</span>
                      {act.page_path && <span className="text-muted-foreground/60"> · {act.page_path}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                    {formatDistanceToNow(new Date(act.created_at), { locale: es, addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
