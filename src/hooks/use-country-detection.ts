import { useState, useEffect } from "react";
import type { CountryCode } from "@/lib/countryPacks";

interface CountryInfo {
  code: CountryCode | "DEFAULT";
  currency: string;
  symbol: string;
  paymentProvider: "mercadopago" | "paypal";
  prices: {
    monthly: number;
    yearly: number;
  };
  flag: string;
  locale: string;
  name: string;
}

// Countries supported in the system (Spanish-speaking LATAM only)
// Ordered alphabetically for UI consistency
const COUNTRY_CONFIG: Record<string, CountryInfo> = {
  // Argentina - MercadoPago (único país que paga en moneda local)
  AR: {
    code: "AR",
    currency: "ARS",
    symbol: "$",
    paymentProvider: "mercadopago",
    prices: { monthly: 29990, yearly: 299900 },
    flag: "🇦🇷",
    locale: "es-AR",
    name: "Argentina",
  },
  // Chile - PayPal (muestra CLP, paga USD)
  CL: {
    code: "CL",
    currency: "CLP",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 24990, yearly: 249900 },
    flag: "🇨🇱",
    locale: "es-CL",
    name: "Chile",
  },
  // Colombia - PayPal (muestra COP, paga USD)
  CO: {
    code: "CO",
    currency: "COP",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 119900, yearly: 1199000 },
    flag: "🇨🇴",
    locale: "es-CO",
    name: "Colombia",
  },
  // Costa Rica - PayPal (muestra CRC, paga USD)
  CR: {
    code: "CR",
    currency: "CRC",
    symbol: "₡",
    paymentProvider: "paypal",
    prices: { monthly: 14990, yearly: 149900 },
    flag: "🇨🇷",
    locale: "es-CR",
    name: "Costa Rica",
  },
  // Ecuador - USD (dolarizado)
  EC: {
    code: "EC",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🇪🇨",
    locale: "es-EC",
    name: "Ecuador",
  },
  // México - PayPal (muestra MXN, paga USD)
  MX: {
    code: "MX",
    currency: "MXN",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 499, yearly: 4990 },
    flag: "🇲🇽",
    locale: "es-MX",
    name: "México",
  },
  // Panamá - USD (dolarizado)
  PA: {
    code: "PA",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🇵🇦",
    locale: "es-PA",
    name: "Panamá",
  },
  // Paraguay - PayPal (muestra PYG, paga USD)
  PY: {
    code: "PY",
    currency: "PYG",
    symbol: "₲",
    paymentProvider: "paypal",
    prices: { monthly: 219900, yearly: 2199000 },
    flag: "🇵🇾",
    locale: "es-PY",
    name: "Paraguay",
  },
  // Uruguay - PayPal (muestra UYU, paga USD)
  UY: {
    code: "UY",
    currency: "UYU",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 1190, yearly: 11900 },
    flag: "🇺🇾",
    locale: "es-UY",
    name: "Uruguay",
  },
  // Default fallback - Argentina
  DEFAULT: {
    code: "DEFAULT",
    currency: "ARS",
    symbol: "$",
    paymentProvider: "mercadopago",
    prices: { monthly: 29990, yearly: 299900 },
    flag: "🇦🇷",
    locale: "es-AR",
    name: "Argentina",
  },
};

// Supported country codes for validation
const SUPPORTED_COUNTRY_CODES: CountryCode[] = ['AR', 'CL', 'CO', 'CR', 'EC', 'MX', 'PA', 'PY', 'UY'];

// Free IP Geolocation API
const GEOLOCATION_API = "https://ipapi.co/json/";

