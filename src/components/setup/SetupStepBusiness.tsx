// Step: Business Name — Google + Web/LinkedIn siempre disponibles, nunca bloquea
import { motion } from 'framer-motion';
import { MapPin, Star, MessageSquare, Search, X, Loader2, Building2, Globe, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GooglePlaceData {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
}

interface SetupStepBusinessProps {
  countryCode: string;
  areaId?: string;
  currentName: string;
  currentPlaceId?: string;
  onUpdate: (data: {
    businessName: string;
    googlePlaceId?: string;
    googleRating?: number;
    googleReviewCount?: number;
    googleAddress?: string;
    googleLat?: number;
    googleLng?: number;
    linkedinUrl?: string;
    websiteUrl?: string;
    sourcePreference?: 'google' | 'linkedin' | 'website' | 'manual';
  }) => void;
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

// Áreas que son servicios/profesionales — la web/LinkedIn es prioridad
const SERVICE_AREAS = new Set([
  'A5_TECH', 'A6_B2B', 'A7_HOGAR_SERV', 'A11_FINANZAS', 'A12_LEGAL',
  'A13_CREATIVO', 'A14_TURISMO', 'A19_SOCIAL', 'A20_FREELANCE',
]);

const createSessionToken = () => {
  try {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // Fallback below
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

export const SetupStepBusiness = ({
  countryCode,
  areaId,
  currentName,
  currentPlaceId,
  onUpdate,
}: SetupStepBusinessProps) => {
  const isService = useMemo(() => (areaId ? SERVICE_AREAS.has(areaId) : false), [areaId]);
  const lang = countryCode === 'BR' ? 'pt' : 'es';

  const [manualName, setManualName] = useState(currentName || '');
  const [googleQuery, setGoogleQuery] = useState(currentPlaceId ? currentName : '');
  const [webOrLinkedin, setWebOrLinkedin] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceData | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionTokenRef = useRef(createSessionToken());

  // Empujar updates al padre — siempre, con lo que haya
  const pushUpdate = (partial: {
    name?: string;
    place?: GooglePlaceData | null;
    web?: string;
    linkedin?: string;
  }) => {
    const name = (partial.name ?? manualName).trim();
    const place = partial.place !== undefined ? partial.place : selectedPlace;
    const web = (partial.web ?? '').trim();
    const linkedin = (partial.linkedin ?? '').trim();

    const finalName = place?.name || name || '';
    let source: 'google' | 'linkedin' | 'website' | 'manual' = 'manual';
    if (place) source = 'google';
    else if (linkedin) source = 'linkedin';
    else if (web) source = 'website';

    onUpdate({
      businessName: finalName,
      googlePlaceId: place?.placeId,
      googleRating: place?.rating,
      googleReviewCount: place?.reviewCount,
      googleAddress: place?.address,
      googleLat: place?.lat,
      googleLng: place?.lng,
      linkedinUrl: linkedin || undefined,
      websiteUrl: web || undefined,
      sourcePreference: source,
    });
  };

  // Detectar si el input externo es LinkedIn o web
  const splitExternal = (value: string) => {
    const isLinkedin = /linkedin\.com/i.test(value);
    return {
      web: isLinkedin ? '' : value,
      linkedin: isLinkedin ? value : '',
    };
  };

  const handleManualName = (value: string) => {
    setManualName(value);
    const ext = splitExternal(webOrLinkedin);
    pushUpdate({ name: value, web: ext.web, linkedin: ext.linkedin });
  };

  const handleExternal = (value: string) => {
    setWebOrLinkedin(value);
    const ext = splitExternal(value);
    pushUpdate({ name: manualName, web: ext.web, linkedin: ext.linkedin });
  };

  const handleGoogleSearch = (query: string) => {
    setGoogleQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
          body: {
            input: query,
            types: 'establishment',
            country: countryCode,
            sessionToken: sessionTokenRef.current,
          },
        });
        if (!error && data?.predictions) setSuggestions(data.predictions);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('google-place-details', {
        body: { placeId: prediction.placeId, sessionToken: sessionTokenRef.current },
      });
      if (!error && data?.place) {
        const place = data.place;
        const placeData: GooglePlaceData = {
          placeId: prediction.placeId,
          name: place.displayName?.text || place.name || prediction.mainText || '',
          address: place.formattedAddress || place.address,
          rating: place.rating,
          reviewCount: place.userRatingCount || place.reviewCount,
          lat: place.location?.latitude || place.lat,
          lng: place.location?.longitude || place.lng,
        };
        setSelectedPlace(placeData);
        setGoogleQuery(placeData.name);
        setManualName(placeData.name);
        sessionTokenRef.current = createSessionToken();
        const ext = splitExternal(webOrLinkedin);
        pushUpdate({ name: placeData.name, place: placeData, web: ext.web, linkedin: ext.linkedin });
      }
    } catch (err) {
      console.error('Place details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPlace = () => {
    setSelectedPlace(null);
    setGoogleQuery('');
    const ext = splitExternal(webOrLinkedin);
    pushUpdate({ name: manualName, place: null, web: ext.web, linkedin: ext.linkedin });
  };

  // Render de los dos bloques (los reordenamos según servicio/físico)
  const googleBlock = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {lang === 'pt' ? 'Buscar no Google' : 'Buscar en Google'}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {lang === 'pt' ? 'opcional' : 'opcional'}
        </span>
      </div>

      {selectedPlace ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 border-primary bg-primary/5 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">{selectedPlace.name}</h4>
                {selectedPlace.address && (
                  <p className="text-xs text-muted-foreground truncate">{selectedPlace.address}</p>
                )}
              </div>
            </div>
            <button
              onClick={clearPlace}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {(selectedPlace.rating || selectedPlace.reviewCount) && (
            <div className="flex items-center gap-3 pt-1">
              {selectedPlace.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="text-sm font-medium">{selectedPlace.rating.toFixed(1)}</span>
                </div>
              )}
              {selectedPlace.reviewCount && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">{selectedPlace.reviewCount}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={lang === 'pt' ? 'Nome do negócio no Google' : 'Nombre del negocio en Google'}
              value={googleQuery}
              onChange={(e) => handleGoogleSearch(e.target.value)}
              className="pl-10 h-12 text-sm bg-secondary/50"
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg overflow-hidden bg-card shadow-md max-h-56 overflow-y-auto"
            >
              {suggestions.map((s) => (
                <button
                  key={s.placeId}
                  onClick={() => handleSelectPlace(s)}
                  className="w-full p-3 text-left hover:bg-secondary/60 transition-colors border-b border-border/60 last:border-0"
                >
                  <p className="text-sm font-medium text-foreground truncate">{s.mainText || s.description}</p>
                  {s.secondaryText && (
                    <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );

  const externalBlock = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Linkedin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {lang === 'pt' ? 'Site ou LinkedIn' : 'Web o LinkedIn'}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {lang === 'pt' ? 'opcional' : 'opcional'}
        </span>
      </div>
      <div className="relative">
        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          inputMode="text"
          placeholder={lang === 'pt' ? 'tudominio.com ou linkedin.com/in/...' : 'tudominio.com o linkedin.com/in/...'}
          value={webOrLinkedin}
          onChange={(e) => handleExternal(e.target.value)}
          className="pl-10 h-12 text-sm bg-secondary/50"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'pt' ? 'Qual é o nome do seu negócio?' : '¿Cómo se llama tu negocio?'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === 'pt'
            ? 'Podés deixar tudo vazio e seguir — nós completamos depois.'
            : 'Podés dejarlo vacío y avanzar — completamos después.'}
        </p>
      </div>

      {/* Nombre — siempre primero, simple */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder={lang === 'pt' ? 'Nome do seu negócio' : 'Nombre de tu negocio'}
          value={manualName}
          onChange={(e) => handleManualName(e.target.value)}
          className="h-14 text-base bg-secondary/40"
          autoFocus
        />
      </div>

      {/* Bloques en orden según servicio o físico */}
      <div className="space-y-5">
        {isService ? (
          <>
            {externalBlock}
            {googleBlock}
          </>
        ) : (
          <>
            {googleBlock}
            {externalBlock}
          </>
        )}
      </div>

      <p className="text-[11px] text-center text-muted-foreground/70">
        {lang === 'pt'
          ? 'Completá o que quiseres — o sistema descobre o resto.'
          : 'Completá lo que quieras — el sistema descubre el resto.'}
      </p>
    </div>
  );
};
