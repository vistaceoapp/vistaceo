import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, FlaskConical, ShieldCheck } from 'lucide-react';

export default function BlogOSExperimentsTab() {
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const { data: experiments, isLoading } = useQuery({
    queryKey: ['blog-os-experiments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_experiments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const checkGuardrails = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-os-engine', {
        body: { action: 'check_experiments' },
      });
      if (error) throw error;
      toast.success(`Revisados: ${data.checked}, Rollbacks: ${data.rolled_back}`);
      queryClient.invalidateQueries({ queryKey: ['blog-os-experiments'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const running = experiments?.filter(e => e.status === 'running').length || 0;
  const completed = experiments?.filter(e => e.status === 'completed').length || 0;
  const rolledBack = experiments?.filter(e => e.status === 'rolled_back').length || 0;

  const getStatusBadge = (status: string, guardrail: boolean) => {
    if (guardrail) return <Badge className="bg-destructive/20 text-destructive">Rollback</Badge>;
    switch (status) {
      case 'running': return <Badge className="bg-blue-500/20 text-blue-400">Running</Badge>;
      case 'completed': return <Badge className="bg-green-500/20 text-green-400">Completado</Badge>;
      case 'rolled_back': return <Badge className="bg-destructive/20 text-destructive">Rolled Back</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-blue-400">⚡ {running} activos</span>
          <span className="text-green-400">✓ {completed} completados</span>
          <span className="text-destructive">↩ {rolledBack} rollbacks</span>
        </div>
        <Button size="sm" variant="outline" onClick={checkGuardrails} disabled={isChecking}>
          {isChecking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
          Check Guardrails
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Experimentos A/B
          </CardTitle>
          <CardDescription>Tests controlados de titles, metas, intros, CTAs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Hipótesis</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Ventana</TableHead>
                    <TableHead>Decisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiments?.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell><Badge variant="outline" className="text-xs">{exp.experiment_type}</Badge></TableCell>
                      <TableCell className="max-w-[250px] text-sm truncate">{exp.hypothesis}</TableCell>
                      <TableCell>{getStatusBadge(exp.status || 'running', exp.guardrail_triggered || false)}</TableCell>
                      <TableCell className="text-center font-mono">{exp.active_variant}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{exp.measurement_window_hours}h</TableCell>
                      <TableCell>
                        {exp.guardrail_reason ? (
                          <span className="text-xs text-destructive">{exp.guardrail_reason}</span>
                        ) : exp.decision ? (
                          <span className="text-xs">{exp.decision}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!experiments || experiments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Sin experimentos. Creá uno desde el engine.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
