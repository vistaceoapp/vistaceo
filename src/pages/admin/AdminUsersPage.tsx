import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Search, ChevronRight, Crown, User, Building2, 
  Calendar, Activity, MessageSquare, Target, CheckCircle,
  TrendingUp, Clock, MapPin, ArrowLeft, Brain, Zap, Mail
} from 'lucide-react';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  last_login_at: string;
  last_active_at: string;
  login_count: number;
  businesses: Array<{
    id: string; name: string; category: string; country: string; setup_completed: boolean; created_at: string;
  }>;
  subscriptions: Array<{
    id: string; plan_id: string; status: string; expires_at: string; payment_provider: string; payment_amount: number;
  }>;
}

const DarkCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl bg-[#111118] border border-[#1a1a2e]", className)}>{children}</div>
);

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-users', {
        body: { search, page: 1, limit: 100 },
      });
      if (error) throw error;
      return data;
    },
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
  });

  const isPro = (user: UserData) => user.subscriptions?.some(s => s.status === 'active');

  // ── Detail View ──
  if (selectedUserId && userDetail) {
    const profile = userDetail.profile;
    const biz = userDetail.businesses?.[0];
    const brain = userDetail.businessBrain;
    const hasPro = userDetail.subscriptions?.some((s: any) => s.status === 'active');

    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-[1200px]">
        {/* Back + header */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedUserId(null)} className="text-[#555] hover:text-white transition-colors flex items-center gap-1.5 text-[13px]">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0">
            {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-white">{profile?.full_name || 'Sin nombre'}</h1>
              {hasPro && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] border-0">
                  <Crown className="w-3 h-3 mr-1" /> PRO
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-[#666] flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> {profile?.email}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Logins', value: profile?.login_count || 0, color: '#2692DC' },
            { label: 'Último login', value: profile?.last_login_at ? formatDistanceToNow(new Date(profile.last_login_at), { locale: es }) : 'Nunca', color: '#4ecdc4' },
            { label: 'Misiones', value: userDetail.missions?.length || 0, color: '#746CE6' },
            { label: 'Chat msgs', value: userDetail.chatMessages?.length || 0, color: '#febc2e' },
            { label: 'Oportunidades', value: userDetail.opportunities?.length || 0, color: '#28c840' },
            { label: 'Salud', value: userDetail.businessSnapshots?.[0]?.total_score ? `${userDetail.businessSnapshots[0].total_score}/100` : 'N/A', color: '#ff6b6b' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-3 text-center">
              <p className="text-[18px] font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-[#555]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Business + Brain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {biz && (
            <DarkCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-[#2692DC]" />
                <h3 className="text-[14px] font-semibold text-white">Negocio</h3>
                {biz.setup_completed && <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">Setup ✓</Badge>}
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-[#666]">Nombre</span><span className="text-white font-medium">{biz.name}</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Categoría</span><span className="text-[#ccc]">{biz.category || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#666]">País</span><span className="text-[#ccc]">{biz.country || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Creado</span><span className="text-[#ccc]">{format(new Date(biz.created_at), 'dd MMM yyyy', { locale: es })}</span></div>
              </div>
            </DarkCard>
          )}

          {brain && (
            <DarkCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-[#746CE6]" />
                <h3 className="text-[14px] font-semibold text-white">Cerebro IA</h3>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-[#666]">Tipo negocio</span><span className="text-white">{brain.primary_business_type}</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Foco</span><Badge variant="outline" className="text-[10px] border-[#2a2a3e] text-[#ccc]">{brain.current_focus}</Badge></div>
                <div className="flex justify-between"><span className="text-[#666]">Confianza</span><span className="text-white font-bold">{Math.round((brain.confidence_score || 0) * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-[#666]">MVC</span><span className="text-white font-bold">{brain.mvc_completion_pct || 0}%</span></div>
                <div className="flex justify-between"><span className="text-[#666]">Señales</span><span className="text-[#ccc]">{brain.total_signals || 0}</span></div>
              </div>
            </DarkCard>
          )}
        </div>

        {/* Missions */}
        <DarkCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#746CE6]" />
            <h3 className="text-[14px] font-semibold text-white">Misiones ({userDetail.missions?.length || 0})</h3>
          </div>
          <ScrollArea className="h-[300px]">
            {!userDetail.missions?.length && <p className="text-[13px] text-[#444] text-center py-8">Sin misiones</p>}
            <div className="space-y-1.5">
              {userDetail.missions?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#ccc] truncate">{m.title}</p>
                    <p className="text-[10px] text-[#444]">{format(new Date(m.created_at), 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] border-[#2a2a3e]",
                    m.status === 'completed' ? "text-emerald-400" : m.status === 'in_progress' ? "text-[#2692DC]" : "text-[#555]"
                  )}>
                    {m.status === 'completed' ? '✓ Completada' : m.status === 'in_progress' ? 'En progreso' : m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DarkCard>

        {/* Chat */}
        <DarkCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-[#2692DC]" />
            <h3 className="text-[14px] font-semibold text-white">Chat IA ({userDetail.chatMessages?.length || 0} msgs)</h3>
          </div>
          <ScrollArea className="h-[400px]">
            {!userDetail.chatMessages?.length && <p className="text-[13px] text-[#444] text-center py-8">Sin conversaciones</p>}
            <div className="space-y-2">
              {userDetail.chatMessages?.map((msg: any) => (
                <div key={msg.id} className={cn(
                  "p-3 rounded-lg text-[13px]",
                  msg.role === 'user' ? "bg-[#2692DC]/10 ml-8 text-[#ccc]" : "bg-[#0d0d14] mr-8 text-[#999] border border-[#1a1a2e]"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#555] font-medium">{msg.role === 'user' ? 'Usuario' : 'VISTACEO'}</span>
                    <span className="text-[10px] text-[#444]">{format(new Date(msg.created_at), 'dd MMM HH:mm', { locale: es })}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content?.slice(0, 500)}{msg.content?.length > 500 ? '...' : ''}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DarkCard>

        {/* Subscriptions */}
        <DarkCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-[#febc2e]" />
            <h3 className="text-[14px] font-semibold text-white">Suscripciones</h3>
          </div>
          {!userDetail.subscriptions?.length && <p className="text-[13px] text-[#444] text-center py-6">Sin suscripciones</p>}
          <div className="space-y-2">
            {userDetail.subscriptions?.map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
                <div>
                  <p className="text-[13px] text-white font-medium">{sub.plan_id}</p>
                  <p className="text-[11px] text-[#555]">via {sub.payment_provider} · ${sub.payment_amount}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={cn(
                    "text-[10px] border-[#2a2a3e]",
                    sub.status === 'active' ? "text-emerald-400" : "text-[#555]"
                  )}>{sub.status}</Badge>
                  <p className="text-[10px] text-[#444] mt-1">
                    Exp: {format(new Date(sub.expires_at), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DarkCard>

        {/* Activity */}
        <DarkCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#4ecdc4]" />
            <h3 className="text-[14px] font-semibold text-white">Actividad reciente</h3>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1.5">
              {userDetail.activity?.map((act: any) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#0d0d14] transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-[#555]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#999]">
                      <span className="text-[#ccc] font-medium">{act.event_type}</span>
                      {act.page_path && <span className="text-[#444]"> · {act.page_path}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#444] flex-shrink-0">
                    {formatDistanceToNow(new Date(act.created_at), { locale: es, addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DarkCard>
      </div>
    );
  }

  // ── User List ──
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-[24px] font-bold text-white">Usuarios</h1>
        <p className="text-[14px] text-[#666]">Gestión y monitoreo de cuentas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: usersData?.stats?.totalUsers || 0, icon: Users, color: '#2692DC' },
          { label: 'Pro', value: usersData?.stats?.proUsers || 0, icon: Crown, color: '#febc2e' },
          { label: 'Activos 7d', value: usersData?.stats?.activeUsers7d || 0, icon: TrendingUp, color: '#28c840' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-[#111118] border border-[#1a1a2e] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-[#555]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
        <Input
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#111118] border-[#1a1a2e] text-white placeholder:text-[#444] focus:border-[#2692DC]/50"
        />
      </div>

      {/* Users list */}
      <DarkCard>
        <ScrollArea className="h-[600px]">
          <div className="divide-y divide-[#1a1a2e]">
            {isLoading && (
              <div className="p-8 text-center text-[#555] text-[13px]">Cargando usuarios...</div>
            )}
            {usersData?.users?.map((user: UserData) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-[#0d0d14] cursor-pointer transition-colors"
                onClick={() => setSelectedUserId(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2692DC]/20 to-[#746CE6]/20 flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    ) : (
                      <span className="text-[13px] font-bold text-[#888]">{(user.full_name || user.email || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-white truncate">{user.full_name || user.email}</p>
                      {isPro(user) && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] border-0 px-1.5 py-0">
                          PRO
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-[#555] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    {user.businesses?.length > 0 && (
                      <p className="text-[12px] text-[#888] flex items-center gap-1 justify-end">
                        <Building2 className="w-3 h-3" />
                        {user.businesses[0].name}
                      </p>
                    )}
                    <p className="text-[10px] text-[#444]">
                      {user.last_active_at 
                        ? formatDistanceToNow(new Date(user.last_active_at), { locale: es, addSuffix: true })
                        : 'Sin actividad'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#333]" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DarkCard>
    </div>
  );
}