export const useCountryDetection = (overrideCountryCode?: CountryCode | null) => {
  const [country, setCountry] = useState<CountryInfo>(COUNTRY_CONFIG.DEFAULT);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedCountryCode, setDetectedCountryCode] = useState<CountryCode | null>(null);

  // Check for manual override from localStorage (set during setup)
  const getStoredCountry = (): CountryCode | null => {
    const stored = localStorage.getItem('selectedCountryCode');
    if (stored && SUPPORTED_COUNTRY_CODES.includes(stored as CountryCode)) {
      return stored as CountryCode;
    }
    return null;
  };

  useEffect(() => {
    // If override is provided (e.g., from setup), use it immediately
    if (overrideCountryCode && COUNTRY_CONFIG[overrideCountryCode]) {
      setCountry(COUNTRY_CONFIG[overrideCountryCode]);
      setDetectedCountryCode(overrideCountryCode);
      setIsDetecting(false);
      return;
    }

    // Check localStorage for manual selection first
    const storedCountry = getStoredCountry();
    if (storedCountry) {
      setCountry(COUNTRY_CONFIG[storedCountry]);
      setDetectedCountryCode(storedCountry);
      setIsDetecting(false);
      return;
    }

    const detectCountry = async () => {
      try {
        // Try IP-based geolocation first
        const response = await fetch(GEOLOCATION_API, {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code || data.country;
          
          if (countryCode && COUNTRY_CONFIG[countryCode]) {
            setCountry(COUNTRY_CONFIG[countryCode]);
            setDetectedCountryCode(countryCode as CountryCode);
            setIsDetecting(false);
            return;
          }
        }
      } catch (error) {
        console.log("IP detection failed, falling back to browser language");
      }

      // Fallback to browser language detection
      try {
        const lang = navigator.language || "";
        const langParts = lang.split("-");
        const countryFromLang = langParts[1]?.toUpperCase();
        
        if (countryFromLang && COUNTRY_CONFIG[countryFromLang]) {
          setCountry(COUNTRY_CONFIG[countryFromLang]);
          setDetectedCountryCode(countryFromLang as CountryCode);
        } else if (lang.startsWith("es")) {
          // Default Spanish speakers to Argentina
          setCountry(COUNTRY_CONFIG.AR);
          setDetectedCountryCode("AR");
        } else {
          // Default to Argentina for unsupported regions
          setCountry(COUNTRY_CONFIG.AR);
          setDetectedCountryCode("AR");
        }
      } catch (error) {
        console.error("Error detecting country:", error);
        setCountry(COUNTRY_CONFIG.AR);
        setDetectedCountryCode("AR");
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, [overrideCountryCode]);

  // Function to manually set/override the country (saves to localStorage)
  const setCountryOverride = (code: CountryCode) => {
    if (COUNTRY_CONFIG[code]) {
      localStorage.setItem('selectedCountryCode', code);
      setCountry(COUNTRY_CONFIG[code]);
      setDetectedCountryCode(code);
    }
  };

  // Clear the manual override
  const clearCountryOverride = () => {
    localStorage.removeItem('selectedCountryCode');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(country.locale, {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat(country.locale, {
      style: "currency",
      currency: country.currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCurrencyShort = (price: number) => {
    const formatted = formatPrice(price);
    return `${country.symbol}${formatted}`;
  };

  // Calculate savings for yearly plan
  const yearlySavings = () => {
    const monthlyTotal = country.prices.monthly * 12;
    const saved = monthlyTotal - country.prices.yearly;
    return {
      amount: saved,
      percentage: Math.round((saved / monthlyTotal) * 100),
    };
  };

  // Get country info by code
  const getCountryByCode = (code: CountryCode): CountryInfo => {
    return COUNTRY_CONFIG[code] || COUNTRY_CONFIG.AR;
  };

  // Check if detected country is supported
  const isSupportedCountry = (code: string): code is CountryCode => {
    return SUPPORTED_COUNTRY_CODES.includes(code as CountryCode);
  };

  return {
    country,
    isDetecting,
    detectedCountryCode,
    formatPrice,
    formatCurrency,
    formatCurrencyShort,
    yearlySavings,
    isArgentina: country.code === "AR",
    monthlyPrice: country.prices.monthly,
    yearlyPrice: country.prices.yearly,
    getCountryByCode,
    isSupportedCountry,
    setCountryOverride,
    clearCountryOverride,
    SUPPORTED_COUNTRY_CODES,
  };
};

// Export the config for use in other components
export { COUNTRY_CONFIG, SUPPORTED_COUNTRY_CODES };
export type { CountryInfo };
