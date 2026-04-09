"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getExchangeRates, ExchangeRates } from "@/app/actions/exchange-actions";
import { updateProfile } from "@/app/actions/profile-actions";
import { toast } from "sonner";

export type Currency = "VND" | "USD" | "EUR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatPrice: (amount: number, fromCurrency?: Currency) => string;
  convert: (amount: number, from: Currency, to: Currency) => number;
  rates: ExchangeRates;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const FALLBACK_RATES: ExchangeRates = {
  VND: 1,
  USD: 1 / 25000,
  EUR: 1 / 27000,
  lastUpdate: Date.now(),
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("VND");
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("preferred-currency") as Currency;
    if (saved && ["VND", "USD", "EUR"].includes(saved)) {
      setCurrencyState(saved);
    }
    
    const fetchRates = async () => {
      setIsLoading(true);
      const latestRates = await getExchangeRates();
      setRates(latestRates);
      setIsLoading(false);
    };

    fetchRates();
  }, []);

  const handleSetCurrency = async (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("preferred-currency", c);
    
    // Attempt to sync with DB
    try {
      await updateProfile({ fullName: "", preferredCurrency: c });
    } catch (error) {
      console.error("Failed to sync currency to profile:", error);
    }
  };

  /**
   * Convert amount from one currency to another using the current rates.
   * Internal base is always assumed to be VND if not specified.
   */
  const convert = useCallback((amount: number, from: Currency, to: Currency) => {
    if (from === to) return amount;
    
    // Value in VND = amount / rates[from] (since rates are from VND base, e.g. USD = 0.00004)
    // Actually, rates in getExchangeRates are 1 VND = 0.00004 USD.
    // So 1,000,000 VND * 0.00004 = 40 USD.
    // Convert TO VND: amount / rates[from]
    // Convert FROM VND: amount * rates[to]
    
    const amountInVND = from === "VND" ? amount : amount / rates[from];
    return to === "VND" ? amountInVND : amountInVND * rates[to];
  }, [rates]);

  const formatPrice = useCallback((amount: number, fromCurrency: Currency = "VND") => {
    const convertedAmount = convert(amount, fromCurrency, currency);
    
    const locale = currency === "VND" ? "vi-VN" : currency === "USD" ? "en-US" : "de-DE";
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(convertedAmount);
  }, [currency, convert]);

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: handleSetCurrency, 
        formatPrice, 
        convert,
        rates,
        isLoading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

