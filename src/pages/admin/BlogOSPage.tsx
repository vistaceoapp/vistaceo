import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle,
  Loader2, Zap, Target, FileText, Eye, TrendingUp,
  AlertCircle, Bug, Search, Network, FlaskConical, Megaphone
} from 'lucide-react';
import BlogOSClustersTab from './blog-os/BlogOSClustersTab';
import BlogOSExperimentsTab from './blog-os/BlogOSExperimentsTab';
import BlogOSCTALibraryTab from './blog-os/BlogOSCTALibraryTab';
import ObsessiveEditorTab from './blog-os/ObsessiveEditorTab';

export default function BlogOSPage() {
  const queryClient = useQueryClient();
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fixingPost, setFixingPost] = useState<string | null>(null);

  const { data: registry, isLoading: loadingRegistry } = useQuery({
    queryKey: ['blog-os-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_content_registry')
        .select('*')
        .order('score_global', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: issues } = useQuery({
    queryKey: ['blog-os-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_audit_issues')
        .select('*')
        .eq('fix_applied', false)
        .order('severity', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['blog-os-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_task_queue')
        .select('*')
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const syncRegistry = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-audit', {
        body: { action: 'sync_registry' },
      });
      if (error) throw error;
      toast.success(`Registry sincronizado: ${data.synced} posts nuevos`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-registry'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const runFullAudit = async () => {
    setIsAuditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-audit', {
        body: { action: 'audit_all' },
      });
      if (error) throw error;
      toast.success(`Auditoría completa: ${data.summary.passing} passing, ${data.summary.failing} failing`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-registry'] });
      queryClient.invalidateQueries({ queryKey: ['blog-os-issues'] });
      queryClient.invalidateQueries({ queryKey: ['blog-os-tasks'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const auditSingle = async (postId: string) => {
    setFixingPost(postId);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-audit', {
        body: { action: 'audit_single', post_id: postId },
      });
      if (error) throw error;
      toast.success(`Score: ${data.result.score_global}/100`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-registry'] });
      queryClient.invalidateQueries({ queryKey: ['blog-os-issues'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setFixingPost(null);
    }
  };

  const totalPosts = registry?.length || 0;
  const passingPosts = registry?.filter(r => r.score_global >= 94).length || 0;
  const failingPosts = totalPosts - passingPosts;
  const avgScore = totalPosts > 0
    ? Math.round(registry!.reduce((a, r) => a + (Number(r.score_global) || 0), 0) / totalPosts)
    : 0;
  const criticalIssues = issues?.filter(i => i.severity === 'critical').length || 0;
  const highIssues = issues?.filter(i => i.severity === 'high').length || 0;

  const getScoreBadge = (score: number) => {
    if (score >= 94) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{score}</Badge>;
    if (score >= 75) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{score}</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{score}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medio</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getQueueBadge = (queue: string) => {
    const colors: Record<string, string> = {
      Q1: 'bg-red-500/20 text-red-400',
      Q2: 'bg-orange-500/20 text-orange-400',
      Q3: 'bg-blue-500/20 text-blue-400',
      Q4: 'bg-green-500/20 text-green-400',
      Q5: 'bg-purple-500/20 text-purple-400',
    };
    return <Badge className={colors[queue] || 'bg-muted'}>{queue}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Blog OS — Modo Dios
            </h1>
            <p className="text-muted-foreground">Registry · Quality Gates · Auditor · Clusters · CRO · A/B · Obsessive Editor 24/7</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncRegistry} disabled={isSyncing}>
              {isSyncing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Sync Registry
            </Button>
            <Button size="sm" onClick={runFullAudit} disabled={isAuditing}>
              {isAuditing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
              Auditar Todo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-sm text-muted-foreground">Total Posts</div>
              <div className="text-2xl font-bold">{totalPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Passing
              </div>
              <div className="text-2xl font-bold text-green-500">{passingPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" /> Failing
              </div>
              <div className="text-2xl font-bold text-destructive">{failingPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-sm text-muted-foreground">Score Promedio</div>
              <div className="text-2xl font-bold">{avgScore}/100</div>
              <Progress value={avgScore} className="mt-1 h-1.5" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-destructive" /> Críticos
              </div>
              <div className="text-2xl font-bold text-destructive">{criticalIssues}</div>
              <div className="text-xs text-muted-foreground">{highIssues} altos</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="registry" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="registry"><FileText className="w-4 h-4 mr-1" /> Registry</TabsTrigger>
            <TabsTrigger value="issues"><Bug className="w-4 h-4 mr-1" /> Issues ({issues?.length || 0})</TabsTrigger>
            <TabsTrigger value="tasks"><Target className="w-4 h-4 mr-1" /> Cola ({tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="scores"><TrendingUp className="w-4 h-4 mr-1" /> Scores</TabsTrigger>
            <TabsTrigger value="clusters"><Network className="w-4 h-4 mr-1" /> Clusters</TabsTrigger>
            <TabsTrigger value="experiments"><FlaskConical className="w-4 h-4 mr-1" /> A/B Tests</TabsTrigger>
            <TabsTrigger value="cta"><Megaphone className="w-4 h-4 mr-1" /> CTAs</TabsTrigger>
            <TabsTrigger value="obsessive"><Zap className="w-4 h-4 mr-1" /> Editor 24/7</TabsTrigger>
          </TabsList>

          {/* Registry Tab */}
          <TabsContent value="registry">
            <Card>
              <CardHeader>
                <CardTitle>Content Registry</CardTitle>
                <CardDescription>Registro único de cada nota con scores y estado</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRegistry ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead className="text-center">Global</TableHead>
                          <TableHead className="text-center">Coher.</TableHead>
                          <TableHead className="text-center">Promesas</TableHead>
                          <TableHead className="text-center">Técnico</TableHead>
                          <TableHead className="text-center">SEO</TableHead>
                          <TableHead className="text-center">UX</TableHead>
                          <TableHead className="text-center">Conv.</TableHead>
                          <TableHead className="text-center">Fallas</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registry?.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="max-w-[200px]">
                              <div className="truncate font-medium text-sm">{entry.url?.replace('https://blog.vistaceo.com/', '').replace('/', '')}</div>
                              <div className="text-xs text-muted-foreground">{entry.category}</div>
                            </TableCell>
                            <TableCell className="text-center">{getScoreBadge(Number(entry.score_global))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_coherence))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_promises))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_technical))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_seo))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_ux))}</TableCell>
                            <TableCell className="text-center text-sm">{Math.round(Number(entry.score_conversion))}</TableCell>
                            <TableCell className="text-center">
                              {(entry.fault_radar as string[] || []).length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {(entry.fault_radar as string[]).length}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => auditSingle(entry.post_id)} disabled={fixingPost === entry.post_id}>
                                {fixingPost === entry.post_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Issues Activos</CardTitle>
                <CardDescription>Problemas detectados que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Severidad</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Auto-fix</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues?.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell><Badge variant="outline">{issue.issue_type}</Badge></TableCell>
                          <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                          <TableCell className="max-w-[300px] text-sm">{issue.description}</TableCell>
                          <TableCell>
                            {issue.auto_fixable ? (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">Sí</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(issue.created_at).toLocaleDateString('es')}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!issues || issues.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Sin issues activos. Ejecutá una auditoría para escanear.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Cola de Tareas Q1–Q5</CardTitle>
                <CardDescription>Q1 Críticas · Q2 SEO · Q3 Conversión · Q4 Editorial · Q5 Experimentación</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cola</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks?.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{getQueueBadge(task.queue)}</TableCell>
                          <TableCell className="text-center font-mono">{task.priority}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{task.task_type}</Badge></TableCell>
                          <TableCell className="max-w-[300px] text-sm">{task.description}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{task.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {(!tasks || tasks.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Cola vacía. Las tareas se crean automáticamente al auditar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Distribución de Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['coherence', 'promises', 'technical', 'seo', 'interlinking', 'ux', 'conversion'].map((dim) => {
                    const values = registry?.map(r => Number((r as any)[`score_${dim}`]) || 0) || [];
                    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
                    const weight = { coherence: 20, promises: 20, technical: 15, seo: 15, interlinking: 10, ux: 10, conversion: 10 }[dim] || 0;
                    const labels: Record<string, string> = {
                      coherence: 'Coherencia', promises: 'Promesas', technical: 'Integridad Técnica',
                      seo: 'SEO Semántico', interlinking: 'Interlinking', ux: 'UX Humana', conversion: 'Conversión',
                    };
                    return (
                      <div key={dim} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{labels[dim]}</span>
                          <span className="text-xs text-muted-foreground">peso: {weight}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={avg} className="flex-1 h-2" />
                          <span className="text-sm font-bold w-10 text-right">{avg}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clusters Tab */}
          <TabsContent value="clusters">
            <BlogOSClustersTab />
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments">
            <BlogOSExperimentsTab />
          </TabsContent>

          {/* CTA Library Tab */}
          <TabsContent value="cta">
            <BlogOSCTALibraryTab />
          </TabsContent>

          {/* Obsessive Editor 24/7 Tab */}
          <TabsContent value="obsessive">
            <ObsessiveEditorTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
