import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw, 
  Loader2, CheckCircle, Clock, AlertTriangle, XCircle 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PILLARS, type PillarKey } from '@/lib/blog/types';

interface PlanItem {
  id: string;
  planned_date: string;
  pillar: string;
  status: string;
  topic?: {
    title_base: string;
  } | null;
}

export default function AdminCalendarPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch all plan items for the current month
  const { data: planItems, isLoading } = useQuery({
    queryKey: ['admin-calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('blog_plan')
        .select('id, planned_date, pillar, status, topic:blog_topics(title_base)')
        .gte('planned_date', start)
        .lte('planned_date', end)
        .order('planned_date', { ascending: true });
      
      if (error) throw error;
      return data as PlanItem[];
    }
  });

  // Fetch upcoming posts (next 7 days)
  const { data: upcomingPosts } = useQuery({
    queryKey: ['admin-calendar-upcoming'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('blog_plan')
        .select('id, planned_date, pillar, status, topic:blog_topics(title_base)')
        .gte('planned_date', today)
        .eq('status', 'planned')
        .order('planned_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data as PlanItem[];
    }
  });

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, PlanItem[]> = {};
    (planItems || []).forEach(item => {
      if (!grouped[item.planned_date]) {
        grouped[item.planned_date] = [];
      }
      grouped[item.planned_date].push(item);
    });
    return grouped;
  }, [planItems]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'planned':
        return 'bg-blue-500';
      case 'skipped':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Publicado</Badge>;
      case 'planned':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Planificado</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Saltado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPillarEmoji = (pillar: string) => {
    return PILLARS[pillar as PillarKey]?.emoji || '📝';
  };

  const selectedDateItems = selectedDate 
    ? itemsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Calendario editorial
          </h1>
          <p className="text-muted-foreground">Programación de publicaciones del blog</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-calendar'] })}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refrescar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for alignment */}
                  {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20" />
                  ))}
                  
                  {calendarDays.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayItems = itemsByDate[dateKey] || [];
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "h-20 p-1 rounded-lg border text-left transition-colors relative",
                          "hover:border-primary/50 hover:bg-muted/50",
                          isToday(day) && "border-primary bg-primary/5",
                          isSelected && "ring-2 ring-primary border-primary",
                          !isSameMonth(day, currentMonth) && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "text-sm font-medium",
                          isToday(day) && "text-primary"
                        )}>
                          {format(day, 'd')}
                        </div>
                        
                        {dayItems.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {dayItems.slice(0, 3).map(item => (
                              <div 
                                key={item.id}
                                className={cn(
                                  "text-xs px-1 py-0.5 rounded truncate flex items-center gap-1",
                                  item.status === 'published' && "bg-green-500/20 text-green-700",
                                  item.status === 'planned' && "bg-blue-500/20 text-blue-700",
                                  item.status === 'skipped' && "bg-yellow-500/20 text-yellow-700",
                                  item.status === 'failed' && "bg-red-500/20 text-red-700"
                                )}
                              >
                                <span>{getPillarEmoji(item.pillar)}</span>
                              </div>
                            ))}
                            {dayItems.length > 3 && (
                              <div className="text-xs text-muted-foreground pl-1">
                                +{dayItems.length - 3} más
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected date details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                  : 'Seleccioná una fecha'
                }
              </CardTitle>
              <CardDescription>
                {selectedDateItems.length} publicación(es) programada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {selectedDateItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay publicaciones para esta fecha
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateItems.map(item => (
                      <div key={item.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getPillarEmoji(item.pillar)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.topic?.title_base || 'Sin título'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {PILLARS[item.pillar as PillarKey]?.label || item.pillar}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Upcoming posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas publicaciones</CardTitle>
              <CardDescription>Posts pendientes de publicar</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {(upcomingPosts || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay publicaciones pendientes
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(upcomingPosts || []).map(item => (
                      <div 
                        key={item.id} 
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                      >
                        <span>{getPillarEmoji(item.pillar)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.topic?.title_base || 'Sin título'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.planned_date), "EEE d MMM", { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
