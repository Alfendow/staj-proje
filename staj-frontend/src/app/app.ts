import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  
  // YENİ EKLENDİ: Çıkış mesajı ekranını kontrol eden değişken
  cikisEkraniGoster = false;

  constructor(public authService: AuthService, private router: Router) {}

  // YENİ GÜNCELLENMİŞ LOGOUT FONKSİYONU
  logout() {
    // 1. Önce çıkış ekranını göster
    this.cikisEkraniGoster = true;

    // 2. AuthService ile kullanıcının oturumunu sonlandır
    this.authService.logout();

    // 3. 2 saniye bekledikten sonra ana sayfaya yönlendir ve ekranı gizle
    setTimeout(() => {
      this.router.navigate(['/']);
      this.cikisEkraniGoster = false;
    }, 2000); // 2000 milisaniye = 2 saniye
  }
}