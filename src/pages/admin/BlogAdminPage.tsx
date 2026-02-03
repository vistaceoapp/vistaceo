import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Newspaper, Settings, Database, Linkedin, Copy, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PILLARS, type PillarKey } from '@/lib/blog/types';

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isBuildingCalendar, setIsBuildingCalendar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLinkedin, setGeneratingLinkedin] = useState<string | null>(null);
  // Como `social_publications` es service-role only, el frontend no puede leerlo.
  // Guardamos el texto generado localmente para habilitar el flujo Generar -> Copiar.
  const [linkedinCopyByPostId, setLinkedinCopyByPostId] = useState<Record<string, string>>({});

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

  // Fetch LinkedIn pending publications (posts published but not yet on LinkedIn)
  const { data: linkedinQueue } = useQuery({
    queryKey: ['admin-linkedin-queue'],
    queryFn: async () => {
      // Get published posts
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, publish_at')
        .eq('status', 'published')
        .order('publish_at', { ascending: false })
        .limit(50);
      if (postsError) throw postsError;

      // Nota: no intentamos leer `social_publications` desde el frontend porque la RLS
      // la bloquea (service role only). El flujo de copy usa el estado local.
      return (posts || []).map(post => ({
        ...post,
        linkedin: null
      }));
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
        
        // Trigger site deploy for SSG regeneration
        try {
          await supabase.functions.invoke('trigger-site-deploy', {
            body: { 
              post_id: data.post_id,
              trigger_reason: 'blog_published'
            }
          });
          toast.info('Deploy SSG programado ✓');
        } catch (deployErr) {
          console.warn('Deploy trigger failed (non-blocking):', deployErr);
        }
      } else {
        toast.info(data.message || 'Operación completada');
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-posts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-runs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plan-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-linkedin-queue'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'posted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Publicado</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Saltado</Badge>;
      case 'failed':
      case 'needs_reauth':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> {status === 'needs_reauth' ? 'Reauth' : 'Fallido'}</Badge>;
      case 'planned':
      case 'queued':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" /> {status === 'queued' ? 'En cola' : 'Planificado'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Generate LinkedIn copy for a post
  const generateLinkedInCopy = async (postId: string) => {
    setGeneratingLinkedin(postId);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-generate-copy', {
        body: { post_id: postId }
      });
      if (error) throw error;
      
      if (!data?.success) {
        toast.warning(data?.error || 'No se pudo generar');
        return;
      }

      const generatedText: string | undefined = data.generated_text;
      if (!generatedText || generatedText.trim().length === 0) {
        toast.error('Se generó una respuesta vacía. Reintentá.');
        return;
      }

      setLinkedinCopyByPostId(prev => ({ ...prev, [postId]: generatedText }));
      toast.success(data.already_generated ? 'Copy de LinkedIn listo (ya existía) ✓' : 'Copy de LinkedIn generado ✓');

      // Intentar copiar inmediatamente (lo que el usuario espera al apretar "Generar").
      const copied = await copyToClipboard(generatedText);
      if (copied) {
        toast.success('Copiado al portapapeles ✓');
      } else {
        toast.error('No pude copiar automáticamente. Usá el botón "Copiar".');
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setGeneratingLinkedin(null);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback debajo
    }

    // Fallback para navegadores / permisos que bloquean Clipboard API
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  };

  const mergedLinkedinQueue = useMemo(() => {
    return (linkedinQueue || []).map((item: any) => {
      const localText = linkedinCopyByPostId[item.id];
      return {
        ...item,
        // “linkedin” fakeado solo para reutilizar el render existente (status + generated_text)
        linkedin: localText
          ? { status: 'queued', generated_text: localText, linkedin_post_urn: null, error_message: null }
          : item.linkedin,
      };
    });
  }, [linkedinQueue, linkedinCopyByPostId]);

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
        <Tabs defaultValue="linkedin" className="space-y-4">
          <TabsList>
            <TabsTrigger value="linkedin">
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </TabsTrigger>
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

          {/* LinkedIn Tab */}
          <TabsContent value="linkedin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5" />
                  Cola de LinkedIn
                </CardTitle>
                <CardDescription>
                  Posts publicados → genera el copy → copiá y pegá en LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado LI</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mergedLinkedinQueue?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-xs">
                            <div className="font-medium truncate">{item.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.excerpt}</div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.publish_at ? format(new Date(item.publish_at), 'dd MMM', { locale: es }) : '—'}
                          </TableCell>
                          <TableCell>
                            {item.linkedin ? getStatusBadge(item.linkedin.status) : (
                              <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {item.linkedin?.generated_text ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={async () => {
                                    const ok = await copyToClipboard(item.linkedin.generated_text);
                                    toast[ok ? 'success' : 'error'](ok ? 'Copiado al portapapeles ✓' : 'Error al copiar');
                                  }}
                                  className="bg-primary"
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copiar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open('https://www.linkedin.com/company/vistaceo/admin/page-posts/published/', '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => generateLinkedInCopy(item.id)}
                                disabled={generatingLinkedin === item.id}
                              >
                                {generatingLinkedin === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Generar
                                  </>
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!linkedinQueue || linkedinQueue.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay posts publicados aún.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

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
