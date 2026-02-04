import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  RefreshCw, Play, Calendar, BarChart3, 
  CheckCircle, XCircle, Clock, AlertTriangle, Loader2,
  Newspaper, Settings, Database, Linkedin, Copy, ExternalLink, Grid3X3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BLOG_CLUSTERS, type BlogClusterKey } from '@/lib/blog/types';

export default function BlogAdminPage() {
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isBuildingCalendar, setIsBuildingCalendar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLinkedin, setGeneratingLinkedin] = useState<string | null>(null);
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
      
      (data || []).forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      });
      
      return { total: data?.length || 0, byStatus };
    }
  });

  // Fetch published posts count by category (12-cluster system)
  const { data: postsStats } = useQuery({
    queryKey: ['admin-posts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('status, category');
      if (error) throw error;
      
      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      
      (data || []).forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        if (item.category) {
          byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        }
      });
      
      return { total: data?.length || 0, byStatus, byCategory };
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

  // Fetch LinkedIn queue
  const { data: linkedinQueue } = useQuery({
    queryKey: ['admin-linkedin-queue'],
    queryFn: async () => {
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, publish_at, category')
        .eq('status', 'published')
        .order('publish_at', { ascending: false })
        .limit(50);
      if (postsError) throw postsError;
      return (posts || []).map(post => ({ ...post, linkedin: null }));
    }
  });

  // Mutations
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

  const generatePost = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post');
      if (error) throw error;
      
      if (data.skipped) {
        toast.warning(`Publicación saltada: ${data.reason}`);
      } else if (data.success) {
        toast.success(`¡Post publicado! "${data.post?.title}"`);
        
        try {
          await supabase.functions.invoke('trigger-site-deploy', {
            body: { post_id: data.post?.id, trigger_reason: 'blog_published' }
          });
          toast.info('Deploy SSG programado ✓');
        } catch (deployErr) {
          console.warn('Deploy trigger failed:', deployErr);
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
      if (!generatedText?.trim()) {
        toast.error('Se generó una respuesta vacía. Reintentá.');
        return;
      }

      setLinkedinCopyByPostId(prev => ({ ...prev, [postId]: generatedText }));
      toast.success('Copy de LinkedIn generado ✓');
      
      const copied = await copyToClipboard(generatedText);
      if (copied) toast.success('Copiado al portapapeles ✓');
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setGeneratingLinkedin(null);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
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
        linkedin: localText
          ? { status: 'queued', generated_text: localText, linkedin_post_urn: null }
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
            <p className="text-muted-foreground">Sistema de publicación automática SEO — 12 Clusters</p>
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refrescar
          </Button>
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
              <p className="text-xs text-muted-foreground">{planStats?.byStatus?.planned || 0} pendientes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Posts Publicados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{postsStats?.byStatus?.published || 0}</div>
              <p className="text-xs text-muted-foreground">{postsStats?.byStatus?.draft || 0} borradores</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Últimas 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentRuns?.filter(r => new Date(r.run_at) > new Date(Date.now() - 24*60*60*1000)).length || 0}
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
        <Tabs defaultValue="clusters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clusters">
              <Grid3X3 className="w-4 h-4 mr-2" />
              12 Clusters
            </TabsTrigger>
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
          </TabsList>

          {/* Clusters Tab - 12 Categories */}
          <TabsContent value="clusters">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  Distribución por Categoría (12 Clusters)
                </CardTitle>
                <CardDescription>
                  El sistema rota automáticamente entre categorías para balancear el contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(BLOG_CLUSTERS).map(([key, info]) => {
                    const count = postsStats?.byCategory?.[key] || 0;
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{info.emoji}</span>
                          <span className="font-medium text-sm">{info.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{count}</span>
                          <Badge variant="outline" className="text-xs">{info.pillar}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">🔄 Rotación Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada nuevo post se asigna automáticamente a la categoría con menos artículos, 
                    evitando repetir las últimas 3 categorías usadas. Esto garantiza una distribución 
                    equilibrada del contenido.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LinkedIn Tab - Improved */}
          <TabsContent value="linkedin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5" />
                  Generador de Copy para LinkedIn
                </CardTitle>
                <CardDescription>
                  Genera copy optimizado → copialo → publicalo en LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mergedLinkedinQueue?.map((item: any) => {
                    const blogUrl = `https://blog.vistaceo.com/${item.slug}`;
                    const hasGenerated = !!item.linkedin?.generated_text;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "rounded-xl border p-4 transition-all",
                          hasGenerated ? "bg-muted/30 border-primary/30" : "bg-card"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              {item.category && BLOG_CLUSTERS[item.category as BlogClusterKey] && (
                                <Badge variant="outline" className="text-xs">
                                  {BLOG_CLUSTERS[item.category as BlogClusterKey].emoji} {BLOG_CLUSTERS[item.category as BlogClusterKey].label}
                                </Badge>
                              )}
                              {item.publish_at && (
                                <span className="font-mono">
                                  {format(new Date(item.publish_at), 'dd MMM yyyy', { locale: es })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasGenerated ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" /> Listo
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" /> Pendiente
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Link del blog */}
                        <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                          <span className="text-xs text-muted-foreground">Link:</span>
                          <a 
                            href={blogUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline truncate flex-1"
                          >
                            {blogUrl}
                          </a>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2"
                            onClick={async () => {
                              await navigator.clipboard.writeText(blogUrl);
                              toast.success('Link copiado');
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Generated copy preview */}
                        {hasGenerated && (
                          <div className="mb-4">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Copy generado:</div>
                            <div className="relative">
                              <pre className="p-4 bg-background border rounded-xl text-sm whitespace-pre-wrap font-sans max-h-64 overflow-y-auto leading-relaxed">
                                {item.linkedin.generated_text}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                          {hasGenerated ? (
                            <>
                              <Button 
                                onClick={async () => {
                                  const ok = await copyToClipboard(item.linkedin.generated_text);
                                  toast[ok ? 'success' : 'error'](ok ? '¡Copiado! Pegalo en LinkedIn' : 'Error al copiar');
                                }}
                                className="flex-1"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Copy
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => window.open('https://www.linkedin.com/company/vistaceo/admin/page-posts/published/', '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ir a LinkedIn
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Allow regeneration
                                  setLinkedinCopyByPostId(prev => {
                                    const copy = { ...prev };
                                    delete copy[item.id];
                                    return copy;
                                  });
                                }}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              onClick={() => generateLinkedInCopy(item.id)}
                              disabled={generatingLinkedin === item.id}
                              className="flex-1"
                            >
                              {generatingLinkedin === item.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Generando...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Generar Copy con IA
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!linkedinQueue || linkedinQueue.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Linkedin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No hay posts publicados aún.</p>
                      <p className="text-sm">Generá tu primer post para empezar.</p>
                    </div>
                  )}
                </div>
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
                          <TableCell className="max-w-xs truncate">
                            {item.topic?.title_base || '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                      {(!upcomingPlan || upcomingPlan.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Historial de Ejecuciones
                </CardTitle>
                <CardDescription>Últimas 20 ejecuciones del Blog Factory</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRuns?.map((run: any) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(run.run_at), 'dd MMM HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell>{getStatusBadge(run.result)}</TableCell>
                          <TableCell>
                            {run.quality_gate_report?.score ? (
                              <Badge variant={run.quality_gate_report.score >= 75 ? 'default' : 'destructive'}>
                                {run.quality_gate_report.score}%
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {run.notes || run.skip_reason || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!recentRuns || recentRuns.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No hay ejecuciones registradas.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
