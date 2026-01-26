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
import { History, MessageCircle, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationSummary {
  date: string;
  preview: string;
  messageCount: number;
  firstMessageId: string;
}

interface ChatHistoryPanelProps {
  businessId: string;
  onSelectConversation?: (date: string) => void;
  compact?: boolean;
}

const formatDateGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  if (isThisWeek(date)) return format(date, "EEEE", { locale: es });
  return format(date, "d 'de' MMMM", { locale: es });
};

export const ChatHistoryPanel = ({
  businessId,
  onSelectConversation,
  compact = false,
}: ChatHistoryPanelProps) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [businessId, open]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get all messages grouped by date
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, content, role, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      // Group messages by date
      const groupedByDate = new Map<string, typeof data>();
      
      (data || []).forEach((msg) => {
        const dateKey = format(new Date(msg.created_at), "yyyy-MM-dd");
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey)!.push(msg);
      });

      // Create summaries
      const summaries: ConversationSummary[] = [];
      groupedByDate.forEach((messages, dateKey) => {
        const userMessages = messages.filter(m => m.role === "user");
        const preview = userMessages[0]?.content?.slice(0, 60) || "Conversación";
        
        summaries.push({
          date: dateKey,
          preview: preview + (preview.length >= 60 ? "..." : ""),
          messageCount: messages.length,
          firstMessageId: messages[messages.length - 1].id,
        });
      });

      setConversations(summaries);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
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
      <History className={cn("w-4 h-4", compact && "w-4 h-4")} />
      {!compact && <span className="text-sm">Historial</span>}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[380px] p-0 border-border/50">
        <SheetHeader className="p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left text-lg">Conversaciones</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {conversations.length} días con actividad
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                  Sin conversaciones
                </p>
                <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">
                  Empezá a chatear para ver tu historial aquí
                </p>
              </div>
            ) : (
              conversations.map((conv, idx) => (
                <button
                  key={conv.date}
                  onClick={() => {
                    onSelectConversation?.(conv.date);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border border-border/30 bg-card/50",
                    "hover:bg-accent/50 hover:border-primary/30 transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {formatDateGroup(conv.date)}
                        </p>
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {conv.messageCount} msgs
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {conv.preview}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
