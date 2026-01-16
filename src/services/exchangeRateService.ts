// src/services/exchangeRateService.ts

class ExchangeRateService {
  private async fetchRateFromAPI(from: string, to: string): Promise<number | null> {
    try {
      console.log(`🔄 Buscando tasa: ${from} → ${to} con Open ER API...`);

      // Usamos una API diferente: Open Exchange Rates (versión open)
      // Esta es más estable y devuelve todas las tasas basadas en la moneda 'from'
      const response = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
        next: { revalidate: 3600 } // Caché de 1 hora
      });

      if (!response.ok) {
        throw new Error(`API respondió con estado ${response.status}`);
      }

      const data = await response.json();
      
      // La estructura es: { result: "success", rates: { "COP": 3700.50, ... } }
      const rate = data?.rates?.[to];

      if (typeof rate === 'number') {
        console.log(`✅ Tasa encontrada: 1 ${from} = ${rate} ${to}`);
        return rate;
      } else {
        console.warn(`⚠️ La moneda ${to} no existe en la respuesta.`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Error en fetchRateFromAPI:`, error);
      return null; // Retornamos null para que se active el plan de emergencia
    }
  }

  private getEmergencyRate(from: string, to: string): number {
    // Valores "Hardcoded" para que tu portafolio NUNCA se vea roto
    // incluso si no hay internet.
    const fallbackRates: Record<string, number> = {
      'USD-COP': 4100,
      'EUR-COP': 4450,
      'COP-USD': 0.00024,
    };

    const key = `${from}-${to}`;
    const rate = fallbackRates[key] || 3700; // 3700 por defecto si no encuentra el par
    
    console.log(`🆘 Usando tasa de EMERGENCIA para ${key}: ${rate}`);
    return rate;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string = 'COP'): Promise<number> {
    // 1. Si son la misma moneda, vale 1
    if (fromCurrency === toCurrency) return 1;

    // 2. Intentamos la API
    const onlineRate = await this.fetchRateFromAPI(fromCurrency, toCurrency);
    if (onlineRate !== null) return onlineRate;

    // 3. Si todo falla, usamos la emergencia
    return this.getEmergencyRate(fromCurrency, toCurrency);
  }
}

export const exchangeRateService = new ExchangeRateService();