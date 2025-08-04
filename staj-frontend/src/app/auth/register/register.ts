import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { Musteri } from '../../models/musteri';
import { MusteriService } from '../../services/musteri.service';
import { AuthService } from '../../services/auth.service'; // Yeni Auth servisi

@Component({
  selector: 'app-musteri-formu',
  standalone: true, // Standalone yapısı korundu
  imports: [CommonModule, FormsModule, RouterLink, NgxMaskDirective], // Imports dizisi korundu
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {

  musteri: Musteri = {
    ad: '',
    soyad: '',
    tckn: '',
    telefon: '',
    email: '',
    sifre: '',
    hesapNumarasi: ''
  };

  mesaj: string = '';
  duzenlemeModu: boolean = false;

  constructor(
    private authService: AuthService,
    private musteriService: MusteriService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const tckn = this.route.snapshot.paramMap.get('tckn');
    if (tckn) {
      this.duzenlemeModu = true;
      this.musteriService.getMusteriByTckn(tckn).subscribe(data => {
        this.musteri = data;
      });
    }
  }

  kaydetVeyaGuncelle() {
    if (this.duzenlemeModu) {
      // Güncelleme mantığı (Admin panelinden gelinirse çalışır)
      this.musteriService.updateMusteri(this.musteri).subscribe(() => {
        this.mesaj = 'Müşteri başarıyla güncellendi.';
        // Admin panelindeki listeye geri dön
        setTimeout(() => this.router.navigate(['/admin/musteri-listesi']), 2000);
      });
    } else {
      // Yeni Hesap Oluşturma (Kayıt) mantığı
      this.authService.register(this.musteri).subscribe({
        next: () => {
          this.mesaj = 'Hesabınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          // API'den gelen hata mesajını göster
          this.mesaj = err.error || 'Kayıt sırasında bir hata oluştu.';
        }
      });
    }
  }

  sayiKontrol(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}