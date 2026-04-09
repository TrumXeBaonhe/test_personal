"use server";

const API_URL = "https://open.er-api.com/v6/latest/VND";

export type ExchangeRates = {
  VND: number;
  USD: number;
  EUR: number;
  lastUpdate: number;
};

// Fallback rates if API is down
const FALLBACK_RATES: ExchangeRates = {
  VND: 1,
  USD: 1 / 25000,
  EUR: 1 / 27000,
  lastUpdate: Date.now(),
};

/**
 * Fetch real-time exchange rates from VND as base.
 * Cached for 1 hour to respect API limits and performance.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(API_URL, {
      next: { revalidate: 3600, tags: ["exchange-rates"] },
    });

    if (!response.ok) throw new Error("Failed to fetch exchange rates");

    const data = await response.json();
    
    return {
      VND: 1,
      USD: data.rates.USD,
      EUR: data.rates.EUR,
      lastUpdate: Date.now(),
    };
  } catch (error) {
    console.error("Exchange Rate Fetch Error:", error);
    return FALLBACK_RATES;
  }
}
