// Setup Business Types Helper
// Uses the greentech JSON structure for intelligent setup flow

import setupData from './greentech_super_estructura_setup_paises.json';

export interface Country {
  code: string;
  name: string;
  language: string;
}

export interface Area {
  id: string;
  order: number;
  labels_by_country: Record<string, string>;
  default_tags: string[];
}

export interface BusinessType {
  id: string;
  area_id: string;
  labels_by_country: Record<string, string>;
  aliases_by_country: Record<string, string[]>;
  definitions_by_country?: Record<string, string>;
  tags: string[];
  examples?: string[];
}

export type CountryCode = 'AR' | 'UY' | 'BR' | 'CL' | 'CO' | 'EC' | 'MX' | 'CR' | 'PA';

// Get all supported countries
export function getCountries(): Country[] {
  return setupData.countries as Country[];
}

// Get all areas with labels for a specific country
export function getAreas(countryCode: CountryCode): Array<Area & { label: string }> {
  return (setupData.areas as Area[])
    .map(area => ({
      ...area,
      label: area.labels_by_country[countryCode] || area.labels_by_country['AR'] || area.id,
    }))
    .sort((a, b) => a.order - b.order);
}

// Get business types for a specific area and country
export function getBusinessTypes(
  areaId: string,
  countryCode: CountryCode
): Array<BusinessType & { label: string; definition?: string }> {
  return (setupData.business_types as BusinessType[])
    .filter(bt => bt.area_id === areaId)
    .map(bt => ({
      ...bt,
      label: bt.labels_by_country[countryCode] || bt.labels_by_country['AR'] || bt.id,
      definition: bt.definitions_by_country?.[countryCode] || bt.definitions_by_country?.['AR'],
    }));
}

// Normalize text for search (following meta.normalization_rules)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip accents
    .replace(/[^\w\s]/g, '') // Strip punctuation
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
}

// Search business types across all areas with ranking (following meta.search_ranking_rules)
export function searchBusinessTypes(
  query: string,
  countryCode: CountryCode
): Array<BusinessType & { label: string; definition?: string; area: Area & { label: string }; score: number }> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = normalizeText(query);
  const areas = getAreas(countryCode);
  const results: Array<BusinessType & { label: string; definition?: string; area: Area & { label: string }; score: number }> = [];

  for (const area of areas) {
    const businessTypes = getBusinessTypes(area.id, countryCode);

    for (const bt of businessTypes) {
      const normalizedLabel = normalizeText(bt.label);
      const aliases = bt.aliases_by_country[countryCode] || bt.aliases_by_country['AR'] || [];
      const normalizedAliases = aliases.map(normalizeText);

      let score = 0;

      // Ranking rules (higher = better match)
      // 1. Exact match on label
      if (normalizedLabel === normalizedQuery) {
        score = 100;
      }
      // 2. Prefix match on label
      else if (normalizedLabel.startsWith(normalizedQuery)) {
        score = 80;
      }
      // 3. Contains match on label
      else if (normalizedLabel.includes(normalizedQuery)) {
        score = 60;
      }
      // 4. Exact match on alias
      else if (normalizedAliases.some(a => a === normalizedQuery)) {
        score = 50;
      }
      // 5. Prefix match on alias
      else if (normalizedAliases.some(a => a.startsWith(normalizedQuery))) {
        score = 40;
      }
      // 6. Contains match on alias
      else if (normalizedAliases.some(a => a.includes(normalizedQuery))) {
        score = 30;
      }
      // 7. Fuzzy match (query words in label/aliases)
      else {
        const queryWords = normalizedQuery.split(' ');
        const allText = [normalizedLabel, ...normalizedAliases].join(' ');
        const matchedWords = queryWords.filter(w => allText.includes(w));
        if (matchedWords.length > 0) {
          score = 10 + (matchedWords.length / queryWords.length) * 10;
        }
      }

      if (score > 0) {
        results.push({
          ...bt,
          area,
          score,
        });
      }
    }
  }

  // Sort by score descending, then by label alphabetically
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.label.localeCompare(b.label);
  });
}

// Get all business types for a country (flat list)
export function getAllBusinessTypes(
  countryCode: CountryCode
): Array<BusinessType & { label: string; definition?: string; area: Area & { label: string } }> {
  const areas = getAreas(countryCode);
  const results: Array<BusinessType & { label: string; definition?: string; area: Area & { label: string } }> = [];

  for (const area of areas) {
    const businessTypes = getBusinessTypes(area.id, countryCode);
    for (const bt of businessTypes) {
      results.push({
        ...bt,
        area,
      });
    }
  }

  return results.sort((a, b) => a.label.localeCompare(b.label));
}

// Get area by ID
export function getAreaById(areaId: string, countryCode: CountryCode): (Area & { label: string }) | undefined {
  const areas = getAreas(countryCode);
  return areas.find(a => a.id === areaId);
}

// Get business type by ID
export function getBusinessTypeById(
  typeId: string,
  countryCode: CountryCode
): (BusinessType & { label: string; definition?: string; area: Area & { label: string } }) | undefined {
  const allTypes = getAllBusinessTypes(countryCode);
  return allTypes.find(t => t.id === typeId);
}
