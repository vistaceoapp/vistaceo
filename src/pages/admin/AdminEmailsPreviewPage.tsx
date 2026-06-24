import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail, AlertCircle } from 'lucide-react';

type Tpl = {
  templateName: string;
  displayName: string;
  subject: string;
  html: string;
  status: 'ready' | 'preview_data_required' | 'render_failed';
  errorMessage?: string;
  to?: string | null;
  previewData?: Record<string, any>;
};

export default function AdminEmailsPreviewPage() {
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-preview-emails');
    if (error) {
      console.error(error);
      setTemplates([]);
    } else {
      const list = (data as any)?.templates || [];
      setTemplates(list);
      if (list.length && !active) setActive(list[0].templateName);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const current = templates.find((t) => t.templateName === active);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Plantillas de email</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los emails que envía VISTACEO, con su asunto y formato real.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <Card className="p-2 h-fit max-h-[80vh] overflow-auto">
          {loading && <div className="p-4 text-sm text-muted-foreground">Cargando…</div>}
          {templates.map((t) => (
            <button
              key={t.templateName}
              onClick={() => setActive(t.templateName)}
              className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition ${
                active === t.templateName ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
              }`}
            >
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{t.displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{t.templateName}</div>
                {t.status === 'ready' && (
                  <div className="text-[11px] text-muted-foreground truncate mt-1">{t.subject}</div>
                )}
                {t.status !== 'ready' && (
                  <Badge variant="destructive" className="mt-1 text-[10px]">
                    {t.status === 'preview_data_required' ? 'Sin preview' : 'Error'}
                  </Badge>
                )}
              </div>
            </button>
          ))}
          {!loading && templates.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Sin plantillas.</div>
          )}
        </Card>

        <div className="space-y-3">
          {current && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Asunto</div>
                  <div className="text-lg font-semibold">{current.subject || '—'}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div><span className="font-mono">{current.templateName}</span></div>
                  {current.to && <div>Para: {current.to}</div>}
                </div>
              </div>
              {current.previewData && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Ver datos de ejemplo usados en este preview
                  </summary>
                  <pre className="mt-2 bg-muted p-3 rounded overflow-auto text-[11px]">
                    {JSON.stringify(current.previewData, null, 2)}
                  </pre>
                </details>
              )}
            </Card>
          )}

          {current?.status === 'ready' && (
            <Card className="overflow-hidden">
              <iframe
                title={current.templateName}
                srcDoc={current.html}
                className="w-full bg-white"
                style={{ height: '80vh', border: 0 }}
              />
            </Card>
          )}

          {current && current.status !== 'ready' && (
            <Card className="p-6 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">No se pudo renderizar</div>
                <div className="text-muted-foreground mt-1">
                  {current.errorMessage || 'Esta plantilla no tiene datos de preview definidos.'}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
