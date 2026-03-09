import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, TrendingUp, Newspaper, Brain, Target, MessageSquare,
  Eye, DollarSign, Activity, Zap, CheckCircle, Clock,
  AlertTriangle, ArrowUpRight, Crown, Globe, BarChart3,
  Shield, Sparkles, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = '#2692DC', href }: {
  title: string; value: string | number; subtitle?: string; icon: any; trend?: string; color?: string; href?: string;
}) => {
  const content = (
    <div className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-4 hover:border-[#2a2a3e] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: color, filter: 'blur(20px)' }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend && (
          <span className={cn(
            "text-[11px] font-medium px-1.5 py-0.5 rounded",
            trend.startsWith('+') ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
          )}>
            {trend}
          </span>
        )}
        {href && <ArrowUpRight className="w-3.5 h-3.5 text-[#333] group-hover:text-[#666] transition-colors" />}
      </div>
      <p className="text-[24px] font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-[12px] text-[#666]">{title}</p>
      {subtitle && <p className="text-[10px] text-[#444] mt-0.5">{subtitle}</p>}
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
  // Core stats
  const { data: stats } = useQuery({
    queryKey: ['admin-cmd-stats'],
    queryFn: async () => {
      const [profilesRes, businessesRes, setupRes, subsRes, postsRes, blogPlansRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('setup_completed', true),
        supabase.from('subscriptions').select('payment_amount, status').eq('status', 'active'),
        supabase.from('blog_posts').select('status', { count: 'exact' }),
        supabase.from('blog_plan').select('*', { count: 'exact', head: true }).eq('status', 'planned'),
      ]);

      const publishedPosts = postsRes.data?.filter(p => p.status === 'published').length || 0;
      const draftPosts = postsRes.data?.filter(p => p.status === 'draft').length || 0;
      const totalRevenue = subsRes.data?.reduce((a, s) => a + (s.payment_amount || 0), 0) || 0;
      const proUsers = subsRes.data?.length || 0;

      return {
        totalUsers: profilesRes.count || 0,
        totalBusinesses: businessesRes.count || 0,
        setupComplete: setupRes.count || 0,
        proUsers,
        totalRevenue,
        publishedPosts,
        draftPosts,
        plannedPosts: blogPlansRes.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['admin-cmd-activity'],
    queryFn: async () => {
      const [activityRes, runsRes, missionsRes, chatRes] = await Promise.all([
        supabase.from('user_activity_logs').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('blog_runs').select('*').order('run_at', { ascending: false }).limit(5),
        supabase.from('daily_actions').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('chat_messages').select('id, role, created_at, business_id').order('created_at', { ascending: false }).limit(10),
      ]);
      return {
        activity: activityRes.data || [],
        blogRuns: runsRes.data || [],
        recentMissions: missionsRes.data || [],
        recentChats: chatRes.data || [],
      };
    },
    refetchInterval: 15000,
  });

  // User engagement (last 7 days metrics)
  const { data: engagement } = useQuery({
    queryKey: ['admin-cmd-engagement'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('user_daily_metrics')
        .select('*')
        .gte('metric_date', sevenDaysAgo)
        .order('metric_date', { ascending: true });
      
      // Aggregate by day
      const byDay: Record<string, { logins: number; missions: number; chats: number; checkins: number }> = {};
      data?.forEach(m => {
        if (!byDay[m.metric_date]) byDay[m.metric_date] = { logins: 0, missions: 0, chats: 0, checkins: 0 };
        byDay[m.metric_date].logins += m.logins_count || 0;
        byDay[m.metric_date].missions += m.missions_completed || 0;
        byDay[m.metric_date].chats += m.chat_messages_sent || 0;
        byDay[m.metric_date].checkins += m.checkins_completed || 0;
      });

      const totalLogins = data?.reduce((a, m) => a + (m.logins_count || 0), 0) || 0;
      const totalMissions = data?.reduce((a, m) => a + (m.missions_completed || 0), 0) || 0;
      const totalChats = data?.reduce((a, m) => a + (m.chat_messages_sent || 0), 0) || 0;
      const dailyData = Object.values(byDay);

      return {
        totalLogins,
        totalMissions,
        totalChats,
        loginTrend: dailyData.map(d => d.logins),
        missionTrend: dailyData.map(d => d.missions),
        chatTrend: dailyData.map(d => d.chats),
      };
    },
  });

  // System health
  const { data: systemHealth } = useQuery({
    queryKey: ['admin-cmd-health'],
    queryFn: async () => {
      const [brainRes, snapshotRes, gapRes, predRes] = await Promise.all([
        supabase.from('business_brains').select('confidence_score, mvc_completion_pct, total_signals'),
        supabase.from('snapshots').select('total_score').order('created_at', { ascending: false }).limit(50),
        supabase.from('data_gaps').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      const avgConfidence = brainRes.data?.length 
        ? Math.round(brainRes.data.reduce((a, b) => a + (b.confidence_score || 0), 0) / brainRes.data.length * 100)
        : 0;
      const avgMVC = brainRes.data?.length
        ? Math.round(brainRes.data.reduce((a, b) => a + (b.mvc_completion_pct || 0), 0) / brainRes.data.length)
        : 0;
      const avgHealth = snapshotRes.data?.length
        ? Math.round(snapshotRes.data.reduce((a, b) => a + (b.total_score || 0), 0) / snapshotRes.data.length)
        : 0;
      const totalSignals = brainRes.data?.reduce((a, b) => a + (b.total_signals || 0), 0) || 0;

      return {
        avgConfidence,
        avgMVC,
        avgHealth,
        totalSignals,
        pendingGaps: gapRes.count || 0,
        activePredictions: predRes.count || 0,
        totalBrains: brainRes.data?.length || 0,
      };
    },
  });

  // Web analytics (pageviews last 7 days)
  const { data: webStats } = useQuery({
    queryKey: ['admin-cmd-web'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase.from('web_analytics').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo);
      return { pageviews7d: count || 0 };
    },
  });

  const getRunIcon = (result: string) => {
    if (result === 'published') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    if (result === 'skipped') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    return <Clock className="w-3.5 h-3.5 text-[#555]" />;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[#555] uppercase tracking-widest font-mono">Live</span>
          </div>
          <h1 className="text-[28px] font-bold text-white">Command Center</h1>
          <p className="text-[14px] text-[#666]">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[#666] border-[#2a2a3e] bg-[#111118] text-[11px]">
            <Activity className="w-3 h-3 mr-1 text-emerald-400" />
            Actualización: cada 15s
          </Badge>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Usuarios" value={stats?.totalUsers || 0} icon={Users} color="#2692DC" href="/admin/usuarios" subtitle={`${stats?.proUsers || 0} Pro`} />
        <StatCard title="Negocios" value={stats?.totalBusinesses || 0} icon={TrendingUp} color="#746CE6" subtitle={`${stats?.setupComplete || 0} con setup`} />
        <StatCard title="Revenue" value={`$${stats?.totalRevenue || 0}`} icon={DollarSign} color="#28c840" subtitle={`${stats?.proUsers || 0} suscripciones`} />
        <StatCard title="Posts Blog" value={stats?.publishedPosts || 0} icon={Newspaper} color="#febc2e" href="/admin/centro-control" subtitle={`${stats?.draftPosts || 0} borradores`} />
        <StatCard title="Pageviews 7d" value={webStats?.pageviews7d || 0} icon={Eye} color="#ff6b6b" href="/admin/analytics" />
        <StatCard title="Logins 7d" value={engagement?.totalLogins || 0} icon={Activity} color="#4ecdc4" />
      </div>

      {/* Engagement metrics with sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Misiones completadas (7d)', value: engagement?.totalMissions || 0, data: engagement?.missionTrend || [], icon: Target, color: '#746CE6' },
          { label: 'Mensajes chat IA (7d)', value: engagement?.totalChats || 0, data: engagement?.chatTrend || [], icon: MessageSquare, color: '#2692DC' },
          { label: 'Logins diarios (7d)', value: engagement?.totalLogins || 0, data: engagement?.loginTrend || [], icon: Activity, color: '#28c840' },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${m.color}15` }}>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-[20px] font-bold text-white">{m.value}</p>
                <p className="text-[11px] text-[#555]">{m.label}</p>
              </div>
            </div>
            {m.data.length > 1 && <MiniSparkline data={m.data} color={m.color} />}
          </div>
        ))}
      </div>

      {/* System Intelligence */}
      <div className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-[#746CE6]" />
          <h2 className="text-[15px] font-semibold text-white">Inteligencia del Sistema</h2>
          <Badge variant="outline" className="ml-auto text-[10px] border-[#2a2a3e] text-[#555]">
            {systemHealth?.totalBrains || 0} cerebros activos
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Confianza IA', value: `${systemHealth?.avgConfidence || 0}%`, color: (systemHealth?.avgConfidence || 0) >= 60 ? '#28c840' : '#febc2e' },
            { label: 'MVC promedio', value: `${systemHealth?.avgMVC || 0}%`, color: (systemHealth?.avgMVC || 0) >= 50 ? '#28c840' : '#febc2e' },
            { label: 'Salud promedio', value: `${systemHealth?.avgHealth || 0}/100`, color: (systemHealth?.avgHealth || 0) >= 60 ? '#28c840' : '#ff6b6b' },
            { label: 'Señales totales', value: systemHealth?.totalSignals || 0, color: '#2692DC' },
            { label: 'Gaps pendientes', value: systemHealth?.pendingGaps || 0, color: '#febc2e' },
            { label: 'Predicciones', value: systemHealth?.activePredictions || 0, color: '#746CE6' },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-[#0d0d14] border border-[#1a1a2e] p-3 text-center">
              <p className="text-[18px] font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-[#555] mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blog runs */}
        <div className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#febc2e]" />
              <h3 className="text-[14px] font-semibold text-white">Blog Engine</h3>
            </div>
            <Link to="/admin/centro-control" className="text-[11px] text-[#555] hover:text-[#888] flex items-center gap-1">
              Ver todo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(!recentActivity?.blogRuns?.length) && (
              <p className="text-[13px] text-[#444] text-center py-6">Sin ejecuciones recientes</p>
            )}
            {recentActivity?.blogRuns?.map((run: any) => (
              <div key={run.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
                {getRunIcon(run.result)}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#ccc] truncate">{run.notes || run.result}</p>
                  <p className="text-[10px] text-[#444]">
                    {format(new Date(run.run_at), "dd MMM HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[10px] border-[#2a2a3e]",
                  run.result === 'published' ? "text-emerald-400" : "text-[#555]"
                )}>
                  {run.result}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent user activity */}
        <div className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4ecdc4]" />
              <h3 className="text-[14px] font-semibold text-white">Actividad reciente</h3>
            </div>
            <Link to="/admin/usuarios" className="text-[11px] text-[#555] hover:text-[#888] flex items-center gap-1">
              Usuarios <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <ScrollArea className="h-[240px]">
            <div className="space-y-1.5">
              {recentActivity?.activity?.slice(0, 12).map((act: any) => (
                <div key={act.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0d0d14] transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-[#555]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#999] truncate">
                      <span className="text-[#ccc] font-medium">{act.event_type}</span>
                      {act.page_path && <span className="text-[#444]"> · {act.page_path}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#444] flex-shrink-0">
                    {formatDistanceToNow(new Date(act.created_at), { locale: es, addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Usuarios', desc: 'Gestionar cuentas', icon: Users, href: '/admin/usuarios', color: '#2692DC' },
          { label: 'Analytics', desc: 'Métricas completas', icon: BarChart3, href: '/admin/analytics', color: '#746CE6' },
          { label: 'Centro Control', desc: 'Blog OS & auto', icon: Shield, href: '/admin/centro-control', color: '#febc2e' },
          { label: 'Sitio web', desc: 'Ver landing', icon: Globe, href: '/', color: '#28c840' },
        ].map(a => (
          <Link key={a.label} to={a.href}>
            <div className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-4 hover:border-[#2a2a3e] transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${a.color}15` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <p className="text-[13px] font-semibold text-white">{a.label}</p>
              <p className="text-[11px] text-[#555]">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
