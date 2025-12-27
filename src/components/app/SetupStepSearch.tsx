import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, MapPin, Building2, Check, X, Loader2 } from 'lucide-react';
import { CompetitorData, SetupData } from '@/lib/setupSteps';
import { CountryCode } from '@/lib/countryPacks';
import { cn } from '@/lib/utils';

interface SetupStepSearchProps {
  stepId: string;
  countryCode: CountryCode;
  data: Partial<SetupData>;
  onUpdate: (data: Partial<SetupData>, precision?: number) => void;
}

// Mock data for competitors (would come from Google Places API)
const MOCK_COMPETITORS: CompetitorData[] = [
  { id: '1', name: 'Café del Centro', rating: 4.2, reviewCount: 156, priceLevel: 2 },
  { id: '2', name: 'La Biela', rating: 4.5, reviewCount: 892, priceLevel: 3 },
  { id: '3', name: 'Starbucks Obelisco', rating: 4.0, reviewCount: 245, priceLevel: 2 },
  { id: '4', name: 'Havanna Café', rating: 4.3, reviewCount: 432, priceLevel: 2 },
  { id: '5', name: 'Le Pain Quotidien', rating: 4.4, reviewCount: 678, priceLevel: 3 },
  { id: '6', name: 'Café Tortoni', rating: 4.1, reviewCount: 2145, priceLevel: 2 },
  { id: '7', name: 'The Coffee Store', rating: 4.0, reviewCount: 189, priceLevel: 2 },
  { id: '8', name: 'Café Martínez', rating: 4.2, reviewCount: 321, priceLevel: 2 },
];

export const SetupStepSearch = ({ stepId, countryCode, data, onUpdate }: SetupStepSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CompetitorData[]>([]);
  const [selected, setSelected] = useState<CompetitorData[]>(data.competitors || []);

  const isGoogle = stepId === 'S15';
  const isCompetitors = stepId === 'S16';
  const minCompetitors = 5;
  const maxCompetitors = 12;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter mock results based on query
    const results = MOCK_COMPETITORS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results.length > 0 ? results : MOCK_COMPETITORS.slice(0, 5));
    setSearching(false);
  };

  const handleSelect = (competitor: CompetitorData) => {
    if (isGoogle) {
      // For Google, only one selection
      onUpdate({ 
        googlePlaceId: competitor.id,
        googleRating: competitor.rating,
        googleReviewCount: competitor.reviewCount,
      }, 10);
      return;
    }

    // For competitors, toggle selection
    const isSelected = selected.some(c => c.id === competitor.id);
    let updated: CompetitorData[];
    
    if (isSelected) {
      updated = selected.filter(c => c.id !== competitor.id);
    } else if (selected.length < maxCompetitors) {
      updated = [...selected, competitor];
    } else {
      return; // Max reached
    }
    
    setSelected(updated);
    onUpdate({ competitors: updated }, isSelected ? -2 : 3);
  };

  const isValidSelection = isCompetitors 
    ? selected.length >= minCompetitors && selected.length <= maxCompetitors
    : !!data.googlePlaceId;

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isGoogle ? "Buscá tu negocio en Google..." : "Buscá competidores cercanos..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </Button>
      </div>

      {/* Status */}
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

      {isGoogle && data.googlePlaceId && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-sm">Conectado a Google Business</span>
          </div>
        </div>
      )}

      {/* Selected competitors */}
      {isCompetitors && selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(comp => (
            <Badge 
              key={comp.id} 
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => handleSelect(comp)}
            >
              {comp.name}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Search results */}
      <ScrollArea className="h-64">
        <div className="space-y-2 pr-4">
          {searchResults.map((result) => {
            const isSelected = selected.some(c => c.id === result.id) || 
              (isGoogle && data.googlePlaceId === result.id);
            
            return (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  isSelected 
                    ? "bg-primary/10 border-primary" 
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {result.rating}
                      </span>
                      <span>{result.reviewCount} reseñas</span>
                      <span>{'$'.repeat(result.priceLevel || 2)}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}

          {searchResults.length === 0 && !searching && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {isGoogle 
                  ? 'Buscá tu negocio para conectar reseñas' 
                  : 'Buscá competidores en tu zona'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
