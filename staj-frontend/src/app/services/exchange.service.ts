import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiKey = '44c2e0697a1cd6cbedd6c476'; // ExchangeRate-API'den alınacak ücretsiz API key
  private baseUrl = 'https://v6.exchangerate-api.com/v6';
  private cachedRates: { [key: string]: number } = {};
  private lastUpdate: Date | null = null;
  private cacheValidityMinutes = 60; // 1 saat cache geçerlilik süresi

  constructor(private http: HttpClient) {}

  convertAmount(amount: number, fromCurrency: string, toCurrency: string): Observable<number> {
    if (fromCurrency === toCurrency) {
      return of(amount);
    }

    return this.getExchangeRate(fromCurrency, toCurrency).pipe(
      map(rate => {
        const convertedAmount = amount * rate;
        return Number(convertedAmount.toFixed(2));
      }),
      catchError(() => of(0))
    );
  }

  private getExchangeRate(fromCurrency: string, toCurrency: string): Observable<number> {
    const cacheKey = `${fromCurrency}_${toCurrency}`;

    // Cache kontrolü
    if (this.isCacheValid() && this.cachedRates[cacheKey]) {
      return of(this.cachedRates[cacheKey]);
    }

    // API'den güncel kurları al
    return this.http.get<any>(`${this.baseUrl}/${this.apiKey}/pair/${fromCurrency}/${toCurrency}`).pipe(
      map(response => {
        const rate = response.conversion_rate;
        this.cacheRate(cacheKey, rate);
        return rate;
      }),
      catchError(error => {
        console.error('Döviz kuru alınırken hata oluştu:', error);
        // Hata durumunda varsayılan kurları kullan
        const fallbackRates: { [key: string]: number } = {
          'TRY_USD': 0.037,
          'TRY_EUR': 0.034,
          'USD_TRY': 27.0,
          'USD_EUR': 0.92,
          'EUR_TRY': 29.5,
          'EUR_USD': 1.09
        };
        return of(fallbackRates[cacheKey] || 1);
      })
    );
  }

  private isCacheValid(): boolean {
    if (!this.lastUpdate) return false;

    const now = new Date();
    const diffMinutes = (now.getTime() - this.lastUpdate.getTime()) / (1000 * 60);
    return diffMinutes < this.cacheValidityMinutes;
  }

  private cacheRate(key: string, rate: number): void {
    this.cachedRates[key] = rate;
    this.lastUpdate = new Date();
  }
}
