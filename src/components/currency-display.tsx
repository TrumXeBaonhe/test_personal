"use client";

import { useCurrency, Currency } from "@/components/currency-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyDisplayProps {
  amount: number;
  from?: Currency;
  className?: string;
}

/**
 * A client-side component to display formatted currency values.
 * Automatically handles conversion based on the user's global preference.
 */
export function CurrencyDisplay({ amount, from = "VND", className }: CurrencyDisplayProps) {
  const { formatPrice, isLoading } = useCurrency();

  if (isLoading) {
    return <Skeleton className="h-6 w-24 inline-block align-middle" />;
  }

  return <span className={className}>{formatPrice(amount, from)}</span>;
}
