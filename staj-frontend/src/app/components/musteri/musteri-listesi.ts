import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// DÜZELTME: RouterLink, template'te kullanıldığı için tekrar import edildi.
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Musteri } from '../../models/musteri';
import { MusteriService } from '../../services/musteri.service';
import { KrediService } from '../../services/kredi.service';
import { KayitliKredi } from '../../models/kayitli-kredi.model';

@Component({
  selector: 'app-musteri-listesi',
  standalone: true,
  // DÜZELTME: RouterLink, imports dizisine eklendi.
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './musteri-listesi.html',
  styleUrls: ['./musteri-listesi.css']
})
export class MusteriListesiComponent implements OnInit {
  musteriler: Musteri[] = [];
  filtrelenmisMusteriler: Musteri[] = [];
  aramaTckn: string = '';

  modalGoster = false;
  seciliMusteri: Musteri | null = null;
  seciliMusteriKredileri: KayitliKredi[] = [];

  // DÜZELTME: Router artık 'guncelle' fonksiyonu için kullanılmadığından kaldırılabilir,
  // ancak başka bir yerde lazım olma ihtimaline karşı tutuyoruz.

constructor(
  private musteriService: MusteriService, 
  private krediService: KrediService,
  private router: Router,
  // DÜZELTME: AuthService'i 'public' yaparak HTML'den erişilebilir hale getirdik.
  public authService: AuthService 
) {}

  ngOnInit(): void {
    this.musteriService.getMusteriler().subscribe(data => {
      this.musteriler = data;
      this.filtrelenmisMusteriler = this.musteriler;
    });
  }

  filtrele(): void {
    if (!this.aramaTckn) {
      this.filtrelenmisMusteriler = this.musteriler;
    } else {
      this.filtrelenmisMusteriler = this.musteriler.filter(m =>
        m.tckn.startsWith(this.aramaTckn)
      );
    }
  }

  kredileriGoster(musteri: Musteri) {
    this.seciliMusteri = musteri;
    if (musteri.musteriID) {
      this.krediService.getKredilerForAdmin(musteri.musteriID).subscribe(data => {
        this.seciliMusteriKredileri = data.map(kredi => {
          try {
            kredi.parsedIstek = JSON.parse(kredi.istekVerisi);
            kredi.parsedSonuc = JSON.parse(kredi.sonucVerisi);
          } catch (e) { console.error('Parse hatası:', e); }
          return kredi;
        });
        this.modalGoster = true;
      });
    }
  }

  modalKapat() {
    this.modalGoster = false;
    this.seciliMusteri = null;
    this.seciliMusteriKredileri = [];
  }

  sil(tckn: string) {
    if (confirm("Silmek istediğinize emin misiniz?")) {
      this.musteriService.deleteMusteriByTckn(tckn).subscribe(() => {
        this.musteriler = this.musteriler.filter(m => m.tckn !== tckn);
        this.filtrele();
      });
    }
  }
}
