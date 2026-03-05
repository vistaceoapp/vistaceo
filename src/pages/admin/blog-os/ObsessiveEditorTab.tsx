import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  RefreshCw, Zap, Shield, Eye, Link2, RotateCcw,
  Search, Loader2, CheckCircle, XCircle, AlertTriangle,
  Activity, Clock, TrendingUp
} from 'lucide-react';

export default function ObsessiveEditorTab() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  // Fetch recent runs
  const { data: runs, isLoading } = useQuery({
    queryKey: ['obsessive-editor-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obsessive_editor_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000, // Auto-refresh every 15s
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('obsessive-editor-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'obsessive_editor_runs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['obsessive-editor-runs'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const triggerCycle = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('obsessive-editor', { body: {} });
      if (error) throw error;
      toast.success(`Ciclo completado: ${data.cycle_id}`);
      queryClient.invalidateQueries({ queryKey: ['obsessive-editor-runs'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const triggerReindexBoost = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reindex-booster', { body: {} });
      if (error) throw error;
      toast.success(`Reindex Boost: ${data.results?.slugs_to_reindex?.length || 0} URLs actualizadas`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Stats
  const cycles = [...new Set((runs || []).map(r => r.cycle_id))];
  const lastCycleId = cycles[0];
  const lastCycleRuns = (runs || []).filter(r => r.cycle_id === lastCycleId);
  const totalFixed = (runs || []).filter(r => r.status === 'fixed').length;
  const totalDetected = (runs || []).filter(r => r.status === 'detected').length;
  const totalImproved = (runs || []).filter(r => r.status === 'improved' || r.status === 'refreshed').length;
  const totalLinked = (runs || []).filter(r => r.status === 'linked').length;

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      P0: 'bg-red-500/20 text-red-400 border-red-500/30',
      P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      P2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      P3: 'bg-green-500/20 text-green-400 border-green-500/30',
      P4: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return <Badge className={colors[priority] || 'bg-muted'}>{priority}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'detected': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'improved': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'refreshed': return <RefreshCw className="h-4 w-4 text-cyan-400" />;
      case 'linked': return <Link2 className="h-4 w-4 text-emerald-400" />;
      case 'indexed': return <Search className="h-4 w-4 text-purple-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={triggerCycle} disabled={isRunning}>
          {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          Ejecutar Ciclo Obsesivo
        </Button>
        <Button variant="outline" onClick={triggerReindexBoost}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Reindex Booster
        </Button>
        <Button variant="ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ['obsessive-editor-runs'] })}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refrescar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{cycles.length}</div>
            <div className="text-xs text-muted-foreground">Ciclos totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-yellow-400">{totalDetected}</div>
            <div className="text-xs text-muted-foreground">Issues detectados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-green-400">{totalFixed}</div>
            <div className="text-xs text-muted-foreground">Fixes auto</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-blue-400">{totalImproved}</div>
            <div className="text-xs text-muted-foreground">Mejoras</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-emerald-400">{totalLinked}</div>
            <div className="text-xs text-muted-foreground">Links creados</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Cycle Summary */}
      {lastCycleId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Último ciclo: {lastCycleId}
              <Badge variant="outline" className="ml-auto">
                {lastCycleRuns.length} acciones
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {['scan', 'fix', 'improve', 'link', 'refresh', 'reindex'].map(phase => {
                const count = lastCycleRuns.filter(r => r.phase === phase).length;
                return count > 0 ? (
                  <Badge key={phase} variant="secondary">{phase}: {count}</Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Run History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Historial de acciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(runs || []).slice(0, 50).map(run => (
                    <TableRow key={run.id}>
                      <TableCell>{getStatusIcon(run.status)}</TableCell>
                      <TableCell>{getPriorityBadge(run.priority)}</TableCell>
                      <TableCell className="font-mono text-xs">{run.action_type}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{run.target_slug || '—'}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {run.action_details ? JSON.stringify(run.action_details).slice(0, 80) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(run.created_at).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
