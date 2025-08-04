import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KrediSonuc } from '../models/kredi-sonuc.model';
import { KrediIstek } from '../models/kredi-istek.model';
import { KayitliKredi } from '../models/kayitli-kredi.model';

@Injectable({
  providedIn: 'root'
})
export class KrediService {
  private hesaplamaApiUrl = 'http://localhost:5141/api/kredi'; // KrediController
  private kayitApiUrl = 'http://localhost:5141/api/krediler'; // KrediKayitController

  constructor(private http: HttpClient) {}

  hesapla(istek: KrediIstek): Observable<KrediSonuc> {
    return this.http.post<KrediSonuc>(`${this.hesaplamaApiUrl}/hesapla`, istek);
  }

  getKayitliKrediler(musteriId: number): Observable<KayitliKredi[]> {
    return this.http.get<KayitliKredi[]>(`${this.kayitApiUrl}/musteri/${musteriId}`);
  }

  kaydetKredi(kayit: KayitliKredi): Observable<KayitliKredi> {
    return this.http.post<KayitliKredi>(this.kayitApiUrl, kayit);
  }

  guncelleKredi(id: number, guncelIstek: KrediIstek): Observable<KayitliKredi> {
    return this.http.put<KayitliKredi>(`${this.kayitApiUrl}/${id}`, guncelIstek);
  }

  silKayitliKredi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.kayitApiUrl}/${id}`);
  }

  getKredilerForAdmin(musteriId: number): Observable<KayitliKredi[]> {
  return this.http.get<KayitliKredi[]>(`${this.kayitApiUrl}/admin/musteri/${musteriId}`);
  }
  
}