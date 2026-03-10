/**
 * GooglePlacesInlineEditor
 * Allows adding, changing, or removing Google Place ID directly from any reputation section.
 * Shows warning that changes will affect reputation analysis and Brain data.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Star, MessageSquare, X, Loader2, Pencil,
  AlertTriangle, Check, RefreshCw, Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

interface GooglePlaceData {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
}

interface GooglePlacesInlineEditorProps {
  className?: string;
  onPlaceChanged?: () => void;
  compact?: boolean;
}

const createSessionToken = () => {
  try {
    if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch { /* fallback */ }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

export const GooglePlacesInlineEditor = ({
  className,
  onPlaceChanged,
  compact = false,
}: GooglePlacesInlineEditorProps) => {
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionTokenRef = useRef(createSessionToken());

  const hasPlace = !!currentBusiness?.google_place_id;
  const countryCode = (currentBusiness as any)?.country || "AR";

  const handleSearch = useCallback(async (query: string) => {
    setSearch(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("google-places-autocomplete", {
          body: { input: query, types: "establishment", country: countryCode, sessionToken: sessionTokenRef.current },
        });
        if (!error && data?.predictions) setSuggestions(data.predictions);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [countryCode]);

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setSaving(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("google-place-details", {
        body: { placeId: prediction.placeId, sessionToken: sessionTokenRef.current },
      });
      if (error) throw error;

      const place = data?.place;
      if (!place || !currentBusiness) throw new Error("No place data");

      const rating = place.rating;
      const reviewCount = place.userRatingCount || place.reviewCount;
      const address = place.formattedAddress || place.address;

      // Update business
      const { error: updateErr } = await supabase.from("businesses").update({
        google_place_id: prediction.placeId,
        avg_rating: rating,
        address: address,
      }).eq("id", currentBusiness.id);

      if (updateErr) throw updateErr;

      // Fire sync (which auto-triggers analysis) and wait for it
      try {
        await supabase.functions.invoke("google-sync-public-reviews", {
          body: { businessId: currentBusiness.id, placeId: prediction.placeId },
        });
      } catch (syncErr) {
        console.warn("Sync warning:", syncErr);
      }

      sessionTokenRef.current = createSessionToken();
      await refreshBusinesses();
      setEditing(false);
      setSearch("");
      onPlaceChanged?.();

      toast({
        title: "✅ Negocio actualizado",
        description: `${place.displayName?.text || prediction.mainText} vinculado. El análisis de reputación se actualizará automáticamente.`,
      });
    } catch (err) {
      console.error("Error selecting place:", err);
      toast({ title: "Error", description: "No se pudo vincular el negocio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePlace = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    try {
      await supabase.from("businesses").update({
        google_place_id: null,
        avg_rating: null,
      }).eq("id", currentBusiness.id);

      await refreshBusinesses();
      setShowConfirmRemove(false);
      setEditing(false);
      onPlaceChanged?.();

      toast({
        title: "Google Maps desvinculado",
        description: "El análisis de reputación usará datos del Brain únicamente.",
      });
    } catch {
      toast({ title: "Error", description: "No se pudo desvincular", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Confirm remove dialog
  if (showConfirmRemove) {
    return (
      <div className={cn("p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">¿Desvincular Google Maps?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Se eliminará el análisis automático de reseñas, palabras clave y puntajes de reputación.
              El Brain preguntará más sobre tu reputación para seguir entregándote información.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleRemovePlace} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
            Sí, desvincular
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowConfirmRemove(false)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Current place display (not editing)
  if (hasPlace && !editing) {
    return (
      <div className={cn("p-3 rounded-xl border border-border bg-card space-y-2", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <GoogleIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {currentBusiness?.address || "Google Maps conectado"}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {currentBusiness?.avg_rating && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    {currentBusiness.avg_rating}
                  </span>
                )}
                <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/30 px-1">
                  <Check className="w-2 h-2 mr-0.5" /> Activo
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setShowConfirmRemove(true)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No place or editing mode — show search
  return (
    <div className={cn("space-y-3", className)}>
      {/* Warning banner when changing */}
      {hasPlace && editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Cambiar el negocio</span> modificará todo el análisis de reputación, 
            reseñas, puntajes y los datos que usa el Brain para tus recomendaciones.
          </div>
        </motion.div>
      )}

      {!hasPlace && !compact && (
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            Buscá tu negocio, servicio o profesión en Google Maps para activar el análisis automático de reputación
          </p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar en Google Maps..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-11 text-sm bg-secondary/50"
          autoFocus
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
        {editing && (
          <button
            onClick={() => { setEditing(false); setSearch(""); setSuggestions([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-lg max-h-[250px] overflow-y-auto"
          >
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                onClick={() => handleSelectPlace(s)}
                disabled={saving}
                className="w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0 flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{s.mainText || s.description}</p>
                  {s.secondaryText && (
                    <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {saving && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <Loader2 className="w-3 h-3 animate-spin" />
          Vinculando y sincronizando reseñas...
        </div>
      )}
    </div>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default GooglePlacesInlineEditor;