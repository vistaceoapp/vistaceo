/**
 * Centralized Pricing Configuration
 * 
 * RULES:
 * - Argentina (AR): Shows and pays in ARS via MercadoPago
 * - All other countries: Show local currency, pay in USD via PayPal
 */

import type { CountryCode } from "./countryPacks";

// USD base prices
export const USD_PRICES = {
  monthly: 29,
  yearly: 290,
} as const;

// Local prices for display (will convert to USD for payment, except Argentina)
export const LOCAL_PRICES: Record<CountryCode | "DEFAULT", {
  monthly: number;
  yearly: number;
  currency: string;
  symbol: string;
}> = {
  // Argentina - pays in ARS
  AR: {
    monthly: 29990,
    yearly: 299900,
    currency: "ARS",
    symbol: "$",
  },
  // Chile - displays CLP, pays USD
  CL: {
    monthly: 24990,
    yearly: 249900,
    currency: "CLP",
    symbol: "$",
  },
  // Colombia - displays COP, pays USD
  CO: {
    monthly: 119900,
    yearly: 1199000,
    currency: "COP",
    symbol: "$",
  },
  // Costa Rica - displays CRC, pays USD
  CR: {
    monthly: 14990,
    yearly: 149900,
    currency: "CRC",
    symbol: "₡",
  },
  // Ecuador - USD (dollarized)
  EC: {
    monthly: 29,
    yearly: 290,
    currency: "USD",
    symbol: "$",
  },
  // México - displays MXN, pays USD
  MX: {
    monthly: 499,
    yearly: 4990,
    currency: "MXN",
    symbol: "$",
  },
  // Panamá - USD (dollarized)
  PA: {
    monthly: 29,
    yearly: 290,
    currency: "USD",
    symbol: "$",
  },
  // Paraguay - displays PYG, pays USD
  PY: {
    monthly: 219900,
    yearly: 2199000,
    currency: "PYG",
    symbol: "₲",
  },
  // Uruguay - displays UYU, pays USD
  UY: {
    monthly: 1190,
    yearly: 11900,
    currency: "UYU",
    symbol: "$",
  },
  // Default fallback
  DEFAULT: {
    monthly: 29990,
    yearly: 299900,
    currency: "ARS",
    symbol: "$",
  },
};

// Countries that pay in USD (all except AR)
export const USD_PAYMENT_COUNTRIES: CountryCode[] = ['CL', 'CO', 'CR', 'EC', 'MX', 'PA', 'PY', 'UY'];

// Check if a country pays in USD
export const paysInUSD = (countryCode: string): boolean => {
  return countryCode !== 'AR';
};

// Get payment provider for a country
export const getPaymentProvider = (countryCode: string): 'mercadopago' | 'paypal' => {
  return countryCode === 'AR' ? 'mercadopago' : 'paypal';
};

// Format price for display
export const formatLocalPrice = (amount: number, currency: string, locale: string): string => {
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get pricing info for a country
export interface PricingInfo {
  localMonthly: number;
  localYearly: number;
  localCurrency: string;
  localSymbol: string;
  usdMonthly: number;
  usdYearly: number;
  paysInUSD: boolean;
  paymentProvider: 'mercadopago' | 'paypal';
  yearlySavingsPercent: number;
}

export const getPricingInfo = (countryCode: CountryCode | "DEFAULT"): PricingInfo => {
  const localPrices = LOCAL_PRICES[countryCode] || LOCAL_PRICES.DEFAULT;
  const isUSD = paysInUSD(countryCode);
  
  // Calculate yearly savings (monthly * 12 - yearly)
  const monthlyTotal = localPrices.monthly * 12;
  const savedAmount = monthlyTotal - localPrices.yearly;
  const savingsPercent = Math.round((savedAmount / monthlyTotal) * 100);
  
  return {
    localMonthly: localPrices.monthly,
    localYearly: localPrices.yearly,
    localCurrency: localPrices.currency,
    localSymbol: localPrices.symbol,
    usdMonthly: USD_PRICES.monthly,
    usdYearly: USD_PRICES.yearly,
    paysInUSD: isUSD,
    paymentProvider: getPaymentProvider(countryCode),
    yearlySavingsPercent: savingsPercent,
  };
};
