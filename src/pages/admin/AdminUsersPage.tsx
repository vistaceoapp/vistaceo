import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Search, ChevronRight, Crown, User, Building2, 
  Calendar, Activity, MessageSquare, Target, CheckCircle,
  TrendingUp, Clock, MapPin, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
    id: string;
    name: string;
    category: string;
    country: string;
    setup_completed: boolean;
    created_at: string;
  }>;
  subscriptions: Array<{
    id: string;
    plan_id: string;
    status: string;
    expires_at: string;
    payment_provider: string;
  }>;
}

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

  const isPro = (user: UserData) => {
    return user.subscriptions?.some(s => s.status === 'active');
  };

  if (selectedUserId && userDetail) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">{userDetail.profile?.full_name || userDetail.profile?.email}</h1>
          {userDetail.subscriptions?.some((s: { status: string }) => s.status === 'active') && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Crown className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="missions">Misiones</TabsTrigger>
            <TabsTrigger value="chat">Chat IA</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Logins totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userDetail.profile?.login_count || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Último login</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">
                    {userDetail.profile?.last_login_at 
                      ? formatDistanceToNow(new Date(userDetail.profile.last_login_at), { locale: es, addSuffix: true })
                      : 'Nunca'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Misiones completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {userDetail.metrics?.reduce((acc: number, m: { missions_completed: number }) => acc + (m.missions_completed || 0), 0) || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mensajes chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {userDetail.metrics?.reduce((acc: number, m: { chat_messages_sent: number }) => acc + (m.chat_messages_sent || 0), 0) || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {userDetail.businessBrain && (
              <Card>
                <CardHeader>
                  <CardTitle>Cerebro del Negocio</CardTitle>
                  <CardDescription>Estado del aprendizaje continuo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tipo de negocio:</span>
                    <Badge variant="outline">{userDetail.businessBrain.primary_business_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Foco actual:</span>
                    <Badge>{userDetail.businessBrain.current_focus}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Señales totales:</span>
                    <span className="font-bold">{userDetail.businessBrain.total_signals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score de confianza:</span>
                    <span className="font-bold">{Math.round((userDetail.businessBrain.confidence_score || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MVC completado:</span>
                    <span className="font-bold">{userDetail.businessBrain.mvc_completion_pct || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {userDetail.businessSnapshots && userDetail.businessSnapshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Salud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userDetail.businessSnapshots.slice(0, 5).map((snap: { id: string; total_score: number; created_at: string }) => (
                      <div key={snap.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(snap.created_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                        <Badge variant={snap.total_score >= 70 ? 'default' : snap.total_score >= 50 ? 'secondary' : 'destructive'}>
                          {snap.total_score} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {userDetail.businesses?.map((biz: { id: string; name: string; category: string; country: string; setup_completed: boolean; created_at: string }) => (
              <Card key={biz.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {biz.name}
                    </CardTitle>
                    {biz.setup_completed && <Badge className="bg-green-500">Setup completo</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge variant="outline">{biz.category || 'No definida'}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{biz.country || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Creado: {format(new Date(biz.created_at), 'dd MMM yyyy', { locale: es })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="missions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Misiones ({userDetail.missions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {!userDetail.missions?.length && (
                    <p className="text-muted-foreground text-center py-4">Sin misiones</p>
                  )}
                  <div className="space-y-2">
                    {userDetail.missions?.map((mission: { id: string; title: string; status: string; created_at: string; completed_at?: string }) => (
                      <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(mission.created_at), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <Badge variant={mission.status === 'completed' ? 'default' : mission.status === 'in_progress' ? 'secondary' : 'outline'}>
                          {mission.status === 'completed' ? 'Completada' : mission.status === 'in_progress' ? 'En progreso' : mission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oportunidades detectadas ({userDetail.opportunities?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {!userDetail.opportunities?.length && (
                    <p className="text-muted-foreground text-center py-4">Sin oportunidades</p>
                  )}
                  <div className="space-y-2">
                    {userDetail.opportunities?.map((opp: { id: string; title: string; impact_score: number; is_converted: boolean }) => (
                      <div key={opp.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <p className="text-sm">{opp.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Impacto: {opp.impact_score}/10</Badge>
                          {opp.is_converted && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversaciones con IA ({userDetail.chatMessages?.length || 0} mensajes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {!userDetail.chatMessages?.length && (
                    <p className="text-muted-foreground text-center py-4">Sin conversaciones</p>
                  )}
                  <div className="space-y-3">
                    {userDetail.chatMessages?.map((msg: { id: string; role: string; content: string; created_at: string }) => (
                      <div 
                        key={msg.id} 
                        className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted/50 mr-8'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {msg.role === 'user' ? 'Usuario' : 'VistaCEO'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), 'dd MMM HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content.slice(0, 500)}{msg.content.length > 500 ? '...' : ''}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {userDetail.activity?.map((act: { id: string; event_type: string; page_path: string; created_at: string }) => (
                      <div key={act.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium">{act.event_type}</p>
                            <p className="text-xs text-muted-foreground">{act.page_path}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(act.created_at), { locale: es, addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Historial de suscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDetail.subscriptions?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Sin suscripciones</p>
                  )}
                  {userDetail.subscriptions?.map((sub: { id: string; plan_id: string; status: string; expires_at: string; payment_provider: string }) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{sub.plan_id}</p>
                        <p className="text-sm text-muted-foreground">via {sub.payment_provider}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expira: {format(new Date(sub.expires_at), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona y monitorea todos los usuarios de VistaCEO</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usersData?.stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Usuarios Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{usersData?.stats?.proUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Activos (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{usersData?.stats?.activeUsers7d || 0}</p>
          </CardContent>
        </Card>
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
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {isLoading && (
                <div className="p-8 text-center text-muted-foreground">Cargando...</div>
              )}
              {usersData?.users?.map((user: UserData) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.full_name || user.email}</p>
                        {isPro(user) && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {user.businesses?.length > 0 && (
                        <p className="text-sm flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.businesses[0].name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {user.last_active_at 
                          ? formatDistanceToNow(new Date(user.last_active_at), { locale: es, addSuffix: true })
                          : 'Sin actividad'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
