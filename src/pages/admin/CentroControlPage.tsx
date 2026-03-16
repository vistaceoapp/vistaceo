import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Brain, Activity, TrendingUp, Shield, Eye, Search,
  RefreshCw, Zap, CheckCircle, AlertTriangle, XCircle,
  Loader2, FileText, Network, Megaphone, Clock,
  BarChart3, Globe, Target, Sparkles, Linkedin
} from 'lucide-react';
import LinkedInCopyTab from './blog-os/LinkedInCopyTab';

// ── Data Hooks ──

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

// ── Helpers ──

function todayStr() { return new Date().toISOString().split('T')[0]; }

const actionLabels: Record<string, string> = {
  scan_missing_hero_image: 'Imagen hero faltante',
  scan_visible_placeholder: 'Placeholder visible',
  scan_empty_section: 'Sección vacía',
  scan_system_code_leak: 'Código de sistema visible',
  scan_promised_table_missing: 'Tabla prometida faltante',
  scan_promised_checklist_missing: 'Checklist prometido faltante',
  scan_promised_download_missing: 'Descarga prometida faltante',
  scan_low_word_count: 'Pocas palabras',
  scan_missing_meta_title: 'Meta title faltante',
  scan_missing_meta_description: 'Meta description faltante',
  scan_weak_meta_title: 'Meta title débil',
  scan_weak_meta_description: 'Meta description débil',
  scan_title_length_issue: 'Título fuera de rango',
  scan_low_internal_links: 'Pocos enlaces internos',
  scan_few_headings: 'Pocos subtítulos H2',
  scan_no_cta: 'Sin CTA',
  scan_insufficient_cta: 'Solo 1 CTA (mín. 2)',
  scan_missing_faq: 'Sin FAQ',
  scan_broken_excerpt: 'Excerpt con markdown roto',
  scan_broken_inline_image: 'Imagen inline rota',
  fix_visible_placeholder: 'Eliminó placeholders',
  fix_system_code_leak: 'Limpió código filtrado',
  fix_empty_section: 'Eliminó secciones vacías',
  fix_promised_download_missing: 'Corrigió promesa de descarga',
  fix_batch: 'Reparación por lotes',
  seo_ai_optimize: 'Optimización SEO con IA',
  image_generate: 'Imagen hero generada',
  improve_weak_post: 'Nota mejorada',
  link_orphan: 'Enlazó nota huérfana',
  refresh_micro: 'Micro-mejora de frescura',
  reindex_batch: 'URLs reindexadas',
};

function translateAction(a: string) { return actionLabels[a] || a.replace(/_/g, ' '); }

const statusColors: Record<string, string> = {
  fixed: 'text-emerald-500', detected: 'text-amber-500', improved: 'text-blue-500',
  refreshed: 'text-cyan-500', linked: 'text-emerald-500', indexed: 'text-violet-500', error: 'text-destructive',
};

const StatusIcon = ({ status }: { status: string }) => {
  const cls = `w-4 h-4 ${statusColors[status] || 'text-muted-foreground'}`;
  switch (status) {
    case 'fixed': return <CheckCircle className={cls} />;
    case 'detected': return <AlertTriangle className={cls} />;
    case 'improved': return <TrendingUp className={cls} />;
    case 'refreshed': return <RefreshCw className={cls} />;
    case 'linked': return <Network className={cls} />;
    case 'indexed': return <Search className={cls} />;
    case 'error': return <XCircle className={cls} />;
    default: return <Clock className={cls} />;
  }
};

function scoreBadge(score: number) {
  if (score >= 97) return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20 dark:text-purple-400">🏆 {score}</Badge>;
  if (score >= 94) return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">⭐ {score}</Badge>;
  if (score >= 90) return <Badge className="bg-green-500/15 text-green-600 border-green-500/20 dark:text-green-400">✓ {score}</Badge>;
  if (score >= 85) return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-400">⚠ {score}</Badge>;
  return <Badge className="bg-destructive/15 text-destructive border-destructive/20">✗ {score}</Badge>;
}

