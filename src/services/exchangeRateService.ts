// En src/services/exchangeRateService.ts (Versión modificada para Fixer API)

class ExchangeRateService {
  private async fetchRateFromAPI(from: string, to: string): Promise<number | null> {
    // 1. Obtenemos la clave de API desde las variables de entorno.
    const apiKey = process.env.FIXER_API_KEY;

    // 2. Verificamos que la clave de API exista.
    if (!apiKey) {
      console.error("❌ La clave de API de Fixer (FIXER_API_KEY) no está configurada en el archivo .env.local");
      return null;
    }

    try {
      console.log(`🔄 Buscando tasa de cambio con Fixer API: ${from} → ${to}`);
      
      // 3. Creamos los headers para la autenticación.
      const headers = new Headers();
      headers.append("apikey", apiKey);

      // 4. Hacemos la llamada a la API de Fixer.
      const response = await fetch(`https://api.apilayer.com/fixer/latest?base=${from}&symbols=${to}`, {
        method: 'GET',
        headers: headers,
        next: { revalidate: 3600 }, // Mantenemos el caché de 1 hora.
      });

      if (!response.ok) {
        // Si la API falla, intentamos leer el mensaje de error que nos da.
        const errorData = await response.json();
        throw new Error(`La API de Fixer falló con estado ${response.status}: ${errorData.message}`);
      }

      const data = await response.json();
      const rate = data?.rates?.[to];

      // 5. Verificamos que la respuesta sea válida.
      if (data.success && rate && typeof rate === 'number' && rate > 0) {
        console.log(`✅ Tasa obtenida de Fixer API: ${rate}`);
        return rate;
      } else {
        throw new Error('La respuesta de la API de Fixer no contiene una tasa válida.');
      }
    } catch (error) {
      // 6. Capturamos cualquier error en el proceso.
      console.error(`❌ Falló la obtención de la tasa con Fixer:`, error);
      return null;
    }
  }

  // --- El resto de la clase no necesita cambios ---

  private getEmergencyRate(from: string, to: string): number | null {
    if (`${from}-${to}` === 'USD-COP') {
      console.log(`🆘 Usando tasa de emergencia: 4100`);
      return 4100; // Tasa de emergencia fija
    }
    return null;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string = 'COP'): Promise<number | null> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const onlineRate = await this.fetchRateFromAPI(fromCurrency, toCurrency);

    if (onlineRate) {
      return onlineRate;
    }

    // Si la API falla, usamos nuestro plan B: la tasa de emergencia.
    console.warn('🚨 La API de Fixer falló, usando tasa de emergencia como respaldo.');
    return this.getEmergencyRate(fromCurrency, toCurrency);
  }
}

// Exportamos una única instancia del servicio para usar en toda la app.
export const exchangeRateService = new ExchangeRateService();