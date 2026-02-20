import { create } from "zustand";

/**
 * Default currency code to use when no provider is configured.
 */
export const DEFAULT_CURRENCY = "USD";

export function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: DEFAULT_CURRENCY,
    }).format(amount);
  }
}

interface CurrencyState {
  currency: string | null;
  isLoading: boolean;
  error: string | null;
}

const useCurrencyStore = create<CurrencyState>(() => ({
  currency: DEFAULT_CURRENCY,
  isLoading: false,
  error: null,
}));

export const useCurrency = () => {
  const store = useCurrencyStore();
  return {
    currency: store.currency,
    isLoading: store.isLoading,
    error: store.error,
  };
};
