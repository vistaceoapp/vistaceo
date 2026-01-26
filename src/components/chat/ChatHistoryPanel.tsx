import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { History, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationDay {
  date: string;
  dateLabel: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }>;
}

interface ChatHistoryPanelProps {
  businessId: string;
  onLoadConversation?: (messages: ConversationDay["messages"]) => void;
  compact?: boolean;
}

const formatDateLabel = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoy";
    if (isYesterday(date)) return "Ayer";
    if (isThisWeek(date)) return format(date, "EEEE", { locale: es });
    return format(date, "d 'de' MMM", { locale: es });
  } catch {
    return dateStr;
  }
};

export const ChatHistoryPanel = ({
  businessId,
  onLoadConversation,
  compact = false,
}: ChatHistoryPanelProps) => {
  const [conversations, setConversations] = useState<ConversationDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [businessId, open]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, content, role, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;

      // Group messages by date
      const groupedByDate = new Map<string, ConversationDay["messages"]>();
      
      (data || []).forEach((msg) => {
        const dateKey = format(parseISO(msg.created_at), "yyyy-MM-dd");
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey)!.push({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          created_at: msg.created_at,
        });
      });

      // Convert to array and sort by date descending
      const conversationDays: ConversationDay[] = [];
      groupedByDate.forEach((messages, dateKey) => {
        // Sort messages by time ascending within each day
        messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        conversationDays.push({
          date: dateKey,
          dateLabel: formatDateLabel(dateKey),
          messages,
        });
      });

      // Sort days by date descending
      conversationDays.sort((a, b) => b.date.localeCompare(a.date));

      setConversations(conversationDays);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = (messages: ConversationDay["messages"]): string => {
    const userMsg = messages.find(m => m.role === "user");
    if (!userMsg) return "Conversación";
    const text = userMsg.content.slice(0, 80);
    return text.length >= 80 ? text + "..." : text;
  };

  const handleSelectDay = (day: ConversationDay) => {
    if (expandedDate === day.date) {
      setExpandedDate(null);
    } else {
      setExpandedDate(day.date);
    }
  };

  const TriggerButton = (
    <Button
      variant="ghost"
      size={compact ? "sm" : "default"}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground transition-colors",
        compact && "h-8 w-8 p-0"
      )}
    >
      <History className="w-4 h-4" />
      {!compact && <span className="text-sm">Historial</span>}
    </Button>
  );

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[400px] p-0 border-border/50"
      >
        <SheetHeader className="p-4 sm:p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-left text-base sm:text-lg">Historial</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalMessages} mensajes • {conversations.length} días
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-100px)]">
          <div className="p-2 sm:p-3 space-y-1.5">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary/50" />
                </div>
                <p className="text-sm sm:text-base font-medium text-foreground mb-1">
                  Sin conversaciones
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px] mx-auto">
                  Empezá a chatear para ver tu historial
                </p>
              </div>
            ) : (
              conversations.map((day) => (
                <div key={day.date} className="rounded-xl border border-border/30 overflow-hidden">
                  {/* Day Header */}
                  <button
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "w-full text-left p-3 bg-card/50",
                      "hover:bg-accent/50 transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20",
                      expandedDate === day.date && "bg-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {day.dateLabel}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                              {day.messages.length}
                            </span>
                            <ChevronRight className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform",
                              expandedDate === day.date && "rotate-90"
                            )} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {getPreviewText(day.messages)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Messages */}
                  {expandedDate === day.date && (
                    <div className="border-t border-border/20 bg-muted/20 p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                      {day.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-2 rounded-lg text-xs",
                            msg.role === "user" 
                              ? "bg-primary/10 ml-4" 
                              : "bg-card/80 mr-4 border border-border/20"
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn(
                              "text-[10px] font-medium",
                              msg.role === "user" ? "text-primary" : "text-muted-foreground"
                            )}>
                              {msg.role === "user" ? "Tú" : "CEO"}
                            </span>
                            <span className="text-[9px] text-muted-foreground/60">
                              {format(parseISO(msg.created_at), "HH:mm")}
                            </span>
                          </div>
                          <p className="text-foreground/80 line-clamp-3 leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
