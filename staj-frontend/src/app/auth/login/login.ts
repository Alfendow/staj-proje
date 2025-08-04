import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    sifre: ''
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.errorMessage = '';
    this.authService.login(this.credentials.email, this.credentials.sifre).subscribe({
      next: () => {
        this.router.navigate(['/kredi']);
      },
      error: (err: HttpErrorResponse) => { // Hatanın tipini belirtiyoruz
            if (err.status === 429) {
              // Eğer hata 429 ise, özel mesajımızı göster.
              this.errorMessage = 'Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin.';
            } else {
              // Diğer tüm hatalar için genel mesajı göster.
              this.errorMessage = 'E-posta veya şifre hatalı!';
            }
            console.error(err);
          }
    });
  }
}
