import { useState, useEffect } from "react";

interface CountryInfo {
  code: "AR" | "MX" | "CL" | "CO" | "PE" | "UY" | "BR" | "EC" | "DEFAULT";
  currency: "ARS" | "USD";
  symbol: string;
  paymentProvider: "mercadopago" | "paypal";
  prices: {
    monthly: number;
    yearly: number;
  };
  flag: string;
}

const COUNTRY_CONFIG: Record<string, CountryInfo> = {
  AR: {
    code: "AR",
    currency: "ARS",
    symbol: "$",
    paymentProvider: "mercadopago",
    prices: { monthly: 29500, yearly: 295000 },
    flag: "🇦🇷",
  },
  DEFAULT: {
    code: "DEFAULT",
    currency: "USD",
    symbol: "$",
    paymentProvider: "paypal",
    prices: { monthly: 29, yearly: 290 },
    flag: "🌎",
  },
};

export const useCountryDetection = () => {
  const [country, setCountry] = useState<CountryInfo>(COUNTRY_CONFIG.DEFAULT);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectCountry = () => {
      try {
        // Try to detect from browser language first
        const lang = navigator.language || "";
        
        // Check for Argentina specifically
        if (lang === "es-AR" || lang.includes("AR")) {
          setCountry(COUNTRY_CONFIG.AR);
        } else {
          // Default to USD for all other countries
          setCountry(COUNTRY_CONFIG.DEFAULT);
        }
      } catch (error) {
        console.error("Error detecting country:", error);
        setCountry(COUNTRY_CONFIG.DEFAULT);
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, []);

  const formatPrice = (price: number) => {
    if (country.currency === "ARS") {
      return new Intl.NumberFormat('es-AR', {
        style: 'decimal',
        maximumFractionDigits: 0,
      }).format(price);
    }
    return price.toString();
  };

  const formatCurrency = (price: number) => {
    if (country.currency === "ARS") {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return {
    country,
    isDetecting,
    formatPrice,
    formatCurrency,
    isArgentina: country.code === "AR",
  };
};
