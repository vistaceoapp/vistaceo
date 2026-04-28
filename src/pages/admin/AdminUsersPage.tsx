import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, ChevronRight, Crown, Building2, 
  Activity, MessageSquare, Target,
  ArrowLeft, Brain, Zap, Mail, Trash2, Shield, Edit, UserX
} from 'lucide-react';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  last_login_at: string;
  last_active_at: string;
  login_count: number;
  businesses: Array<{ id: string; name: string; category: string; country: string; setup_completed: boolean; created_at: string; }>;
  subscriptions: Array<{ id: string; plan_id: string; status: string; expires_at: string; payment_provider: string; payment_amount: number; }>;
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
  const [planTarget, setPlanTarget] = useState<{ id: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('pro_yearly');
  const [planDays, setPlanDays] = useState('365');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-users', {
        body: { search, page: 1, limit: 100 },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const { data: userDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-user-detail', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const { data, error } = await supabase.functions.invoke('admin-get-users', {
        body: { userId: selectedUserId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUserId,
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'delete_user', userId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      setSelectedUserId(null);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const planMutation = useMutation({
    mutationFn: async ({ userId, planId, durationDays }: { userId: string; planId: string; durationDays: number }) => {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'update_subscription', userId, planId, durationDays },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Suscripción actualizada');
      setShowPlanDialog(false);
      setPlanTarget(null);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isPro = (user: UserData) => user.subscriptions?.some(s => s.status === 'active');

  // Helpers
  const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n || 0)));
  const safe = (v: any, fallback = '—') => (v === null || v === undefined || v === '' ? fallback : v);

  // ── Detail View ──
  if (selectedUserId) {
    if (loadingDetail || !userDetail) {
      return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] space-y-5">
          <button onClick={() => setSelectedUserId(null)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-[13px]">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted/40 rounded-xl" />
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-muted/30 rounded-xl" />)}
            </div>
            <div className="h-48 bg-muted/30 rounded-xl" />
          </div>
        </div>
      );
    }
    const profile = userDetail.profile;
    const biz = userDetail.businesses?.[0];
    const brain = userDetail.businessBrain;
    const hasPro = userDetail.subscriptions?.some((s: any) => s.status === 'active');

    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-[1200px]">
        <button onClick={() => setSelectedUserId(null)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-[13px]">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{profile?.full_name || 'Sin nombre'}</h1>
                {hasPro && <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Crown className="w-3 h-3 mr-1" /> PRO</Badge>}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3 h-3" /> {profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setPlanTarget({ id: selectedUserId, email: profile?.email }); setShowPlanDialog(true); }}>
              <Crown className="w-3 h-3 mr-1" /> Cambiar plan
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { setDeleteTarget({ id: selectedUserId, email: profile?.email }); setShowDeleteDialog(true); }}>
              <Trash2 className="w-3 h-3 mr-1" /> Eliminar
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Logins totales', value: profile?.login_count || 0, color: '#2692DC' },
            { label: 'Último login', value: profile?.last_login_at ? formatDistanceToNow(new Date(profile.last_login_at), { locale: es, addSuffix: true }) : 'Nunca', color: '#06b6d4' },
            { label: 'Misiones', value: userDetail.missions?.length || 0, color: '#746CE6' },
            { label: 'Mensajes chat', value: userDetail.chatMessages?.length || 0, color: '#f59e0b' },
            { label: 'Oportunidades', value: userDetail.opportunities?.length || 0, color: '#22c55e' },
            { label: 'Salud negocio', value: userDetail.businessSnapshots?.[0]?.total_score != null ? `${clampPct(userDetail.businessSnapshots[0].total_score)}/100` : '—', color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-3 text-center">
              <p className="text-base font-bold text-foreground leading-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profile meta */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Cuenta</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ['Registrado', profile?.created_at ? format(new Date(profile.created_at), "dd MMM yyyy", { locale: es }) : '—'],
              ['Última actividad', profile?.last_active_at ? formatDistanceToNow(new Date(profile.last_active_at), { locale: es, addSuffix: true }) : '—'],
              ['Onboarding', profile?.onboarding_completed ? '✓ Completado' : 'Pendiente'],
              ['Idioma', safe(profile?.preferred_language)],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</p>
                <p className="text-foreground font-medium mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business + Brain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {biz && (
            <div className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Negocio</h3>
                {biz.setup_completed && <Badge className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Setup ✓</Badge>}
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Nombre', biz.name],
                  ['Categoría', biz.category || '—'],
                  ['País', biz.country || '—'],
                  ['Creado', format(new Date(biz.created_at), 'dd MMM yyyy', { locale: es })],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{val}</span></div>
                ))}
              </div>
            </div>
          )}
          {brain && (
            <div className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Cerebro IA</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Tipo de negocio', safe(brain.primary_business_type)],
                  ['Foco actual', safe(brain.current_focus)],
                  ['Confianza IA', `${clampPct(brain.confidence_score)}%`],
                  ['MVC completado', `${clampPct(brain.mvc_completion_pct)}%`],
                  ['Señales recolectadas', brain.total_signals || 0],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{String(val)}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missions */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Misiones ({userDetail.missions?.length || 0})</h3>
          </div>
          <ScrollArea className="h-[250px]">
            {!userDetail.missions?.length && <p className="text-sm text-muted-foreground text-center py-8">Sin misiones</p>}
            <div className="space-y-1.5">
              {userDetail.missions?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{m.title}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(m.created_at), 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]", m.status === 'completed' ? "text-emerald-600" : m.status === 'in_progress' ? "text-primary" : "")}>
                    {m.status === 'completed' ? '✓ Completada' : m.status === 'in_progress' ? 'En progreso' : m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Chat IA ({userDetail.chatMessages?.length || 0} msgs)</h3>
          </div>
          <ScrollArea className="h-[300px]">
            {!userDetail.chatMessages?.length && <p className="text-sm text-muted-foreground text-center py-8">Sin conversaciones</p>}
            <div className="space-y-2">
              {userDetail.chatMessages?.map((msg: any) => (
                <div key={msg.id} className={cn(
                  "p-3 rounded-lg text-sm",
                  msg.role === 'user' ? "bg-primary/5 ml-8" : "bg-accent/50 mr-8 border border-border"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-medium">{msg.role === 'user' ? 'Usuario' : 'VISTACEO'}</span>
                    <span className="text-[10px] text-muted-foreground/60">{format(new Date(msg.created_at), 'dd MMM HH:mm', { locale: es })}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">{msg.content?.slice(0, 500)}{msg.content?.length > 500 ? '...' : ''}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Subscriptions */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Suscripciones</h3>
          </div>
          {!userDetail.subscriptions?.length && <p className="text-sm text-muted-foreground text-center py-6">Sin suscripciones</p>}
          <div className="space-y-2">
            {userDetail.subscriptions?.map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
                <div>
                  <p className="text-sm text-foreground font-medium">{sub.plan_id}</p>
                  <p className="text-[11px] text-muted-foreground">via {sub.payment_provider} · ${sub.payment_amount}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={cn("text-[10px]", sub.status === 'active' ? "text-emerald-600" : "")}>{sub.status}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">Exp: {format(new Date(sub.expires_at), 'dd MMM yyyy', { locale: es })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── User List ──
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión completa de cuentas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: usersData?.stats?.totalUsers || 0, icon: Users, color: '#2692DC' },
          { label: 'Pro', value: usersData?.stats?.proUsers || 0, icon: Crown, color: '#f59e0b' },
          { label: 'Activos 7d', value: usersData?.stats?.activeUsers7d || 0, icon: Activity, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users list */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          <span className="flex-1">Usuario</span>
          <span className="w-32 hidden md:block">Negocio</span>
          <span className="w-20 hidden lg:block text-center">Logins</span>
          <span className="w-28 hidden md:block text-right">Registro</span>
          <span className="w-32 text-right">Última actividad</span>
          <span className="w-20" />
        </div>
        <ScrollArea className="h-[620px]">
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="p-2 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
            {!isLoading && !usersData?.users?.length && (
              <div className="p-12 text-center text-sm text-muted-foreground">No se encontraron usuarios</div>
            )}
            {usersData?.users?.map((user: UserData) => {
              const biz = user.businesses?.[0];
              return (
                <div
                  key={user.id}
                  className="flex items-center px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-[#746CE6]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-9 h-9 object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{user.full_name || user.email?.split('@')[0]}</p>
                        {isPro(user) && <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 h-4">PRO</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="w-32 hidden md:block min-w-0">
                    {biz ? (
                      <div className="flex items-center gap-1 text-[12px] text-foreground truncate">
                        <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{biz.name}</span>
                        {biz.country && <span className="text-[10px] text-muted-foreground">·{biz.country}</span>}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60">Sin negocio</span>
                    )}
                  </div>
                  <span className="w-20 hidden lg:block text-center text-[12px] text-foreground tabular-nums">
                    {(user as any).login_count || 0}
                  </span>
                  <span className="w-28 hidden md:block text-right text-[11px] text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'dd MMM yy', { locale: es }) : '—'}
                  </span>
                  <span className="w-32 text-right text-[11px] text-muted-foreground">
                    {user.last_active_at ? formatDistanceToNow(new Date(user.last_active_at), { locale: es, addSuffix: true }) : 'Nunca'}
                  </span>
                  <div className="w-20 flex items-center justify-end gap-1">
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setPlanTarget({ id: user.id, email: user.email }); setShowPlanDialog(true); }}>
                        <Crown className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: user.id, email: user.email }); setShowDeleteDialog(true); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="w-5 h-5" /> Eliminar usuario
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a <strong>{deleteTarget?.email}</strong>? Esta acción es irreversible y eliminará todos sus datos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" /> Cambiar plan
            </DialogTitle>
            <DialogDescription>
              Modificar la suscripción de <strong>{planTarget?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro_monthly">Pro Mensual</SelectItem>
                  <SelectItem value="pro_yearly">Pro Anual</SelectItem>
                  <SelectItem value="free">Revocar (Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPlan !== 'free' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Duración (días)</label>
                <Input value={planDays} onChange={e => setPlanDays(e.target.value)} type="number" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>Cancelar</Button>
            <Button onClick={() => planTarget && planMutation.mutate({ userId: planTarget.id, planId: selectedPlan, durationDays: parseInt(planDays) || 365 })} disabled={planMutation.isPending}>
              {planMutation.isPending ? 'Actualizando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
