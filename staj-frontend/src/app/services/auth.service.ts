import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Musteri } from '../models/musteri';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5141/api/auth';
  private kullaniciKey = 'aktif_kullanici';

  constructor(private http: HttpClient, private router: Router) { }

  register(musteri: Musteri): Observable<Musteri> {
    return this.http.post<Musteri>(`${this.apiUrl}/register`, musteri);
  }

  login(email: string, sifre: string): Observable<Musteri> {
    return this.http.post<Musteri>(`${this.apiUrl}/login`, { email, sifre })
      .pipe(
        tap(kullanici => {
          const musteriData = { ...kullanici, isAdmin: false };
          sessionStorage.setItem(this.kullaniciKey, JSON.stringify(musteriData));
        })
      );
  }

  adminLogin(email: string, sifre: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin-login`, { email, sifre })
    .pipe(
      tap(response => {
        sessionStorage.setItem(this.kullaniciKey, JSON.stringify(response));
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.kullaniciKey);
  }

  getAktifKullanici(): any | null {
    const kullaniciData = sessionStorage.getItem(this.kullaniciKey);
    return kullaniciData ? JSON.parse(kullaniciData) : null;
  }

  isLoggedIn(): boolean {
    return this.getAktifKullanici() !== null;
  }

  isAdmin(): boolean {
    const kullanici = this.getAktifKullanici();
    return !!kullanici && kullanici.isAdmin === true;
  }

  // Tarayıcı hafızasındaki kullanıcı bilgisini günceller
  updateStoredUser(guncelMusteri: Musteri): void {
    const kullanici = this.getAktifKullanici();
    if (kullanici) {
      const yeniData = { ...kullanici, ...guncelMusteri };
      sessionStorage.setItem(this.kullaniciKey, JSON.stringify(yeniData));
    }
  }
}