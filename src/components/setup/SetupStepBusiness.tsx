// Step: Business Name — adapta el tono según servicio/profesión vs negocio físico
import { motion } from 'framer-motion';
import { MapPin, Star, MessageSquare, Search, X, Loader2, Building2, Globe, Linkedin, User } from 'lucide-react';
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

// Áreas de servicio/profesión — el nombre del profesional o servicio es lo principal
const SERVICE_AREAS = new Set([
  'A5_TECH', 'A6_B2B', 'A7_HOGAR_SERV', 'A11_FINANZAS', 'A12_LEGAL',
  'A13_CREATIVO', 'A14_TURISMO', 'A19_SOCIAL', 'A20_FREELANCE',
]);

// Logo oficial de Google (G a color) en SVG inline
const GoogleGlyph = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

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

  // ===== Copy adaptado por tipo (servicio/profesión vs negocio físico) y lang =====
  const copy = isService
    ? {
        title: lang === 'pt'
          ? '¿Cuál es el nombre de tu servicio o profesión?'
          : '¿Cuál es el nombre de tu servicio o profesión?',
        subtitle: lang === 'pt'
          ? 'Indica tu nombre profesional, marca o nombre del servicio. Es el dato principal para personalizar la plataforma.'
          : 'Indica tu nombre profesional, marca o nombre del servicio. Es el dato principal para personalizar la plataforma.',
        nameLabel: lang === 'pt'
          ? 'Nombre profesional o del servicio'
          : 'Nombre profesional o del servicio',
        namePlaceholder: lang === 'pt'
          ? 'Ej: Dra. Ana Pérez · Estudio Jurídico Pérez'
          : 'Ej: Dra. Ana Pérez · Estudio Jurídico Pérez',
        reassurance: lang === 'pt'
          ? 'Puedes corregirlo o ampliarlo más adelante. Solo necesitamos un nombre para empezar.'
          : 'Puedes corregirlo o ampliarlo más adelante. Solo necesitamos un nombre para empezar.',
        icon: User,
      }
    : {
        title: lang === 'pt'
          ? '¿Cómo se llama tu negocio?'
          : '¿Cómo se llama tu negocio?',
        subtitle: lang === 'pt'
          ? 'Si tienes un local físico, lo más rápido es buscarlo en Google Maps.'
          : 'Si tienes un local físico, lo más rápido es buscarlo en Google Maps.',
        nameLabel: lang === 'pt'
          ? 'Nombre del negocio'
          : 'Nombre del negocio',
        namePlaceholder: lang === 'pt'
          ? 'Nombre del negocio'
          : 'Nombre del negocio',
        reassurance: lang === 'pt'
          ? 'No te preocupes si lo escribes con errores: podrás corregirlo después.'
          : 'No te preocupes si lo escribes con errores: podrás corregirlo después.',
        icon: Building2,
      };

  const TitleIcon = copy.icon;

  // ===== Bloques =====
  const googleBlock = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GoogleGlyph className="w-5 h-5" />
        <h3 className="text-sm font-semibold text-foreground">
          {isService
            ? 'Buscar en Google Maps (si tienes ficha)'
            : 'Buscar en Google Maps'}
        </h3>
        {isService && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
            opcional
          </span>
        )}
        {!isService && (
          <span className="text-[10px] uppercase tracking-wide text-primary/80 font-semibold">
            recomendado
          </span>
        )}
      </div>

      {selectedPlace ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 border-primary bg-primary/5 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 shadow-sm">
                <GoogleGlyph className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">{selectedPlace.name}</h4>
                {selectedPlace.address && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedPlace.address}
                  </p>
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
              placeholder="Escribe el nombre tal como aparece en Google Maps"
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
                  className="w-full p-3 text-left hover:bg-secondary/60 transition-colors border-b border-border/60 last:border-0 flex items-start gap-2"
                >
                  <GoogleGlyph className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.mainText || s.description}</p>
                    {s.secondaryText && (
                      <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
                    )}
                  </div>
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
          Web o LinkedIn
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          opcional
        </span>
      </div>
      <div className="relative">
        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          inputMode="text"
          placeholder="tudominio.com o linkedin.com/in/..."
          value={webOrLinkedin}
          onChange={(e) => handleExternal(e.target.value)}
          className="pl-10 h-12 text-sm bg-secondary/50"
        />
      </div>
    </div>
  );

  // Para servicios/profesiones el nombre es obligatorio (sin "(opcional)").
  // Para físico, el nombre manual es opcional si se selecciona ficha de Google.
  const nameIsRequired = isService;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <TitleIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {copy.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      {/* Nombre — obligatorio para servicio/profesión */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground/80 flex items-center gap-2">
          {copy.nameLabel}
          {nameIsRequired && <span className="text-destructive">*</span>}
        </label>
        <Input
          type="text"
          placeholder={copy.namePlaceholder}
          value={manualName}
          onChange={(e) => handleManualName(e.target.value)}
          className="h-14 text-base bg-secondary/40"
          autoFocus
        />
      </div>

      {/* Bloques: físico → Google primero; servicio → Web/LinkedIn primero */}
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

      <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
        <p className="text-[12px] text-center text-muted-foreground leading-relaxed">
          {copy.reassurance}
        </p>
      </div>
    </div>
  );
};
