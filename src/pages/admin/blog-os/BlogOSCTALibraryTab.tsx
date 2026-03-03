import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Megaphone } from 'lucide-react';

export default function BlogOSCTALibraryTab() {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ['blog-os-cta-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_cta_blocks')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const typeLabels: Record<string, string> = {
    cta_short: 'CTA Corto',
    cta_medium: 'CTA Medio',
    cta_long: 'CTA Largo',
    missions_example: 'Misiones Ejemplo',
    insight_example: 'Insight Ejemplo',
    growth_by_country: 'Crecimiento por País',
    for_services: 'Para Servicios',
    for_commerce: 'Para Comercios',
    for_ecommerce: 'Para E-commerce',
  };

  const stageColors: Record<string, string> = {
    discovery: 'bg-blue-500/20 text-blue-400',
    consideration: 'bg-yellow-500/20 text-yellow-400',
    decision: 'bg-green-500/20 text-green-400',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Biblioteca de Bloques CTA
        </CardTitle>
        <CardDescription>
          Bloques VISTACEO administrables para inserción contextual en notas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blocks?.map(block => (
                <Card key={block.id} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{block.name}</CardTitle>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[block.block_type] || block.block_type}
                        </Badge>
                        {block.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">Activo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-muted/50 rounded p-2 text-xs font-mono max-h-[120px] overflow-auto whitespace-pre-wrap">
                      {block.content_md}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={stageColors[block.conversion_stage || 'discovery'] || ''} >
                        {block.conversion_stage}
                      </Badge>
                      {(block.intent_match || []).map((intent: string) => (
                        <Badge key={intent} variant="outline" className="text-xs">{intent}</Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Usos: {block.usage_count}</span>
                      <span>Conv: {Number(block.conversion_rate || 0).toFixed(1)}%</span>
                      <span>Prior: {block.priority}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!blocks || blocks.length === 0) && (
                <div className="col-span-2 text-center text-muted-foreground py-8">
                  Sin bloques CTA. Se están cargando...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
