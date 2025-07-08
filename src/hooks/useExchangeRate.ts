// En src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';

export const useExchangeRate = (fromCurrency: string, toCurrency: string = 'COP') => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
        setExchangeRate(rate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setExchangeRate(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  return { exchangeRate, isLoading, error };
};