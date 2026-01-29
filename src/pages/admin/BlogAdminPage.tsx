import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  RefreshCw, Play, Calendar, FileText, BarChart3, 
  CheckCircle, XCircle, Clock, AlertTriangle, Loader2,
  Newspaper, Settings, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PILLARS, type PillarKey } from '@/lib/blog/types';

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isBuildingCalendar, setIsBuildingCalendar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch topics count
  const { data: topicsData } = useQuery({
    queryKey: ['admin-topics-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('blog_topics')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch plan stats
  const { data: planStats } = useQuery({
    queryKey: ['admin-plan-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_plan')
        .select('status, pillar');
      if (error) throw error;
      
      const byStatus: Record<string, number> = {};
      const byPillar: Record<string, number> = {};
      
      (data || []).forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        byPillar[item.pillar] = (byPillar[item.pillar] || 0) + 1;
      });
      
      return { total: data?.length || 0, byStatus, byPillar };
    }
  });

  // Fetch published posts count
  const { data: postsStats } = useQuery({
    queryKey: ['admin-posts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('status, country_code, pillar');
      if (error) throw error;
      
      const byStatus: Record<string, number> = {};
      (data || []).forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      });
      
      return { total: data?.length || 0, byStatus };
    }
  });

  // Fetch recent runs
  const { data: recentRuns } = useQuery({
    queryKey: ['admin-recent-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_runs')
        .select('*')
        .order('run_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Fetch upcoming plan items
  const { data: upcomingPlan } = useQuery({
    queryKey: ['admin-upcoming-plan'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('blog_plan')
        .select('*, topic:blog_topics(title_base)')
        .eq('status', 'planned')
        .gte('planned_date', today)
        .order('planned_date', { ascending: true })
        .limit(15);
      if (error) throw error;
      return data;
    }
  });

  // Seed topics mutation
  const seedTopics = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-blog-topics');
      if (error) throw error;
      toast.success(`Seed completado: ${data.inserted} tópicos creados`);
      queryClient.invalidateQueries({ queryKey: ['admin-topics-count'] });
    } catch (err: any) {
      toast.error(`Error en seed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Build calendar mutation
  const buildCalendar = async () => {
    setIsBuildingCalendar(true);
    try {
      const { data, error } = await supabase.functions.invoke('build-annual-calendar', {
        body: { go_live_date: new Date().toISOString().split('T')[0] }
      });
      if (error) throw error;
      toast.success(data.message || 'Calendario construido');
      queryClient.invalidateQueries({ queryKey: ['admin-plan-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-plan'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsBuildingCalendar(false);
    }
  };

  // Generate post mutation
  const generatePost = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post');
      if (error) throw error;
      
      if (data.skipped) {
        toast.warning(`Publicación saltada: ${data.reason}`);
      } else if (data.published) {
        toast.success(`¡Post publicado! "${data.title}"`);
      } else {
        toast.info(data.message || 'Operación completada');
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-posts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-runs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plan-stats'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Publicado</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Saltado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Fallido</Badge>;
      case 'planned':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" /> Planificado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Factory Admin</h1>
            <p className="text-muted-foreground">Sistema de publicación automática SEO</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refrescar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tópicos Seed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{topicsData || 0}</div>
              <p className="text-xs text-muted-foreground">de 350 objetivo</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plan Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{planStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {planStats?.byStatus?.planned || 0} pendientes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Posts Publicados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{postsStats?.byStatus?.published || 0}</div>
              <p className="text-xs text-muted-foreground">
                {postsStats?.byStatus?.draft || 0} borradores
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Últimas 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentRuns?.filter(r => 
                  new Date(r.run_at) > new Date(Date.now() - 24*60*60*1000)
                ).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">ejecuciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Acciones del Sistema
            </CardTitle>
            <CardDescription>Ejecutar operaciones manuales del Blog Factory</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={seedTopics} disabled={isSeeding} variant="outline">
              {isSeeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              Seed 350 Tópicos
            </Button>
            
            <Button onClick={buildCalendar} disabled={isBuildingCalendar} variant="outline">
              {isBuildingCalendar ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Construir Calendario Anual
            </Button>
            
            <Button onClick={generatePost} disabled={isGenerating} className="bg-primary">
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Generar Post Ahora
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="runs">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ejecuciones
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <Newspaper className="w-4 h-4 mr-2" />
              Distribución
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Publicaciones</CardTitle>
                <CardDescription>Posts planificados para los próximos días</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Pilar</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingPlan?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(item.planned_date), 'dd MMM', { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PILLARS[item.pillar as PillarKey]?.emoji} {item.pillar}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.topic?.title_base || '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                      {(!upcomingPlan || upcomingPlan.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay publicaciones planificadas. Ejecuta "Construir Calendario Anual".
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Runs Tab */}
          <TabsContent value="runs">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ejecuciones</CardTitle>
                <CardDescription>Últimas 20 corridas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Razón</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRuns?.map((run: any) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(run.run_at), 'dd/MM HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell>{getStatusBadge(run.result)}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {run.skip_reason || '—'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {run.notes || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!recentRuns || recentRuns.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay ejecuciones registradas aún.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <div className="grid md:grid-cols-1 gap-4">
              
              <Card>
                <CardHeader>
                  <CardTitle>Por Pilar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(planStats?.byPillar || {}).map(([pillar, count]) => (
                      <div key={pillar} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{PILLARS[pillar as PillarKey]?.emoji}</span>
                          {PILLARS[pillar as PillarKey]?.label || pillar}
                        </span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
