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
// All prices are rounded to attractive numbers for each market
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
  },
  // Perú - PayPal (muestra PEN, paga USD)
  PE: {
    code: "PE",
    currency: "PEN",
    symbol: "S/",
    paymentProvider: "paypal",
    prices: { monthly: 109, yearly: 1090 },
    flag: "🇵🇪",
    locale: "es-PE",
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
  },
  // Brasil - PayPal (muestra BRL, paga USD)
  BR: {
    code: "BR",
    currency: "BRL",
    symbol: "R$",
    paymentProvider: "paypal",
    prices: { monthly: 149, yearly: 1490 },
    flag: "🇧🇷",
    locale: "pt-BR",
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
  },
  // España - PayPal (muestra EUR, paga USD)
  ES: {
    code: "ES",
    currency: "EUR",
    symbol: "€",
    paymentProvider: "paypal",
    prices: { monthly: 27, yearly: 270 },
    flag: "🇪🇸",
    locale: "es-ES",
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
  },
  // Bolivia - PayPal (muestra BOB, paga USD)
  BO: {
    code: "BO",
    currency: "BOB",
    symbol: "Bs",
    paymentProvider: "paypal",
    prices: { monthly: 199, yearly: 1990 },
    flag: "🇧🇴",
    locale: "es-BO",
  },
  // Venezuela - USD (economía dolarizada de facto)
  VE: {
    code: "VE",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🇻🇪",
    locale: "es-VE",
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
  },
  // Guatemala - PayPal (muestra GTQ, paga USD)
  GT: {
    code: "GT",
    currency: "GTQ",
    symbol: "Q",
    paymentProvider: "paypal",
    prices: { monthly: 229, yearly: 2290 },
    flag: "🇬🇹",
    locale: "es-GT",
  },
  // República Dominicana - PayPal (muestra DOP, paga USD)
  DO: {
    code: "DO",
    currency: "DOP",
    symbol: "RD$",
    paymentProvider: "paypal",
    prices: { monthly: 1690, yearly: 16900 },
    flag: "🇩🇴",
    locale: "es-DO",
  },
  // Honduras - PayPal (muestra HNL, paga USD)
  HN: {
    code: "HN",
    currency: "HNL",
    symbol: "L",
    paymentProvider: "paypal",
    prices: { monthly: 719, yearly: 7190 },
    flag: "🇭🇳",
    locale: "es-HN",
  },
  // El Salvador - USD (dolarizado)
  SV: {
    code: "SV",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🇸🇻",
    locale: "es-SV",
  },
  // Nicaragua - PayPal (muestra NIO, paga USD)
  NI: {
    code: "NI",
    currency: "NIO",
    symbol: "C$",
    paymentProvider: "paypal",
    prices: { monthly: 1090, yearly: 10900 },
    flag: "🇳🇮",
    locale: "es-NI",
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
