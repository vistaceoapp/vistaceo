import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Network, AlertTriangle, RefreshCw } from 'lucide-react';

export default function BlogOSClustersTab() {
  const queryClient = useQueryClient();
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const { data: edges, isLoading } = useQuery({
    queryKey: ['blog-os-cluster-edges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_cluster_edges')
        .select('*, source:source_registry_id(url, primary_keyword), target:target_registry_id(url, primary_keyword)')
        .order('weight', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: cannibalization } = useQuery({
    queryKey: ['blog-os-cannibalization'],
    queryFn: async () => {
      // Get from task queue
      const { data, error } = await supabase
        .from('blog_task_queue')
        .select('*')
        .eq('task_type', 'cannibalization_fix')
        .eq('status', 'pending')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const buildGraph = async () => {
    setIsBuilding(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-engine', {
        body: { action: 'build_cluster_graph' },
      });
      if (error) throw error;
      toast.success(`Grafo: ${data.edges_created} aristas, ${data.orphan_pages?.length || 0} huérfanas`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-cluster-edges'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsBuilding(false);
    }
  };

  const detectCannibalization = async () => {
    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-engine', {
        body: { action: 'detect_cannibalization' },
      });
      if (error) throw error;
      toast.success(`Detectadas ${data.total} parejas con solapamiento`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-cannibalization'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDetecting(false);
    }
  };

  // Group edges by type
  const edgesByType = (edges || []).reduce((acc: Record<string, number>, e: any) => {
    acc[e.edge_type] = (acc[e.edge_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={buildGraph} disabled={isBuilding}>
          {isBuilding ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Network className="w-4 h-4 mr-1" />}
          Construir Grafo
        </Button>
        <Button size="sm" variant="outline" onClick={detectCannibalization} disabled={isDetecting}>
          {isDetecting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
          Detectar Canibalización
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cluster Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grafo de Contenidos</CardTitle>
            <CardDescription>Aristas por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {Object.entries(edgesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{type.replace('_', ' ')}</span>
                    <Badge variant="outline">{String(count)}</Badge>
                  </div>
                ))}
                {Object.keys(edgesByType).length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin aristas. Construí el grafo primero.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cannibalization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Canibalización
            </CardTitle>
            <CardDescription>Pares con solapamiento detectado</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {cannibalization && cannibalization.length > 0 ? (
                <div className="space-y-3">
                  {cannibalization.map((task: any) => {
                    const payload = task.payload || {};
                    return (
                      <div key={task.id} className="border rounded-md p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            payload.risk === 'critical' ? 'bg-destructive/20 text-destructive' :
                            payload.risk === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }>
                            {payload.risk || 'medium'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Score: {payload.overlap_score}</span>
                        </div>
                        <p className="text-sm">{task.description}</p>
                        {payload.suggested_action && (
                          <p className="text-xs text-muted-foreground">→ {payload.suggested_action}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin canibalización detectada.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Edges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aristas del Grafo</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Peso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {edges?.slice(0, 50).map((edge: any) => (
                  <TableRow key={edge.id}>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {(edge.source as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {(edge.target as any)?.url?.replace('https://blog.vistaceo.com/', '') || '—'}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{edge.edge_type}</Badge></TableCell>
                    <TableCell className="text-center text-sm">{Number(edge.weight).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {(!edges || edges.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Sin aristas. Construí el grafo primero.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
