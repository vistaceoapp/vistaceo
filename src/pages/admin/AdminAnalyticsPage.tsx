import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, Eye, Users, TrendingUp, DollarSign, Target,
  MessageSquare, Globe, Newspaper, Activity
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2692DC', '#746CE6', '#28c840', '#febc2e', '#ff6b6b', '#4ecdc4'];

const DarkCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl bg-[#111118] border border-[#1a1a2e]", className)}>{children}</div>
);

const chartTooltipStyle = {
  contentStyle: { background: '#111118', border: '1px solid #1a1a2e', borderRadius: '8px', fontSize: '12px', color: '#ccc' },
  labelStyle: { color: '#666' },
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: overviewData } = useQuery({
    queryKey: ['admin-analytics-overview', range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-analytics', {
        body: { range, type: 'overview' },
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: webData } = useQuery({
    queryKey: ['admin-analytics-web', range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-analytics', {
        body: { range, type: 'web' },
      });
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'web',
  });

  const { data: blogData } = useQuery({
    queryKey: ['admin-analytics-blog', range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-analytics', {
        body: { range, type: 'blog' },
      });
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'blog',
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-analytics-users', range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-analytics', {
        body: { range, type: 'users' },
      });
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'users',
  });

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'web', label: 'Web' },
    { id: 'blog', label: 'Blog' },
    { id: 'users', label: 'Usuarios' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-white">Analytics</h1>
          <p className="text-[14px] text-[#666]">Métricas completas de VISTACEO</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-28 bg-[#111118] border-[#1a1a2e] text-white text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1a1a2e]">
            <SelectItem value="7d" className="text-white">7 días</SelectItem>
            <SelectItem value="30d" className="text-white">30 días</SelectItem>
            <SelectItem value="90d" className="text-white">90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-[#111118] border border-[#1a1a2e] w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-md text-[13px] font-medium transition-all",
              activeTab === t.id ? "bg-[#2692DC]/20 text-[#2692DC]" : "text-[#666] hover:text-white"
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Pageviews', value: fmt(overviewData?.pageviews || 0), icon: Eye, color: '#2692DC' },
              { label: 'Nuevos usuarios', value: fmt(overviewData?.newUsers || 0), icon: Users, color: '#746CE6' },
              { label: 'Logins', value: fmt(overviewData?.totalLogins || 0), icon: TrendingUp, color: '#28c840' },
              { label: 'Misiones', value: fmt(overviewData?.totalMissions || 0), icon: Target, color: '#febc2e' },
              { label: 'Chats', value: fmt(overviewData?.totalChats || 0), icon: MessageSquare, color: '#4ecdc4' },
              { label: 'Revenue', value: `$${fmt(overviewData?.totalRevenue || 0)}`, icon: DollarSign, color: '#ff6b6b' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}15` }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <p className="text-[20px] font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-[#555]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DarkCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-[#2692DC]" />
                <h3 className="text-[14px] font-semibold text-white">Top páginas</h3>
              </div>
              <div className="space-y-2">
                {overviewData?.topPages?.slice(0, 8).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#888] truncate max-w-[240px]">{p.path}</span>
                    <span className="text-[12px] text-white font-medium">{fmt(p.count)}</span>
                  </div>
                ))}
              </div>
            </DarkCard>
            <DarkCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-4 h-4 text-[#febc2e]" />
                <h3 className="text-[14px] font-semibold text-white">Top posts blog</h3>
              </div>
              <div className="space-y-2">
                {overviewData?.topBlogPosts?.slice(0, 8).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#888] truncate max-w-[240px]">{p.slug}</span>
                    <span className="text-[12px] text-white font-medium">{fmt(p.count)}</span>
                  </div>
                ))}
              </div>
            </DarkCard>
          </div>
        </div>
      )}

      {/* Web */}
      {activeTab === 'web' && (
        <div className="space-y-5">
          <DarkCard className="p-5">
            <h3 className="text-[14px] font-semibold text-white mb-4">Pageviews diarios</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={webData?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="pageviews" stroke="#2692DC" fill="#2692DC" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="uniqueVisitors" stroke="#746CE6" fill="#746CE6" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DarkCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DarkCard className="p-5">
              <h3 className="text-[14px] font-semibold text-white mb-4">Dispositivos</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(webData?.deviceBreakdown || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(webData?.deviceBreakdown || {}).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DarkCard>
            <DarkCard className="p-5">
              <h3 className="text-[14px] font-semibold text-white mb-4">Países</h3>
              <div className="space-y-2">
                {Object.entries(webData?.countryBreakdown || {})
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 10)
                  .map(([country, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[12px] text-[#888]">{country}</span>
                      <span className="text-[12px] text-white font-medium">{count as number}</span>
                    </div>
                  ))}
              </div>
            </DarkCard>
          </div>
        </div>
      )}

      {/* Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-5">
          <DarkCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-white">Views del blog por día</h3>
              <span className="text-[12px] text-[#555]">Total: {fmt(blogData?.totalBlogViews || 0)}</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blogData?.dailyBlogViews || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="views" fill="#2692DC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DarkCard>

          <DarkCard className="p-5">
            <h3 className="text-[14px] font-semibold text-white mb-4">Performance por artículo</h3>
            <div className="space-y-2">
              {blogData?.postStats?.slice(0, 15).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
                  <span className="text-[12px] text-[#888] truncate max-w-[300px]">{p.slug}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="text-right">
                      <p className="text-white font-bold">{fmt(p.views)}</p>
                      <p className="text-[#444]">views</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{p.avgScrollDepth}%</p>
                      <p className="text-[#444]">scroll</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{Math.round(p.avgTimeOnPage / 60)}m</p>
                      <p className="text-[#444]">tiempo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>
        </div>
      )}

      {/* Users analytics */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <DarkCard className="p-5">
            <h3 className="text-[14px] font-semibold text-white mb-4">Usuarios activos por día</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usersData?.dailyActiveUsers || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="activeUsers" stroke="#2692DC" fill="#2692DC" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DarkCard>

          <DarkCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-white">Eventos por tipo</h3>
              <span className="text-[12px] text-[#555]">Total: {fmt(usersData?.totalEvents || 0)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(usersData?.eventBreakdown || {})
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 8)
                .map(([event, count], i) => (
                  <div key={i} className="rounded-lg bg-[#0d0d14] border border-[#1a1a2e] p-3 text-center">
                    <p className="text-[18px] font-bold text-white">{fmt(count as number)}</p>
                    <p className="text-[10px] text-[#555] truncate">{event}</p>
                  </div>
                ))}
            </div>
          </DarkCard>
        </div>
      )}
    </div>
  );
}
