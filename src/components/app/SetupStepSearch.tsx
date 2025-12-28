import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, MapPin, Building2, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { CompetitorData, SetupData } from '@/lib/setupSteps';
import { CountryCode } from '@/lib/countryPacks';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SetupStepSearchProps {
  stepId: string;
  countryCode: CountryCode;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precision?: number) => void;
  businessLat?: number;
  businessLng?: number;
  businessType?: string;
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  types: string[];
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  mapsUrl?: string;
}

interface NearbyCompetitor {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  distance?: number;
}

export const SetupStepSearch = ({ 
  stepId, 
  countryCode, 
  data, 
  onUpdate,
  businessLat,
  businessLng,
  businessType
}: SetupStepSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [nearbyResults, setNearbyResults] = useState<NearbyCompetitor[]>([]);
  const [selected, setSelected] = useState<CompetitorData[]>(data.competitors || []);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const debounceRef = useRef<NodeJS.Timeout>();

  const isGoogle = stepId === 'google_business';
  const isCompetitors = stepId === 'competitors';
  const minCompetitors = 1;
  const maxCompetitors = 12;

  // Load nearby competitors when in competitors mode
  useEffect(() => {
    if (isCompetitors && businessLat && businessLng && businessType) {
      loadNearbyCompetitors();
    }
  }, [isCompetitors, businessLat, businessLng, businessType]);

  const loadNearbyCompetitors = async () => {
    if (!businessLat || !businessLng) return;
    
    setLoadingNearby(true);
    setError(null);
    
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('google-nearby-competitors', {
        body: {
          lat: businessLat,
          lng: businessLng,
          businessType: businessType || 'restaurant',
          radiusMeters: 2000,
          excludePlaceId: data.googlePlaceId,
        }
      });

      if (fnError) throw fnError;
      
      if (result?.competitors) {
        setNearbyResults(result.competitors);
      }
    } catch (err) {
      console.error('Error loading nearby competitors:', err);
      setError('No pudimos cargar competidores cercanos. Podés buscar manualmente.');
    } finally {
      setLoadingNearby(false);
    }
  };

  const searchPlaces = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('google-places-autocomplete', {
        body: {
          input,
          country: countryCode,
          sessionToken: sessionTokenRef.current,
        }
      });

      if (fnError) throw fnError;
      
      setPredictions(result?.predictions || []);
    } catch (err) {
      console.error('Error searching places:', err);
      setError('Error buscando lugares');
      setPredictions([]);
    } finally {
      setSearching(false);
    }
  }, [countryCode]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = async (placeId: string) => {
    setSearching(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('google-place-details', {
        body: {
          placeId,
          sessionToken: sessionTokenRef.current,
        }
      });

      if (fnError) throw fnError;

      const place = result?.place as PlaceDetails;
      
      if (place) {
        // Generate new session token for next search
        sessionTokenRef.current = crypto.randomUUID();
        
        if (isGoogle) {
          setSelectedPlace(place);
          onUpdate({ 
            googlePlaceId: place.placeId,
            googleRating: place.rating,
            googleReviewCount: place.reviewCount,
          }, 15);
        } else if (isCompetitors) {
          const competitor: CompetitorData = {
            id: place.placeId,
            name: place.name,
            placeId: place.placeId,
            rating: place.rating,
            reviewCount: place.reviewCount,
            priceLevel: place.priceLevel as 1 | 2 | 3 | 4,
          };
          handleSelectCompetitor(competitor);
        }
        
        setPredictions([]);
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      setError('Error obteniendo detalles del lugar');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCompetitor = (competitor: CompetitorData) => {
    const isSelected = selected.some(c => c.id === competitor.id);
    let updated: CompetitorData[];
    
    if (isSelected) {
      updated = selected.filter(c => c.id !== competitor.id);
    } else if (selected.length < maxCompetitors) {
      updated = [...selected, competitor];
    } else {
      return;
    }
    
    setSelected(updated);
    onUpdate({ competitors: updated }, isSelected ? -2 : 3);
  };

  const handleNearbySelect = (nearby: NearbyCompetitor) => {
    const competitor: CompetitorData = {
      id: nearby.placeId,
      name: nearby.name,
      placeId: nearby.placeId,
      rating: nearby.rating,
      reviewCount: nearby.reviewCount,
      priceLevel: nearby.priceLevel as 1 | 2 | 3 | 4,
    };
    handleSelectCompetitor(competitor);
  };

  const clearGoogleSelection = () => {
    setSelectedPlace(null);
    onUpdate({ 
      googlePlaceId: undefined,
      googleRating: undefined,
      googleReviewCount: undefined,
    }, -15);
  };

  const isValidSelection = isCompetitors 
    ? selected.length >= minCompetitors && selected.length <= maxCompetitors
    : !!data.googlePlaceId;

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Selected Google Business */}
      {isGoogle && selectedPlace && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{selectedPlace.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
              {selectedPlace.rating && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{selectedPlace.rating}</span>
                  <span className="text-muted-foreground">({selectedPlace.reviewCount} reseñas)</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={clearGoogleSelection}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search input - only show if not selected (for Google) */}
      {(!isGoogle || !selectedPlace) && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isGoogle ? "Buscá tu negocio en Google..." : "Buscá más competidores..."}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Autocomplete predictions */}
      {predictions.length > 0 && (
        <div className="border rounded-xl overflow-hidden bg-card">
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              onClick={() => selectPlace(prediction.placeId)}
              className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground block truncate">{prediction.mainText}</span>
                  <span className="text-sm text-muted-foreground truncate block">{prediction.secondaryText}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Status for competitors */}
      {isCompetitors && (
        <div className={cn(
          "p-3 rounded-xl border",
          isValidSelection 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-amber-500/10 border-amber-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selected.length} de {minCompetitors}-{maxCompetitors} competidores
            </span>
            {isValidSelection && <Check className="w-4 h-4 text-emerald-500" />}
          </div>
        </div>
      )}

      {/* Selected competitors badges */}
      {isCompetitors && selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(comp => (
            <Badge 
              key={comp.id} 
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => handleSelectCompetitor(comp)}
            >
              {comp.name}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Nearby competitors (auto-loaded) */}
      {isCompetitors && (
        <div className="space-y-2">
          {loadingNearby ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Buscando competidores cercanos...</span>
            </div>
          ) : nearbyResults.length > 0 ? (
            <>
              <p className="text-sm font-medium text-foreground">Competidores cercanos sugeridos:</p>
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {nearbyResults.map((result) => {
                    const isSelected = selected.some(c => c.id === result.placeId);
                    
                    return (
                      <button
                        key={result.placeId}
                        onClick={() => handleNearbySelect(result)}
                        disabled={isSelected || selected.length >= maxCompetitors}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all",
                          isSelected 
                            ? "bg-primary/10 border-primary" 
                            : "bg-card border-border hover:border-primary/50",
                          selected.length >= maxCompetitors && !isSelected && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium truncate">{result.name}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              {result.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  {result.rating}
                                </span>
                              )}
                              {result.reviewCount && (
                                <span>{result.reviewCount} reseñas</span>
                              )}
                              {result.priceLevel && (
                                <span>{'$'.repeat(result.priceLevel)}</span>
                              )}
                              {result.distance && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {result.distance < 1 
                                    ? `${Math.round(result.distance * 1000)}m`
                                    : `${result.distance.toFixed(1)}km`
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          ) : !loadingNearby && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Buscá competidores en tu zona usando el buscador</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state for Google search */}
      {isGoogle && !selectedPlace && predictions.length === 0 && !searching && searchQuery.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Escribí el nombre de tu negocio para encontrarlo en Google</p>
          <p className="text-xs mt-1">Esto nos permite conectar tus reseñas y rating real</p>
        </div>
      )}

      {/* Skip option for Google */}
      {isGoogle && !selectedPlace && (
        <button
          onClick={() => onUpdate({ googlePlaceId: 'skip' }, 0)}
          className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          No encuentro mi negocio / Agregar después
        </button>
      )}
    </div>
  );
};
