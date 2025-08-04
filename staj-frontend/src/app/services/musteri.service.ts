import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Musteri } from '../models/musteri';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MusteriService {
  private apiUrl = 'http://localhost:5141/api/musteri';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMusteriler(): Observable<Musteri[]> {
    return this.http.get<Musteri[]>(this.apiUrl);
  }

  addMusteri(musteri: Musteri): Observable<Musteri> {
    return this.http.post<Musteri>(this.apiUrl, musteri);
  }
  deleteMusteriByTckn(tckn: string): Observable<any> {
    const admin = this.authService.getAktifKullanici();
    const headers = new HttpHeaders().set('X-Admin-Email', admin?.email || '');
    return this.http.delete(`${this.apiUrl}/tckn/${tckn}`, { headers });
  }

  updateMusteri(musteri: Musteri): Observable<Musteri> {
    const admin = this.authService.getAktifKullanici();
    const headers = new HttpHeaders().set('X-Admin-Email', admin?.email || '');
    return this.http.put<Musteri>(`${this.apiUrl}/tckn/${musteri.tckn}`, musteri, { headers });
  }
  
  getMusteriByTckn(tckn: string) {
    return this.http.get<Musteri>(`${this.apiUrl}/tckn/${tckn}`);
  }

}
