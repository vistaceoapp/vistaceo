import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Loader2, Linkedin, Copy, CheckCircle, RefreshCw,
  Sparkles, ExternalLink, Clock, AlertTriangle
} from 'lucide-react';

interface SocialPublication {
  id: string;
  channel: string;
  blog_post_id: string;
  status: string;
  generated_text: string | null;
  canonical_url: string | null;
  error_message: string | null;
  attempts: number;
  linkedin_post_urn: string | null;
  created_at: string;
  updated_at: string;
}

interface PostMin {
  id: string;
  title: string;
  slug: string;
  status: string;
  publish_at: string | null;
}

export default function LinkedInCopyTab() {
  const qc = useQueryClient();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['li-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, publish_at')
        .eq('status', 'published')
        .order('publish_at', { ascending: false });
      return (data || []) as PostMin[];
    },
  });

  const { data: publications, isLoading: loadingPubs } = useQuery({
    queryKey: ['li-publications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('social_publications')
        .select('*')
        .eq('channel', 'linkedin');
      return (data || []) as SocialPublication[];
    },
  });

  const pubMap = new Map<string, SocialPublication>();
  publications?.forEach(p => pubMap.set(p.blog_post_id, p));

  const generateCopy = async (postId: string) => {
    setGeneratingId(postId);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-generate-copy', {
        body: { post_id: postId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Error desconocido');
      toast.success(data.already_generated ? 'Copy existente cargado' : 'Copy generado exitosamente');
      qc.invalidateQueries({ queryKey: ['li-publications'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const regenerateCopy = async (postId: string) => {
    setGeneratingId(postId);
    try {
      // Delete existing then regenerate
      await supabase
        .from('social_publications')
        .delete()
        .eq('channel', 'linkedin')
        .eq('blog_post_id', postId);

      const { data, error } = await supabase.functions.invoke('linkedin-generate-copy', {
        body: { post_id: postId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Error desconocido');
      toast.success('Copy regenerado exitosamente');
      qc.invalidateQueries({ queryKey: ['li-publications'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const copyToClipboard = async (text: string, postId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(postId);
      toast.success('Copy copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const generateAll = async () => {
    const pending = (posts || []).filter(p => !pubMap.has(p.id));
    if (pending.length === 0) {
      toast.info('Todas las notas ya tienen copy generado');
      return;
    }
    toast.info(`Generando copy para ${pending.length} notas...`);
    let ok = 0;
    let fail = 0;
    for (const p of pending.slice(0, 10)) {
      try {
        setGeneratingId(p.id);
        const { data, error } = await supabase.functions.invoke('linkedin-generate-copy', {
          body: { post_id: p.id },
        });
        if (error || !data?.success) { fail++; continue; }
        ok++;
      } catch { fail++; }
    }
    setGeneratingId(null);
    qc.invalidateQueries({ queryKey: ['li-publications'] });
    toast.success(`Completado: ${ok} generados, ${fail} errores`);
  };

  const withCopy = (posts || []).filter(p => pubMap.has(p.id) && pubMap.get(p.id)!.generated_text);
  const withoutCopy = (posts || []).filter(p => !pubMap.has(p.id) || !pubMap.get(p.id)!.generated_text);

  const isLoading = loadingPosts || loadingPubs;

  const statusBadge = (pub: SocialPublication | undefined) => {
    if (!pub) return <Badge variant="outline" className="text-[10px]">Sin generar</Badge>;
    switch (pub.status) {
      case 'published': return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">Publicado</Badge>;
      case 'queued': return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20 text-[10px]">Listo</Badge>;
      case 'error': return <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[10px]">Error</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{pub.status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">LinkedIn Copy Generator</h3>
            <p className="text-[11px] text-muted-foreground">
              {withCopy.length} de {(posts || []).length} notas con copy · {withoutCopy.length} pendientes
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={generateAll}
          disabled={!!generatingId || withoutCopy.length === 0}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Generar todos ({Math.min(withoutCopy.length, 10)})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="h-[650px]">
          <div className="space-y-3">
            {(posts || []).map(post => {
              const pub = pubMap.get(post.id);
              const hasCopy = !!pub?.generated_text;
              const isGenerating = generatingId === post.id;
              const isCopied = copiedId === post.id;

              return (
                <Card key={post.id} className={`border transition-colors ${hasCopy ? 'border-border' : 'border-dashed border-muted-foreground/30'}`}>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-foreground truncate">{post.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {statusBadge(pub)}
                          {post.publish_at && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(post.publish_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          )}
                          {pub?.canonical_url && (
                            <a
                              href={pub.canonical_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Blog
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {hasCopy && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] px-2"
                              onClick={() => copyToClipboard(pub!.generated_text!, post.id)}
                            >
                              {isCopied ? <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                              {isCopied ? 'Copiado' : 'Copiar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] px-2"
                              onClick={() => regenerateCopy(post.id)}
                              disabled={isGenerating}
                            >
                              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </Button>
                          </>
                        )}
                        {!hasCopy && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-3"
                            onClick={() => generateCopy(post.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Generar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {hasCopy && (
                    <CardContent className="px-4 pb-3 pt-0">
                      <div className="bg-muted/50 rounded-lg p-3 text-[12px] leading-relaxed whitespace-pre-wrap text-foreground/90 max-h-[200px] overflow-auto font-sans">
                        {pub!.generated_text}
                      </div>
                      {pub?.error_message && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          {pub.error_message}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
