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
  monthly: 49,
  yearly: 290,
} as const;

// Local prices for display (will convert to USD for payment, except Argentina)
export const LOCAL_PRICES: Record<CountryCode | "DEFAULT", {
  monthly: number;
  yearly: number;
  currency: string;
  symbol: string;
}> = {
  AR: { monthly: 49990, yearly: 288000, currency: "ARS", symbol: "$" },
  CL: { monthly: 42990, yearly: 240000, currency: "CLP", symbol: "$" },
  CO: { monthly: 199900, yearly: 1200000, currency: "COP", symbol: "$" },
  CR: { monthly: 24990, yearly: 150000, currency: "CRC", symbol: "₡" },
  EC: { monthly: 49, yearly: 290, currency: "USD", symbol: "$" },
  MX: { monthly: 849, yearly: 4800, currency: "MXN", symbol: "$" },
  PA: { monthly: 49, yearly: 290, currency: "USD", symbol: "$" },
  PY: { monthly: 369900, yearly: 2160000, currency: "PYG", symbol: "₲" },
  UY: { monthly: 1990, yearly: 11880, currency: "UYU", symbol: "$" },
  BO: { monthly: 339, yearly: 1980, currency: "BOB", symbol: "Bs" },
  DO: { monthly: 2890, yearly: 16800, currency: "DOP", symbol: "RD$" },
  ES: { monthly: 45, yearly: 264, currency: "EUR", symbol: "€" },
  GT: { monthly: 389, yearly: 2280, currency: "GTQ", symbol: "Q" },
  HN: { monthly: 1190, yearly: 7200, currency: "HNL", symbol: "L" },
  NI: { monthly: 1790, yearly: 10800, currency: "NIO", symbol: "C$" },
  PE: { monthly: 185, yearly: 1080, currency: "PEN", symbol: "S/" },
  SV: { monthly: 49, yearly: 290, currency: "USD", symbol: "$" },
  DEFAULT: { monthly: 49, yearly: 290, currency: "USD", symbol: "$" },
};

// Countries that pay in USD (all except AR)
export const USD_PAYMENT_COUNTRIES: CountryCode[] = ['BO', 'CL', 'CO', 'CR', 'DO', 'EC', 'ES', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PY', 'SV', 'UY'];

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
