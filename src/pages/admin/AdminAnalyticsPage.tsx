import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, Eye, Users, TrendingUp, DollarSign, Target,
  MessageSquare, CheckCircle, Globe, Smartphone, Monitor, Tablet,
  ArrowUp, ArrowDown, Newspaper
} from 'lucide-react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: overviewData, isLoading: loadingOverview } = useQuery({
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Métricas completas de VistaCEO y el Blog</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 días</SelectItem>
            <SelectItem value="30d">30 días</SelectItem>
            <SelectItem value="90d">90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Pageviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(overviewData?.pageviews || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Nuevos usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(overviewData?.newUsers || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(overviewData?.totalLogins || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" /> Misiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(overviewData?.totalMissions || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(overviewData?.totalChats || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">${formatNumber(overviewData?.totalRevenue || 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages & Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Top páginas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewData?.topPages?.slice(0, 8).map((page: { path: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[200px]">{page.path}</span>
                      <Badge variant="secondary">{formatNumber(page.count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Top posts del blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewData?.topBlogPosts?.slice(0, 8).map((post: { slug: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[200px]">{post.slug}</span>
                      <Badge variant="secondary">{formatNumber(post.count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="web" className="space-y-6">
          {/* Daily pageviews chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pageviews diarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={webData?.dailyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="pageviews" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="uniqueVisitors" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(webData?.deviceBreakdown || {}).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(webData?.deviceBreakdown || {}).map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Country breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Países</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(webData?.countryBreakdown || {})
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 10)
                    .map(([country, count], i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{country}</span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Views del blog por día</CardTitle>
              <CardDescription>Total: {formatNumber(blogData?.totalBlogViews || 0)} views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blogData?.dailyBlogViews || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance por artículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blogData?.postStats?.slice(0, 15).map((post: { slug: string; views: number; avgScrollDepth: number; avgTimeOnPage: number }, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium truncate max-w-[300px]">{post.slug}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatNumber(post.views)}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{post.avgScrollDepth}%</p>
                        <p className="text-xs text-muted-foreground">scroll</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{Math.round(post.avgTimeOnPage / 60)}m</p>
                        <p className="text-xs text-muted-foreground">tiempo</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios activos por día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usersData?.dailyActiveUsers || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos por tipo</CardTitle>
              <CardDescription>Total: {formatNumber(usersData?.totalEvents || 0)} eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(usersData?.eventBreakdown || {})
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 8)
                  .map(([event, count], i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatNumber(count as number)}</p>
                      <p className="text-xs text-muted-foreground">{event}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
