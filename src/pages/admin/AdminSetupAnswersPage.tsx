import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Search, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import {
  QUESTION_LABELS, labelForField, labelForQuestion, labelForAnswer,
  labelForValue, formatDateEs,
} from '@/lib/setupAnswerLabels';

type Row = {
  id: string;
  business_id: string;
  business_name: string;
  category: string | null;
  country: string | null;
  setup_completed: boolean;
  owner_email: string | null;
  owner_name: string | null;
  current_step: string | null;
  precision_score: number | null;
  completed_at: string | null;
  updated_at: string;
  created_at: string;
  setup_data: Record<string, any>;
};

function titleCase(key: string) {
  return key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isQuestionId(k: string) {
  return /^EASY_\d+_/i.test(k) || /^PIVOT_/i.test(k) || !!QUESTION_LABELS[k];
}

function RenderAnswerValue({ questionId, value }: { questionId?: string; value: any }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground italic">— sin respuesta —</span>;
  }
  if (typeof value === 'boolean') return <span>{value ? 'Sí' : 'No'}</span>;
  if (typeof value === 'string' || typeof value === 'number') {
    const str = String(value);
    const labeled = questionId ? labelForAnswer(questionId, str) : null;
    if (labeled) {
      return (
        <span>
          <span className="font-medium text-foreground">{labeled}</span>
          <span className="ml-2 text-[11px] text-muted-foreground font-mono">({str})</span>
        </span>
      );
    }
    const generic = labelForValue(questionId || '', str);
    return <span className="whitespace-pre-wrap break-words">{generic || str}</span>;
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== 'object')) {
      const labeled = value.map((v) => (questionId ? labelForAnswer(questionId, v) : null) || String(v));
      return <span>{labeled.join(', ')}</span>;
    }
    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="border-l-2 border-border pl-3">
            <RenderAnswerValue questionId={questionId} value={v} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="space-y-1.5">
        {Object.entries(value).map(([k, v]) => {
          const isQ = isQuestionId(k);
          const label = isQ ? labelForQuestion(k) || titleCase(k) : labelForField(k);
          return (
            <div key={k} className="grid grid-cols-[220px_1fr] gap-3 text-sm">
              <div className="text-muted-foreground">
                <div className="font-medium text-foreground/90">{label}</div>
                {isQ && <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{k}</div>}
              </div>
              <div><RenderAnswerValue questionId={isQ ? k : undefined} value={v} /></div>
            </div>
          );
        })}
      </div>
    );
  }
  return <span>{JSON.stringify(value)}</span>;
}

export default function AdminSetupAnswersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-setup-answers');
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as any)?.rows || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'completed' && !r.setup_completed) return false;
      if (filter === 'incomplete' && r.setup_completed) return false;
      if (!term) return true;
      return (
        (r.business_name || '').toLowerCase().includes(term) ||
        (r.owner_email || '').toLowerCase().includes(term) ||
        (r.owner_name || '').toLowerCase().includes(term) ||
        (r.category || '').toLowerCase().includes(term) ||
        (r.country || '').toLowerCase().includes(term) ||
        JSON.stringify(r.setup_data || {}).toLowerCase().includes(term)
      );
    });
  }, [rows, q, filter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Respuestas del setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pregunta por pregunta, lo que cada persona escribió en el onboarding.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por negocio, email, país, respuesta…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'incomplete'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'completed' ? 'Completos' : 'Incompletos'}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {loading ? 'Cargando…' : `${filtered.length} setups`}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const open = openId === r.id;
          const entries = Object.entries(r.setup_data || {});
          return (
            <Card key={r.id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{r.business_name}</span>
                      {r.setup_completed ? (
                        <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Completo</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />En curso</Badge>
                      )}
                      {r.category && <Badge variant="outline">{r.category}</Badge>}
                      {r.country && <Badge variant="outline">{r.country}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {r.owner_name ? `${r.owner_name} · ` : ''}{r.owner_email || 'sin email'}
                      {r.current_step ? ` · paso: ${r.current_step}` : ''}
                      {r.precision_score != null ? ` · precisión ${r.precision_score}%` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right hidden md:block">
                  <div>{new Date(r.updated_at).toLocaleString()}</div>
                  <div>{entries.length} respuestas</div>
                </div>
              </button>

              {open && (
                <div className="border-t bg-muted/20 p-4 md:p-6 space-y-3">
                  {entries.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">Sin datos guardados.</div>
                  )}
                  {entries.map(([k, v]) => {
                    const isQ = isQuestionId(k);
                    const label = isQ ? (labelForQuestion(k) || titleCase(k)) : labelForField(k);
                    return (
                      <div key={k} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 md:gap-4 py-2.5 border-b border-border/50 last:border-0">
                        <div className="text-sm">
                          <div className="font-semibold text-foreground">{label}</div>
                          <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{k}</div>
                        </div>
                        <div className="text-sm"><RenderAnswerValue questionId={isQ ? k : undefined} value={v} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
        {!loading && filtered.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">No hay setups que coincidan.</Card>
        )}
      </div>
    </div>
  );
}
