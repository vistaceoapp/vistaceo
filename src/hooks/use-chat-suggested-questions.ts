import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatSuggestion {
  id: string;
  text: string;
  category: "problema" | "oportunidad" | "mejora" | "analisis";
}

const CACHE_KEY = (id: string) => `vistaceo:chat-suggestions:${id}`;
const TTL_MS = 1000 * 60 * 60 * 24; // 24h — persistente, sin auto-regenerar

interface Cached { ts: number; suggestions: ChatSuggestion[] }

function readCache(id: string): ChatSuggestion[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (!parsed?.suggestions?.length) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.suggestions;
  } catch { return null; }
}

function writeCache(id: string, suggestions: ChatSuggestion[]) {
  try {
    localStorage.setItem(CACHE_KEY(id), JSON.stringify({ ts: Date.now(), suggestions }));
  } catch {}
}

export function useChatSuggestedQuestions(businessId: string | undefined, opts?: { auto?: boolean }) {
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const auto = opts?.auto ?? true;

  const fetchFresh = useCallback(async (force = false) => {
    if (!businessId) return;
    if (!force) {
      const cached = readCache(businessId);
      if (cached) { setSuggestions(cached); return; }
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-chat-suggestions", {
        body: { businessId },
      });
      if (error) throw error;
      const list: ChatSuggestion[] = Array.isArray(data?.suggestions) ? data.suggestions : [];
      if (list.length) {
        setSuggestions(list);
        writeCache(businessId, list);
      }
    } catch (e) {
      console.error("useChatSuggestedQuestions error", e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!auto || !businessId) return;
    const cached = readCache(businessId);
    if (cached) { setSuggestions(cached); return; }
    fetchFresh(false);
  }, [businessId, auto, fetchFresh]);

  return { suggestions, loading, refresh: () => fetchFresh(true) };
}
