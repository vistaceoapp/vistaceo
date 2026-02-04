import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Newspaper, Users, Calendar, BarChart3, TrendingUp, 
  CheckCircle, Clock, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
  // Blog stats
  const { data: blogStats } = useQuery({
    queryKey: ['admin-dashboard-blog'],
    queryFn: async () => {
      const [postsRes, plansRes, runsRes] = await Promise.all([
        supabase.from('blog_posts').select('status', { count: 'exact' }),
        supabase.from('blog_plan').select('status', { count: 'exact' }).eq('status', 'planned'),
        supabase.from('blog_runs').select('*').order('run_at', { ascending: false }).limit(5),
      ]);
      
      const publishedCount = postsRes.data?.filter(p => p.status === 'published').length || 0;
      const draftCount = postsRes.data?.filter(p => p.status === 'draft').length || 0;
      
      return {
        published: publishedCount,
        drafts: draftCount,
        planned: plansRes.count || 0,
        recentRuns: runsRes.data || [],
      };
    }
  });

  // Profiles count (users approximation)
  const { data: usersCount } = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  // Businesses count
  const { data: businessesCount } = useQuery({
    queryKey: ['admin-dashboard-businesses'],
    queryFn: async () => {
      const { count } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const statsCards = [
    {
      title: 'Posts publicados',
      value: blogStats?.published || 0,
      subtitle: `${blogStats?.drafts || 0} borradores`,
      icon: Newspaper,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/admin/blog',
    },
    {
      title: 'Posts planificados',
      value: blogStats?.planned || 0,
      subtitle: 'en calendario',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/admin/calendario',
    },
    {
      title: 'Usuarios registrados',
      value: usersCount || 0,
      subtitle: 'perfiles creados',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/admin/usuarios',
    },
    {
      title: 'Empresas activas',
      value: businessesCount || 0,
      subtitle: 'con setup completo',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/admin/analytics',
    },
  ];

  const getRunStatusIcon = (result: string) => {
    switch (result) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de VistaCEO • {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground/70">{card.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blog Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Últimas ejecuciones del blog
            </CardTitle>
            <CardDescription>Actividad reciente del Blog Factory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogStats?.recentRuns.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay ejecuciones recientes
                </p>
              )}
              {blogStats?.recentRuns.map((run: any) => (
                <div 
                  key={run.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {getRunStatusIcon(run.result)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {run.notes || run.result}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(run.run_at), "dd MMM HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant={run.result === 'published' ? 'default' : 'secondary'}>
                    {run.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>Acciones frecuentes del admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/admin/blog" 
              className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <Newspaper className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Blog Factory</p>
                <p className="text-sm text-muted-foreground">Generar posts, ver cola LinkedIn</p>
              </div>
            </Link>
            <Link 
              to="/admin/calendario" 
              className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
            >
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Calendario editorial</p>
                <p className="text-sm text-muted-foreground">Ver programación de publicaciones</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
