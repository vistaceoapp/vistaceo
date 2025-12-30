// Step: Business Name + Google Search (Combined)
import { motion } from 'framer-motion';
import { MapPin, Star, MessageSquare, Search, X, Check, Loader2, Building2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
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
  }) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

export const SetupStepBusiness = ({ 
  countryCode, 
  currentName,
  currentPlaceId,
  onUpdate 
}: SetupStepBusinessProps) => {
  const [search, setSearch] = useState(currentName || '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceData | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const sessionTokenRef = useRef(crypto.randomUUID());

  // If we have a current name but no placeId, we're in manual mode
  useEffect(() => {
    if (currentName && !currentPlaceId) {
      setManualMode(true);
    }
  }, [currentName, currentPlaceId]);

  const handleSearch = async (query: string) => {
    setSearch(query);
    
    // Update parent with manual name if in manual mode
    if (manualMode) {
      onUpdate({ businessName: query });
      return;
    }
    
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

        if (!error && data?.predictions) {
          setSuggestions(data.predictions);
        }
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
        body: {
          placeId: prediction.place_id,
          sessionToken: sessionTokenRef.current,
        },
      });

      if (!error && data?.place) {
        const place = data.place;
        const placeData: GooglePlaceData = {
          placeId: prediction.place_id,
          name: place.displayName?.text || prediction.structured_formatting?.main_text || '',
          address: place.formattedAddress,
          rating: place.rating,
          reviewCount: place.userRatingCount,
          lat: place.location?.latitude,
          lng: place.location?.longitude,
        };
        setSelectedPlace(placeData);
        setSearch(placeData.name);
        sessionTokenRef.current = crypto.randomUUID();
        
        // Update parent immediately
        onUpdate({
          businessName: placeData.name,
          googlePlaceId: placeData.placeId,
          googleRating: placeData.rating,
          googleReviewCount: placeData.reviewCount,
          googleAddress: placeData.address,
          googleLat: placeData.lat,
          googleLng: placeData.lng,
        });
      }
    } catch (err) {
      console.error('Place details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedPlace(null);
    setSearch('');
    setManualMode(false);
    onUpdate({ businessName: '' });
  };

  const handleManualMode = () => {
    setManualMode(true);
    setSuggestions([]);
    // Keep current search as manual name
    onUpdate({ businessName: search });
  };

  const lang = countryCode === 'BR' ? 'pt' : 'es';

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'pt' ? 'Qual é o nome do seu negócio?' : '¿Cómo se llama tu negocio?'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'pt' 
            ? 'Busque no Google ou digite manualmente'
            : 'Buscalo en Google o ingresalo manualmente'
          }
        </p>
      </div>

      {selectedPlace ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border-2 border-primary bg-primary/5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{selectedPlace.name}</h3>
                {selectedPlace.address && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{selectedPlace.address}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {(selectedPlace.rating || selectedPlace.reviewCount) && (
            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              {selectedPlace.rating && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <span className="font-semibold text-foreground">{selectedPlace.rating.toFixed(1)}</span>
                </div>
              )}
              {selectedPlace.reviewCount && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{selectedPlace.reviewCount} {lang === 'pt' ? 'avaliações' : 'reseñas'}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : manualMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={lang === 'pt' ? 'Nome do seu negócio' : 'Nombre de tu negocio'}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-base bg-secondary/50"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              setManualMode(false);
              setSearch('');
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            {lang === 'pt' ? 'Buscar no Google' : 'Buscar en Google'}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={lang === 'pt' ? 'Buscar seu negócio no Google...' : 'Buscar tu negocio en Google...'}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-base bg-secondary/50"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            )}
          </div>

          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl overflow-hidden bg-card shadow-lg max-h-[300px] overflow-y-auto"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSelectPlace(suggestion)}
                  className="w-full p-4 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                >
                  <p className="font-medium text-foreground">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  {suggestion.structured_formatting?.secondary_text && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {search.length >= 2 && suggestions.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <p className="text-sm text-muted-foreground mb-3">
                {lang === 'pt' ? 'Não encontrou?' : '¿No lo encontrás?'}
              </p>
              <Button variant="outline" onClick={handleManualMode} size="sm">
                <Pencil className="w-4 h-4 mr-2" />
                {lang === 'pt' ? 'Digitar manualmente' : 'Ingresar manualmente'}
              </Button>
            </motion.div>
          )}

          <div className="text-center pt-2">
            <button
              onClick={handleManualMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {lang === 'pt' ? 'Digitar o nome manualmente' : 'Ingresar el nombre manualmente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
