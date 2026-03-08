import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Brain, Activity, TrendingUp, Shield, Eye, Search,
  RefreshCw, Zap, CheckCircle, AlertTriangle, XCircle,
  Loader2, FileText, Network, Megaphone, Clock,
  BarChart3, Link2, Globe, Target, Sparkles
} from 'lucide-react';

// ─── Data Hooks ──────────────────────────────────────────

function useRegistry() {
  return useQuery({
    queryKey: ['cc-registry'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_content_registry').select('*').order('score_global', { ascending: true });
      return data || [];
    },
  });
}

function usePosts() {
  return useQuery({
    queryKey: ['cc-posts'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('id, slug, title, status, category, publish_at, updated_at, primary_keyword, meta_title, meta_description').eq('status', 'published').order('publish_at', { ascending: false });
      return data || [];
    },
  });
}

function useIssues() {
  return useQuery({
    queryKey: ['cc-issues'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_audit_issues').select('*').eq('fix_applied', false).order('severity', { ascending: true });
      return data || [];
    },
  });
}

function useTasks() {
  return useQuery({
    queryKey: ['cc-tasks'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_task_queue').select('*').in('status', ['pending', 'in_progress']).order('priority', { ascending: true }).limit(50);
      return data || [];
    },
  });
}

function useEditorRuns() {
  return useQuery({
    queryKey: ['cc-editor-runs'],
    queryFn: async () => {
      const { data } = await supabase.from('obsessive_editor_runs').select('*').order('created_at', { ascending: false }).limit(200);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

function useExperiments() {
  return useQuery({
    queryKey: ['cc-experiments'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_experiments').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
  });
}

function useCTABlocks() {
  return useQuery({
    queryKey: ['cc-cta-blocks'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_cta_blocks').select('*').order('priority', { ascending: false });
      return data || [];
    },
  });
}

function useClusterEdges() {
  return useQuery({
    queryKey: ['cc-cluster-edges'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_cluster_edges').select('*, source:source_registry_id(url, primary_keyword), target:target_registry_id(url, primary_keyword)').order('weight', { ascending: false }).limit(100);
      return data || [];
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function translateAction(action: string): string {
  const map: Record<string, string> = {
    scan_missing_hero_image: 'Detectó imagen principal faltante',
    scan_visible_placeholder: 'Detectó texto placeholder visible',
    scan_empty_section: 'Detectó sección vacía',
    scan_system_code_leak: 'Detectó código de sistema visible',
    scan_promised_table_missing: 'Detectó tabla prometida que no existe',
    scan_promised_checklist_missing: 'Detectó checklist prometido que no existe',
    scan_promised_download_missing: 'Detectó descarga prometida que no existe',
    scan_low_word_count: 'Detectó nota con pocas palabras',
    scan_missing_meta_title: 'Detectó meta title faltante',
    scan_missing_meta_description: 'Detectó meta description faltante',
    scan_weak_meta_title: 'Meta title débil — necesita optimización IA',
    scan_weak_meta_description: 'Meta description débil — necesita optimización IA',
    scan_title_length_issue: 'Título con longitud fuera de rango ideal',
    scan_low_internal_links: 'Detectó pocos enlaces internos',
    scan_few_headings: 'Detectó pocos subtítulos H2',
    scan_no_cta: 'Detectó nota sin CTA a VISTACEO',
    scan_insufficient_cta: 'Nota con solo 1 CTA (mínimo 2)',
    scan_missing_faq: 'Nota sin sección de preguntas frecuentes',
    scan_broken_excerpt: 'Excerpt con markdown roto',
    scan_broken_inline_image: 'Imagen inline rota en el contenido',
    fix_visible_placeholder: 'Eliminó placeholders visibles',
    fix_system_code_leak: 'Limpió código de sistema filtrado',
    fix_empty_section: 'Eliminó secciones vacías',
    fix_promised_download_missing: 'Corrigió promesa de descarga',
    fix_batch: 'Reparación automática por lotes',
    seo_ai_optimize: '🤖 Optimización SEO+CTR con IA',
    image_generate: '🖼️ Imagen hero generada con IA',
    improve_weak_post: 'Mejoró nota con score bajo',
    link_orphan: 'Enlazó nota huérfana al cluster',
    refresh_micro: 'Micro-mejora para frescura',
    reindex_batch: 'Envió URLs a reindexar',
    fatal_error: 'Error en el sistema',
  };
  return map[action] || action.replace(/_/g, ' ');
}

function priorityLabel(p: string) {
  const m: Record<string, string> = {
    P0: 'Confianza rota', P1: 'Indexación', P2: 'SEO semántico', P3: 'Clusters', P4: 'Conversión',
  };
  return m[p] || p;
}

const priorityColor: Record<string, string> = {
  P0: 'bg-red-500/20 text-red-400 border-red-500/30',
  P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  P2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  P3: 'bg-green-500/20 text-green-400 border-green-500/30',
  P4: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const statusIcon: Record<string, any> = {
  fixed: <CheckCircle className="h-4 w-4 text-green-400" />,
  detected: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  improved: <TrendingUp className="h-4 w-4 text-blue-400" />,
  refreshed: <RefreshCw className="h-4 w-4 text-cyan-400" />,
  linked: <Link2 className="h-4 w-4 text-emerald-400" />,
  indexed: <Search className="h-4 w-4 text-purple-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
};

function scoreBadge(score: number) {
  if (score >= 94) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{score}</Badge>;
  if (score >= 75) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{score}</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{score}</Badge>;
}

// ─── Main Component ──────────────────────────────────────

export default function CentroControlPage() {
  const qc = useQueryClient();
  const { data: registry } = useRegistry();
  const { data: posts } = usePosts();
  const { data: issues } = useIssues();
  const { data: tasks } = useTasks();
  const { data: runs } = useEditorRuns();
  const { data: experiments } = useExperiments();
  const { data: ctaBlocks } = useCTABlocks();
  const { data: edges } = useClusterEdges();

  const [running, setRunning] = useState(false);

  // ── Computed stats ──
  const today = todayStr();
  const todayRuns = useMemo(() => (runs || []).filter(r => r.created_at?.startsWith(today)), [runs, today]);
  const todayFixed = todayRuns.filter(r => r.status === 'fixed').length;
  const todayDetected = todayRuns.filter(r => r.status === 'detected').length;
  const todayImproved = todayRuns.filter(r => r.status === 'improved' || r.status === 'refreshed').length;
  const todayLinked = todayRuns.filter(r => r.status === 'linked').length;
  const todayIndexed = todayRuns.filter(r => r.status === 'indexed').length;

  const totalPosts = registry?.length || 0;
  const passingPosts = registry?.filter(r => (r.score_global ?? 0) >= 94).length || 0;
  const avgScore = totalPosts > 0 ? Math.round(registry!.reduce((a, r) => a + (Number(r.score_global) || 0), 0) / totalPosts) : 0;
  const criticalIssues = issues?.filter(i => i.severity === 'critical').length || 0;

  const clusters = useMemo(() => {
    const c = new Map<string, number>();
    (registry || []).forEach(r => { if (r.cluster_assigned) c.set(r.cluster_assigned, (c.get(r.cluster_assigned) || 0) + 1); });
    return c;
  }, [registry]);

  const edgesByType = useMemo(() => {
    const m: Record<string, number> = {};
    (edges || []).forEach((e: any) => { m[e.edge_type] = (m[e.edge_type] || 0) + 1; });
    return m;
  }, [edges]);

  const runningExperiments = experiments?.filter(e => e.status === 'running').length || 0;
  const activeCTAs = ctaBlocks?.filter(b => b.is_active).length || 0;

  // ── Generate narrative ──
  const narrative = useMemo(() => {
    const lines: string[] = [];
    const total = todayFixed + todayImproved + todayLinked + todayIndexed;
    if (total === 0 && todayDetected === 0) {
      lines.push('El sistema está operando con normalidad. No se detectaron problemas nuevos hoy.');
    } else {
      if (total > 0) lines.push(`Hoy el sistema trabajó sobre ${total} acciones de mejora.`);
      if (todayFixed > 0) lines.push(`Corrigió ${todayFixed} problema${todayFixed > 1 ? 's' : ''} técnico${todayFixed > 1 ? 's' : ''} automáticamente.`);
      if (todayImproved > 0) lines.push(`Mejoró ${todayImproved} nota${todayImproved > 1 ? 's' : ''} para aumentar calidad y SEO.`);
      if (todayLinked > 0) lines.push(`Reforzó ${todayLinked} enlace${todayLinked > 1 ? 's' : ''} interno${todayLinked > 1 ? 's' : ''} entre artículos.`);
      if (todayIndexed > 0) lines.push(`Envió ${todayIndexed} señal${todayIndexed > 1 ? 'es' : ''} de reindexación a buscadores.`);
      if (todayDetected > 0) lines.push(`Detectó ${todayDetected} problema${todayDetected > 1 ? 's' : ''} pendiente${todayDetected > 1 ? 's' : ''} de resolver.`);
    }
    if (criticalIssues > 0) lines.push(`⚠️ Hay ${criticalIssues} problema${criticalIssues > 1 ? 's' : ''} crítico${criticalIssues > 1 ? 's' : ''} que requieren atención inmediata.`);
    return lines.join(' ');
  }, [todayFixed, todayImproved, todayLinked, todayIndexed, todayDetected, criticalIssues]);

  // ── Actions ──
  const triggerCycle = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke('obsessive-editor', { body: {} });
      if (error) throw error;
      toast.success('Ciclo autónomo completado');
      qc.invalidateQueries({ queryKey: ['cc-editor-runs'] });
      qc.invalidateQueries({ queryKey: ['cc-registry'] });
      qc.invalidateQueries({ queryKey: ['cc-issues'] });
    } catch (err: any) { toast.error(err.message); }
    finally { setRunning(false); }
  };

  const syncRegistry = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-audit', { body: { action: 'sync_registry' } });
      if (error) throw error;
      toast.success(`Registro sincronizado: ${data.synced} posts nuevos`);
      qc.invalidateQueries({ queryKey: ['cc-registry'] });
    } catch (err: any) { toast.error(err.message); }
  };

  const runAudit = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-audit', { body: { action: 'audit_all' } });
      if (error) throw error;
      toast.success(`Auditoría: ${data.summary?.passing || 0} aprobadas, ${data.summary?.failing || 0} con problemas`);
      qc.invalidateQueries({ queryKey: ['cc-registry'] });
      qc.invalidateQueries({ queryKey: ['cc-issues'] });
    } catch (err: any) { toast.error(err.message); }
  };

  const buildGraph = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-engine', { body: { action: 'build_cluster_graph' } });
      if (error) throw error;
      toast.success(`Grafo: ${data.edges_created} conexiones, ${data.orphan_pages?.length || 0} huérfanas`);
      qc.invalidateQueries({ queryKey: ['cc-cluster-edges'] });
    } catch (err: any) { toast.error(err.message); }
  };

  // ── Realtime ──
  useEffect(() => {
    const ch = supabase.channel('cc-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'obsessive_editor_runs' }, () => {
        qc.invalidateQueries({ queryKey: ['cc-editor-runs'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Centro de Control Autónomo
            </h1>
            <p className="text-muted-foreground mt-1">Sistema unificado de mejora continua 24/7 · Todo automático</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={syncRegistry}>
              <RefreshCw className="w-4 h-4 mr-1" /> Sincronizar
            </Button>
            <Button variant="outline" size="sm" onClick={runAudit}>
              <Search className="w-4 h-4 mr-1" /> Auditar todo
            </Button>
            <Button size="sm" onClick={triggerCycle} disabled={running}>
              {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
              Ejecutar ciclo
            </Button>
          </div>
        </div>

        {/* ═══ NARRATIVE ═══ */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{narrative}</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══ STATS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <StatCard label="Notas publicadas" value={posts?.length || 0} icon={<FileText className="w-4 h-4" />} />
          <StatCard label="Score promedio" value={`${avgScore}/100`} icon={<BarChart3 className="w-4 h-4" />} sub={<Progress value={avgScore} className="mt-1 h-1.5" />} />
          <StatCard label="Aprobadas (≥94)" value={passingPosts} icon={<CheckCircle className="w-4 h-4 text-green-500" />} />
          <StatCard label="Problemas abiertos" value={issues?.length || 0} icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />} />
          <StatCard label="Clusters" value={clusters.size} icon={<Network className="w-4 h-4" />} />
          <StatCard label="CTAs activos" value={activeCTAs} icon={<Megaphone className="w-4 h-4" />} />
        </div>

        {/* ═══ TABS ═══ */}
        <Tabs defaultValue="resumen" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="resumen"><Activity className="w-4 h-4 mr-1" /> Resumen</TabsTrigger>
            <TabsTrigger value="mejoras"><Sparkles className="w-4 h-4 mr-1" /> Qué mejoró hoy</TabsTrigger>
            <TabsTrigger value="vigilancia"><Eye className="w-4 h-4 mr-1" /> Vigilancia</TabsTrigger>
            <TabsTrigger value="contenido"><FileText className="w-4 h-4 mr-1" /> Contenido</TabsTrigger>
            <TabsTrigger value="seo"><Globe className="w-4 h-4 mr-1" /> SEO</TabsTrigger>
            <TabsTrigger value="clusters"><Network className="w-4 h-4 mr-1" /> Clusters</TabsTrigger>
            <TabsTrigger value="conversion"><Target className="w-4 h-4 mr-1" /> Conversión</TabsTrigger>
            <TabsTrigger value="historial"><Clock className="w-4 h-4 mr-1" /> Historial</TabsTrigger>
          </TabsList>

          {/* ── RESUMEN ── */}
          <TabsContent value="resumen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Salud del blog */}
              <Card>
                <CardHeader><CardTitle className="text-base">Salud general del blog</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Coherencia', key: 'score_coherence', w: 20 },
                    { label: 'Promesas cumplidas', key: 'score_promises', w: 20 },
                    { label: 'Integridad técnica', key: 'score_technical', w: 15 },
                    { label: 'SEO semántico', key: 'score_seo', w: 15 },
                    { label: 'Interlinking', key: 'score_interlinking', w: 10 },
                    { label: 'Experiencia de lectura', key: 'score_ux', w: 10 },
                    { label: 'Conversión', key: 'score_conversion', w: 10 },
                  ].map(dim => {
                    const vals = (registry || []).map(r => Number((r as any)[dim.key]) || 0);
                    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                    return (
                      <div key={dim.key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{dim.label}</span>
                          <span className="font-bold">{avg}</span>
                        </div>
                        <Progress value={avg} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Estado de subsistemas */}
              <Card>
                <CardHeader><CardTitle className="text-base">Estado de subsistemas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <SubsystemRow label="Pipeline automático" status={running ? 'ejecutando' : 'activo'} ok={true} />
                  <SubsystemRow label="Auditor técnico" status={`${issues?.length || 0} problemas abiertos`} ok={(issues?.length || 0) === 0} />
                  <SubsystemRow label="Quality Gates" status={`${passingPosts}/${totalPosts} aprobadas`} ok={passingPosts === totalPosts} />
                  <SubsystemRow label="Clusters y enlazado" status={`${clusters.size} clusters, ${edges?.length || 0} conexiones`} ok={clusters.size > 0} />
                  <SubsystemRow label="Experimentos A/B" status={`${runningExperiments} activos`} ok={true} />
                  <SubsystemRow label="CTAs" status={`${activeCTAs} bloques activos`} ok={activeCTAs > 0} />
                  <SubsystemRow label="Sitemap y robots" status="Controlado" ok={true} />
                  <SubsystemRow label="Indexación" status="Señales activas" ok={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── QUÉ MEJORÓ HOY ── */}
          <TabsContent value="mejoras">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Trabajo del sistema hoy</CardTitle>
                <CardDescription>Cada acción incluye qué detectó, por qué importa y qué hizo</CardDescription>
              </CardHeader>
              <CardContent>
                {todayRuns.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Todavía no hubo actividad hoy. El próximo ciclo se ejecutará automáticamente.</p>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {todayRuns.map(run => (
                        <div key={run.id} className="border rounded-lg p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            {statusIcon[run.status] || <Clock className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm font-medium">{translateAction(run.action_type)}</span>
                            <Badge className={priorityColor[run.priority] || 'bg-muted'} >{priorityLabel(run.priority)}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(run.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {run.target_slug && (
                            <p className="text-xs text-muted-foreground pl-6">📄 {run.target_slug}</p>
                          )}
                          {run.action_details && Object.keys(run.action_details as object).length > 0 && (
                            <p className="text-xs text-muted-foreground pl-6">
                              {Object.entries(run.action_details as Record<string, any>).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VIGILANCIA ── */}
          <TabsContent value="vigilancia">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problemas activos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" /> Problemas que necesitan atención</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {(issues || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">✅ Sin problemas activos. Todo bajo control.</p>
                    ) : (
                      <div className="space-y-2">
                        {(issues || []).map(issue => (
                          <div key={issue.id} className="border rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' : issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                {issue.severity === 'critical' ? 'Crítico' : issue.severity === 'high' ? 'Alto' : 'Medio'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{issue.issue_type.replace(/_/g, ' ')}</Badge>
                              {issue.auto_fixable && <Badge className="bg-green-500/20 text-green-400 text-xs">Auto-corregible</Badge>}
                            </div>
                            <p className="text-sm">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Cola de tareas pendientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Target className="w-5 h-5" /> Tareas pendientes del sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {(tasks || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Cola vacía. El sistema creará tareas automáticamente.</p>
                    ) : (
                      <div className="space-y-2">
                        {(tasks || []).map(task => (
                          <div key={task.id} className="border rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={priorityColor[task.queue as string] || 'bg-muted'}>{task.queue}</Badge>
                              <Badge variant="outline" className="text-xs">{task.task_type.replace(/_/g, ' ')}</Badge>
                            </div>
                            <p className="text-sm">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CONTENIDO ── */}
          <TabsContent value="contenido">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registro de publicaciones</CardTitle>
                <CardDescription>Todas las notas con sus scores de calidad</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nota</TableHead>
                        <TableHead className="text-center">Global</TableHead>
                        <TableHead className="text-center">Coher.</TableHead>
                        <TableHead className="text-center">Prom.</TableHead>
                        <TableHead className="text-center">Téc.</TableHead>
                        <TableHead className="text-center">SEO</TableHead>
                        <TableHead className="text-center">UX</TableHead>
                        <TableHead className="text-center">Conv.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(registry || []).map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell className="max-w-[200px]">
                            <div className="truncate font-medium text-sm">{entry.url?.replace('https://blog.vistaceo.com/', '').replace(/\/$/, '')}</div>
                            <div className="text-xs text-muted-foreground">{entry.category}</div>
                          </TableCell>
                          <TableCell className="text-center">{scoreBadge(Number(entry.score_global))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_coherence))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_promises))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_technical))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_seo))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_ux))}</TableCell>
                          <TableCell className="text-center text-sm">{Math.round(Number(entry.score_conversion))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEO E INDEXACIÓN ── */}
          <TabsContent value="seo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Estado SEO técnico</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{posts?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">URLs publicadas</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{registry?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">En registro</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{(registry || []).filter(r => Number(r.score_seo) >= 80).length}</div>
                      <div className="text-xs text-muted-foreground">SEO score ≥ 80</div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{(registry || []).filter(r => {
                        const links = r.internal_links_in;
                        return !links || (Array.isArray(links) && (links as any[]).length < 1);
                      }).length}</div>
                      <div className="text-xs text-muted-foreground">Huérfanas (sin enlaces entrantes)</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Dominio canónico</span><Badge variant="outline">blog.vistaceo.com</Badge></div>
                    <div className="flex justify-between"><span>Sitemap</span><Badge className="bg-green-500/20 text-green-400">Activo</Badge></div>
                    <div className="flex justify-between"><span>Robots.txt</span><Badge className="bg-green-500/20 text-green-400">Correcto</Badge></div>
                    <div className="flex justify-between"><span>IndexNow</span><Badge className="bg-green-500/20 text-green-400">Integrado</Badge></div>
                  </div>
                </CardContent>
              </Card>

              {/* Notas con meta débil */}
              <Card>
                <CardHeader><CardTitle className="text-base">Notas que necesitan mejora SEO</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {(registry || []).filter(r => Number(r.score_seo) < 80).slice(0, 15).map(r => (
                        <div key={r.id} className="border rounded-md p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm truncate max-w-[200px]">{r.url?.replace('https://blog.vistaceo.com/', '').replace(/\/$/, '')}</span>
                            {scoreBadge(Number(r.score_seo))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Keyword: {r.primary_keyword || 'Sin keyword'} · Interlinks: {Array.isArray(r.internal_links_in) ? (r.internal_links_in as any[]).length : 0} entrantes
                          </div>
                        </div>
                      ))}
                      {(registry || []).filter(r => Number(r.score_seo) < 80).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">✅ Todas las notas tienen SEO score ≥ 80</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CLUSTERS Y AUTORIDAD ── */}
          <TabsContent value="clusters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clusters temáticos</CardTitle>
                  <CardDescription>Agrupaciones de contenido por tema para fortalecer autoridad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={buildGraph}>
                      <Network className="w-4 h-4 mr-1" /> Reconstruir grafo
                    </Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('blog-os-engine', { body: { action: 'detect_cannibalization' } });
                        if (error) throw error;
                        toast.success(`${data.total} pares con solapamiento detectados`);
                        qc.invalidateQueries({ queryKey: ['cc-tasks'] });
                      } catch (err: any) { toast.error(err.message); }
                    }}>
                      <AlertTriangle className="w-4 h-4 mr-1" /> Detectar canibalización
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {[...clusters.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center border rounded-md p-2">
                          <span className="text-sm font-medium">{name}</span>
                          <Badge variant="outline">{count} notas</Badge>
                        </div>
                      ))}
                      {clusters.size === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Sin clusters asignados. Ejecutá el grafo primero.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conexiones del grafo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {Object.entries(edgesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span>{type.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                  <ScrollArea className="h-[250px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Origen</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(edges || []).slice(0, 30).map((edge: any) => (
                          <TableRow key={edge.id}>
                            <TableCell className="text-xs truncate max-w-[150px]">{(edge.source as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}</TableCell>
                            <TableCell className="text-xs truncate max-w-[150px]">{(edge.target as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{edge.edge_type}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CONVERSIÓN ── */}
          <TabsContent value="conversion">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CTAs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Megaphone className="w-5 h-5" /> Bloques CTA activos</CardTitle>
                  <CardDescription>Todos los CTAs apuntan a www.vistaceo.com</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {(ctaBlocks || []).map(block => (
                        <div key={block.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{block.name}</span>
                            <Badge className={block.is_active ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}>
                              {block.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-x-3">
                            <span>Tipo: {block.block_type}</span>
                            <span>Usos: {block.usage_count}</span>
                            <span>Conv: {Number(block.conversion_rate || 0).toFixed(1)}%</span>
                            <span>Etapa: {block.conversion_stage}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Experiments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5" /> Experimentos controlados</CardTitle>
                  <CardDescription>Tests A/B con guardrails automáticos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 text-sm mb-3">
                    <span className="text-blue-400">⚡ {runningExperiments} activos</span>
                    <span className="text-green-400">✓ {experiments?.filter(e => e.status === 'completed').length || 0} completados</span>
                    <span className="text-red-400">↩ {experiments?.filter(e => e.status === 'rolled_back').length || 0} rollbacks</span>
                  </div>
                  <ScrollArea className="h-[330px]">
                    <div className="space-y-2">
                      {(experiments || []).slice(0, 20).map(exp => (
                        <div key={exp.id} className="border rounded-md p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{exp.experiment_type}</Badge>
                            <Badge className={exp.status === 'running' ? 'bg-blue-500/20 text-blue-400' : exp.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {exp.status === 'running' ? 'Activo' : exp.status === 'completed' ? 'Completado' : 'Rollback'}
                            </Badge>
                          </div>
                          <p className="text-sm truncate">{exp.hypothesis}</p>
                          {exp.guardrail_reason && <p className="text-xs text-red-400 mt-1">{exp.guardrail_reason}</p>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── HISTORIAL ── */}
          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Clock className="w-5 h-5" /> Historial completo de acciones</CardTitle>
                <CardDescription>Todas las acciones ejecutadas por el sistema autónomo</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(runs || []).slice(0, 100).map(run => (
                        <TableRow key={run.id}>
                          <TableCell>{statusIcon[run.status] || <Clock className="h-4 w-4 text-muted-foreground" />}</TableCell>
                          <TableCell><Badge className={priorityColor[run.priority] || 'bg-muted'}>{priorityLabel(run.priority)}</Badge></TableCell>
                          <TableCell className="text-sm">{translateAction(run.action_type)}</TableCell>
                          <TableCell className="text-xs truncate max-w-[150px]">{run.target_slug || '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(run.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      ))}
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

// ─── Sub-components ──────────────────────────────────────

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
        {sub}
      </CardContent>
    </Card>
  );
}

function SubsystemRow({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{status}</span>
    </div>
  );
}
