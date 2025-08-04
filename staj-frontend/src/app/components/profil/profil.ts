import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Musteri } from '../../models/musteri';
import { AuthService } from '../../services/auth.service';
import { MusteriService } from '../../services/musteri.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective], 
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class ProfilComponent implements OnInit {
  
  musteri: Musteri = {
    musteriID: 0,
    ad: '',
    soyad: '',
    tckn: '',
    telefon: '',
    email: '',
    sifre: '',
    hesapNumarasi: ''
  };
  
  isEditMode: boolean = false;
  mesaj: string = '';
  kullaniciBasHarfleri: string = '';

  constructor(
    private authService: AuthService,
    private musteriService: MusteriService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const aktifKullanici = this.authService.getAktifKullanici();
    if (aktifKullanici && aktifKullanici.musteriID) {
      this.musteri = { ...aktifKullanici, sifre: '' };

      if (this.musteri.ad && this.musteri.soyad) {
        this.kullaniciBasHarfleri = this.musteri.ad.charAt(0).toUpperCase() + this.musteri.soyad.charAt(0).toUpperCase();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  duzenlemeyiAc(): void {
    this.isEditMode = true;
    this.mesaj = '';
  }

  iptalEt(): void {
    const aktifKullanici = this.authService.getAktifKullanici();
     if (aktifKullanici) {
       this.musteri = { ...aktifKullanici, sifre: '' };
     }
    this.isEditMode = false;
  }

  bilgileriGuncelle(): void {
    this.musteriService.updateMusteri(this.musteri).subscribe({
      next: (guncellenmisMusteriApi) => {
        this.authService.updateStoredUser(guncellenmisMusteriApi);
        this.musteri = { ...guncellenmisMusteriApi, sifre: '' }; 
        this.mesaj = 'Bilgileriniz başarıyla güncellendi.';
        this.isEditMode = false;
        setTimeout(() => this.mesaj = '', 3000);
      },
      error: (err) => {
        this.mesaj = 'Güncelleme sırasında bir hata oluştu.';
      }
    });
  }
}