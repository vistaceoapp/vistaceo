import { useState, useEffect } from "react";

interface CountryInfo {
  code: string;
  currency: string;
  symbol: string;
  paymentProvider: "mercadopago" | "paypal";
  prices: {
    monthly: number;
    yearly: number;
  };
  flag: string;
  locale: string;
}

// Comprehensive country configuration with local currencies
const COUNTRY_CONFIG: Record<string, CountryInfo> = {
  // Latin America - MercadoPago
  AR: {
    code: "AR",
    currency: "ARS",
    symbol: "$",
    paymentProvider: "mercadopago",
    prices: { monthly: 29500, yearly: 295000 },
    flag: "🇦🇷",
    locale: "es-AR",
  },
  MX: {
    code: "MX",
    currency: "MXN",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 499, yearly: 4990 },
    flag: "🇲🇽",
    locale: "es-MX",
  },
  CL: {
    code: "CL",
    currency: "CLP",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 24900, yearly: 249000 },
    flag: "🇨🇱",
    locale: "es-CL",
  },
  CO: {
    code: "CO",
    currency: "COP",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 119000, yearly: 1190000 },
    flag: "🇨🇴",
    locale: "es-CO",
  },
  PE: {
    code: "PE",
    currency: "PEN",
    symbol: "S/",
    paymentProvider: "paypal",
    prices: { monthly: 109, yearly: 1090 },
    flag: "🇵🇪",
    locale: "es-PE",
  },
  UY: {
    code: "UY",
    currency: "UYU",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 1190, yearly: 11900 },
    flag: "🇺🇾",
    locale: "es-UY",
  },
  BR: {
    code: "BR",
    currency: "BRL",
    symbol: "R$",
    paymentProvider: "paypal",
    prices: { monthly: 149, yearly: 1490 },
    flag: "🇧🇷",
    locale: "pt-BR",
  },
  EC: {
    code: "EC",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🇪🇨",
    locale: "es-EC",
  },
  // Europe
  ES: {
    code: "ES",
    currency: "EUR",
    symbol: "€",
    paymentProvider: "paypal",
    prices: { monthly: 27, yearly: 270 },
    flag: "🇪🇸",
    locale: "es-ES",
  },
  // Default - USD
  DEFAULT: {
    code: "DEFAULT",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🌎",
    locale: "en-US",
  },
};

// Free IP Geolocation API
const GEOLOCATION_API = "https://ipapi.co/json/";

export const useCountryDetection = () => {
  const [country, setCountry] = useState<CountryInfo>(COUNTRY_CONFIG.DEFAULT);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedCountryCode, setDetectedCountryCode] = useState<string>("DEFAULT");

  useEffect(() => {
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
            setDetectedCountryCode(countryCode);
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
          setDetectedCountryCode(countryFromLang);
        } else if (lang.startsWith("es")) {
          // Default Spanish speakers to Argentina
          setCountry(COUNTRY_CONFIG.AR);
          setDetectedCountryCode("AR");
        } else if (lang.startsWith("pt")) {
          // Default Portuguese speakers to Brazil
          setCountry(COUNTRY_CONFIG.BR);
          setDetectedCountryCode("BR");
        } else {
          setCountry(COUNTRY_CONFIG.DEFAULT);
          setDetectedCountryCode("DEFAULT");
        }
      } catch (error) {
        console.error("Error detecting country:", error);
        setCountry(COUNTRY_CONFIG.DEFAULT);
        setDetectedCountryCode("DEFAULT");
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, []);

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
    return `${country.symbol} ${formatted}`;
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
  };
};