const priorityMeta: Record<string, { label: string; color: string }> = {
  P0: { label: 'Confianza rota', color: 'bg-destructive/15 text-destructive border-destructive/20' },
  P1: { label: 'Indexación', color: 'bg-orange-500/15 text-orange-600 border-orange-500/20 dark:text-orange-400' },
  P2: { label: 'SEO semántico', color: 'bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-400' },
  P3: { label: 'Clusters', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
  P4: { label: 'Conversión', color: 'bg-violet-500/15 text-violet-600 border-violet-500/20 dark:text-violet-400' },
};

// ── Main Component ──

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
  const [refreshingImages, setRefreshingImages] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const today = todayStr();
  const todayRuns = useMemo(() => (runs || []).filter(r => r.created_at?.startsWith(today)), [runs, today]);
  const todayFixed = todayRuns.filter(r => r.status === 'fixed').length;
  const todayDetected = todayRuns.filter(r => r.status === 'detected').length;
  const todayImproved = todayRuns.filter(r => r.status === 'improved' || r.status === 'refreshed').length;
  const todayLinked = todayRuns.filter(r => r.status === 'linked').length;
  const todayIndexed = todayRuns.filter(r => r.status === 'indexed').length;

  const totalPosts = registry?.length || 0;
  const passingPosts = registry?.filter(r => (r.score_global ?? 0) >= 90).length || 0;
  const premiumPosts = registry?.filter(r => (r.score_global ?? 0) >= 94).length || 0;
  const flagshipPosts = registry?.filter(r => (r.score_global ?? 0) >= 97).length || 0;
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

  // Narrative
  const narrative = useMemo(() => {
    const total = todayFixed + todayImproved + todayLinked + todayIndexed;
    const parts: string[] = [];
    if (total === 0 && todayDetected === 0) {
      parts.push('Sistema operando con normalidad. Sin problemas nuevos hoy.');
    } else {
      if (total > 0) parts.push(`${total} mejoras ejecutadas hoy.`);
      if (todayFixed > 0) parts.push(`${todayFixed} correcciones técnicas.`);
      if (todayImproved > 0) parts.push(`${todayImproved} notas mejoradas.`);
      if (todayLinked > 0) parts.push(`${todayLinked} enlaces internos reforzados.`);
      if (todayIndexed > 0) parts.push(`${todayIndexed} URLs reindexadas.`);
      if (todayDetected > 0) parts.push(`${todayDetected} problemas detectados pendientes.`);
    }
    if (criticalIssues > 0) parts.push(`⚠️ ${criticalIssues} críticos requieren atención.`);
    return parts.join(' ');
  }, [todayFixed, todayImproved, todayLinked, todayIndexed, todayDetected, criticalIssues]);

  // Actions
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
      toast.success(`Sincronizado: ${data.synced} posts nuevos`);
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

  const triggerBulkImageRefresh = async () => {
    setRefreshingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-image-refresh', { body: { mode: 'oldest', limit: 8 } });
      if (error) throw error;
      toast.success(`Imágenes regeneradas: ${data?.generated || 0}`);
      qc.invalidateQueries({ queryKey: ['cc-posts'] });
    } catch (err: any) { toast.error(err.message); }
    finally { setRefreshingImages(false); }
  };

  const triggerMegaIndex = async () => {
    setIndexing(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-auto-indexer', { body: {} });
      if (error) throw error;
      toast.success(`Indexación: ${data?.stats?.urlsIndexed || 0} URLs enviadas`);
    } catch (err: any) { toast.error(err.message); }
    finally { setIndexing(false); }
  };

  // Realtime
  useEffect(() => {
    const ch = supabase.channel('cc-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'obsessive_editor_runs' }, () => {
        qc.invalidateQueries({ queryKey: ['cc-editor-runs'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono">Autónomo 24/7</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Blog Engine
          </h1>
          <p className="text-sm text-muted-foreground">Registry · Quality Gates · Clusters · CRO · Editor autónomo</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={syncRegistry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync
          </Button>
          <Button variant="outline" size="sm" onClick={runAudit}>
            <Search className="w-3.5 h-3.5 mr-1.5" /> Auditar
          </Button>
          <Button variant="outline" size="sm" onClick={triggerBulkImageRefresh} disabled={refreshingImages}>
            {refreshingImages ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
            Imágenes
          </Button>
          <Button variant="outline" size="sm" onClick={triggerMegaIndex} disabled={indexing}>
            {indexing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1.5" />}
            Indexar
          </Button>
          <Button size="sm" onClick={triggerCycle} disabled={running}>
            {running ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
            Ejecutar ciclo
          </Button>
        </div>
      </div>

      {/* Narrative */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Publicadas', value: posts?.length || 0, icon: FileText },
          { label: 'Score ø', value: `${avgScore}`, icon: BarChart3, sub: <Progress value={avgScore} className="mt-1.5 h-1" /> },
          { label: 'Aprobadas', value: passingPosts, icon: CheckCircle },
          { label: 'Issues', value: issues?.length || 0, icon: AlertTriangle },
          { label: 'Clusters', value: clusters.size, icon: Network },
          { label: 'CTAs', value: activeCTAs, icon: Megaphone },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <s.icon className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            {'sub' in s && s.sub}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 bg-accent/50 p-1">
          <TabsTrigger value="resumen" className="text-xs"><Activity className="w-3.5 h-3.5 mr-1" /> Resumen</TabsTrigger>
          <TabsTrigger value="actividad" className="text-xs"><Sparkles className="w-3.5 h-3.5 mr-1" /> Actividad</TabsTrigger>
          <TabsTrigger value="vigilancia" className="text-xs"><Eye className="w-3.5 h-3.5 mr-1" /> Vigilancia</TabsTrigger>
          <TabsTrigger value="contenido" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1" /> Contenido</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs"><Globe className="w-3.5 h-3.5 mr-1" /> SEO</TabsTrigger>
          <TabsTrigger value="clusters" className="text-xs"><Network className="w-3.5 h-3.5 mr-1" /> Clusters</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs"><Target className="w-3.5 h-3.5 mr-1" /> CRO</TabsTrigger>
          <TabsTrigger value="historial" className="text-xs"><Clock className="w-3.5 h-3.5 mr-1" /> Historial</TabsTrigger>
          <TabsTrigger value="linkedin" className="text-xs"><Linkedin className="w-3.5 h-3.5 mr-1" /> LinkedIn</TabsTrigger>
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="resumen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Salud del blog por dimensión</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Coherencia', key: 'score_coherence', w: 20 },
                  { label: 'Promesas', key: 'score_promises', w: 20 },
                  { label: 'Técnico', key: 'score_technical', w: 15 },
                  { label: 'SEO', key: 'score_seo', w: 15 },
                  { label: 'Interlinking', key: 'score_interlinking', w: 10 },
                  { label: 'UX', key: 'score_ux', w: 10 },
                  { label: 'Conversión', key: 'score_conversion', w: 10 },
                ].map(dim => {
                  const vals = (registry || []).map(r => Number((r as any)[dim.key]) || 0);
                  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                  return (
                    <div key={dim.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{dim.label} <span className="text-muted-foreground/50">({dim.w}%)</span></span>
                        <span className="font-bold text-foreground">{avg}</span>
                      </div>
                      <Progress value={avg} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Estado de subsistemas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Pipeline automático', ok: true, detail: running ? 'Ejecutando...' : 'Activo' },
                  { label: 'Auditor técnico', ok: (issues?.length || 0) === 0, detail: `${issues?.length || 0} issues abiertos` },
                  { label: 'Quality Gates', ok: passingPosts === totalPosts, detail: `${passingPosts}/${totalPosts} aprobadas` },
                  { label: 'Clusters', ok: clusters.size > 0, detail: `${clusters.size} clusters · ${edges?.length || 0} conexiones` },
                  { label: 'Experimentos A/B', ok: true, detail: `${runningExperiments} activos` },
                  { label: 'CTAs', ok: activeCTAs > 0, detail: `${activeCTAs} bloques activos` },
                  { label: 'Indexación', ok: true, detail: 'IndexNow integrado' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      {s.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="text-sm text-foreground">{s.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.detail}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ACTIVIDAD */}
        <TabsContent value="actividad">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Trabajo del sistema hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {todayRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">Sin actividad hoy. El próximo ciclo se ejecutará automáticamente.</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {todayRuns.map(run => (
                      <div key={run.id} className="rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={run.status} />
                          <span className="text-sm font-medium text-foreground flex-1">{translateAction(run.action_type)}</span>
                          <Badge className={priorityMeta[run.priority]?.color || 'bg-muted'}>
                            {priorityMeta[run.priority]?.label || run.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(run.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {run.target_slug && <p className="text-xs text-muted-foreground mt-1 pl-6">📄 {run.target_slug}</p>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIGILANCIA */}
        <TabsContent value="vigilancia">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Issues abiertos ({issues?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {(issues || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">✅ Sin issues. Todo bajo control.</p>
                  ) : (
                    <div className="space-y-2">
                      {(issues || []).map(issue => (
                        <div key={issue.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={issue.severity === 'critical' ? 'bg-destructive/15 text-destructive' : issue.severity === 'high' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}>
                              {issue.severity === 'critical' ? 'Crítico' : issue.severity === 'high' ? 'Alto' : 'Medio'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{issue.issue_type.replace(/_/g, ' ')}</Badge>
                            {issue.auto_fixable && <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px]">Auto-fix</Badge>}
                          </div>
                          <p className="text-sm text-foreground">{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4" /> Cola de tareas ({tasks?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {(tasks || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Cola vacía. Se crean automáticamente al auditar.</p>
                  ) : (
                    <div className="space-y-2">
                      {(tasks || []).map(task => (
                        <div key={task.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={priorityMeta[task.queue]?.color || 'bg-muted'}>{task.queue}</Badge>
                            <Badge variant="outline" className="text-[10px]">{task.task_type.replace(/_/g, ' ')}</Badge>
                          </div>
                          <p className="text-sm text-foreground">{task.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONTENIDO */}
        <TabsContent value="contenido">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Registry — Todas las notas con quality scores</CardTitle>
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
                          <div className="truncate font-medium text-sm text-foreground">{entry.url?.replace('https://blog.vistaceo.com/', '').replace(/\/$/, '')}</div>
                          <div className="text-[10px] text-muted-foreground">{entry.category}</div>
                        </TableCell>
                        <TableCell className="text-center">{scoreBadge(Number(entry.score_global))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_coherence))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_promises))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_technical))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_seo))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_ux))}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{Math.round(Number(entry.score_conversion))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Estado SEO técnico</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'URLs publicadas', value: posts?.length || 0 },
                    { label: 'En registro', value: registry?.length || 0 },
                    { label: 'SEO ≥ 80', value: (registry || []).filter(r => Number(r.score_seo) >= 80).length },
                    { label: 'Huérfanas', value: (registry || []).filter(r => !r.internal_links_in || (Array.isArray(r.internal_links_in) && (r.internal_links_in as any[]).length < 1)).length },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg border border-border p-3 text-center">
                      <div className="text-xl font-bold text-foreground">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Dominio', 'blog.vistaceo.com'],
                    ['Sitemap', 'Activo'],
                    ['Robots.txt', 'Correcto'],
                    ['IndexNow', 'Integrado'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 text-[10px]">{v}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Notas con SEO débil (&lt;80)</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {(registry || []).filter(r => Number(r.score_seo) < 80).slice(0, 15).map(r => (
                      <div key={r.id} className="rounded-lg border border-border p-2.5 flex items-center justify-between">
                        <div className="min-w-0 flex-1 mr-3">
                          <span className="text-sm text-foreground truncate block">{r.url?.replace('https://blog.vistaceo.com/', '').replace(/\/$/, '')}</span>
                          <span className="text-[10px] text-muted-foreground">KW: {r.primary_keyword || '—'}</span>
                        </div>
                        {scoreBadge(Number(r.score_seo))}
                      </div>
                    ))}
                    {(registry || []).filter(r => Number(r.score_seo) < 80).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-12">✅ Todas con SEO ≥ 80</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLUSTERS */}
        <TabsContent value="clusters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Clusters temáticos</CardTitle>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={buildGraph}>
                      <Network className="w-3 h-3 mr-1" /> Reconstruir
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('blog-os-engine', { body: { action: 'detect_cannibalization' } });
                        if (error) throw error;
                        toast.success(`${data.total} solapamientos detectados`);
                      } catch (err: any) { toast.error(err.message); }
                    }}>
                      <AlertTriangle className="w-3 h-3 mr-1" /> Canibalización
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-1.5">
                    {[...clusters.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center rounded-lg border border-border p-2.5">
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <Badge variant="outline">{count} notas</Badge>
                      </div>
                    ))}
                    {clusters.size === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sin clusters. Ejecutá el grafo.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Conexiones del grafo</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5 mb-4">
                  {Object.entries(edgesByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{type.replace(/_/g, ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Origen</TableHead>
                        <TableHead className="text-xs">Destino</TableHead>
                        <TableHead className="text-xs">Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(edges || []).slice(0, 30).map((edge: any) => (
                        <TableRow key={edge.id}>
                          <TableCell className="text-[11px] truncate max-w-[130px]">{(edge.source as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}</TableCell>
                          <TableCell className="text-[11px] truncate max-w-[130px]">{(edge.target as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px]">{edge.edge_type}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CRO */}
        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="w-4 h-4" /> CTAs activos</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {(ctaBlocks || []).map(block => (
                      <div key={block.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{block.name}</span>
                          <Badge className={block.is_active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}>
                            {block.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>{block.block_type}</span>
                          <span>Usos: {block.usage_count}</span>
                          <span>Conv: {Number(block.conversion_rate || 0).toFixed(1)}%</span>
                          <span>{block.conversion_stage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Experimentos A/B</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 text-xs mb-3">
                  <span className="text-blue-600 dark:text-blue-400">⚡ {runningExperiments} activos</span>
                  <span className="text-emerald-600 dark:text-emerald-400">✓ {experiments?.filter(e => e.status === 'completed').length || 0} completados</span>
                  <span className="text-destructive">↩ {experiments?.filter(e => e.status === 'rolled_back').length || 0} rollbacks</span>
                </div>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {(experiments || []).slice(0, 20).map(exp => (
                      <div key={exp.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{exp.experiment_type}</Badge>
                          <Badge className={
                            exp.status === 'running' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                            : exp.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-destructive/15 text-destructive'
                          }>
                            {exp.status === 'running' ? 'Activo' : exp.status === 'completed' ? 'Completado' : 'Rollback'}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground truncate">{exp.hypothesis}</p>
                        {exp.guardrail_reason && <p className="text-[10px] text-destructive mt-1">{exp.guardrail_reason}</p>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HISTORIAL */}
        <TabsContent value="historial">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Historial completo de acciones</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Estado</TableHead>
                      <TableHead className="text-xs">Prioridad</TableHead>
                      <TableHead className="text-xs">Acción</TableHead>
                      <TableHead className="text-xs">Nota</TableHead>
                      <TableHead className="text-xs">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(runs || []).slice(0, 100).map(run => (
                      <TableRow key={run.id}>
                        <TableCell><StatusIcon status={run.status} /></TableCell>
                        <TableCell><Badge className={priorityMeta[run.priority]?.color || 'bg-muted'}>{priorityMeta[run.priority]?.label || run.priority}</Badge></TableCell>
                        <TableCell className="text-sm text-foreground">{translateAction(run.action_type)}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground truncate max-w-[150px]">{run.target_slug || '—'}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono">
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

        {/* LINKEDIN */}
        <TabsContent value="linkedin">
          <LinkedInCopyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
