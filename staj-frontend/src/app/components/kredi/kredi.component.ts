import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KrediService } from '../../services/kredi.service';
import { AuthService } from '../../services/auth.service';
import { KrediSonuc } from '../../models/kredi-sonuc.model';
import { KrediIstek } from '../../models/kredi-istek.model';
import { KayitliKredi } from '../../models/kayitli-kredi.model';
import { Musteri } from '../../models/musteri';

@Component({
  selector: 'app-kredi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './kredi.component.html',
  styleUrls: ['./kredi.component.css'],
})

export class KrediComponent implements OnInit {
  istek: KrediIstek = {
    krediTuru: 'konut',
    tutar: 0,
    vade: 0,
    aylikOran: 0,
    odemeSikligi: 'bir',
    aylikVeriler: [],
  };
  sonuc: KrediSonuc | null = null;
  aktifKullanici: Musteri | null = null;
  kayitliKrediler: KayitliKredi[] = [];
  seciliKayitId: number | null = null;
  mesaj: string = '';

  constructor(
    private krediService: KrediService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.aktifKullanici = this.authService.getAktifKullanici();
    this.kredileriYukle();
  }

  kredileriYukle(): void {
    if (this.aktifKullanici?.musteriID) {
      this.krediService.getKayitliKrediler(this.aktifKullanici.musteriID).subscribe(data => {
        this.kayitliKrediler = data.map(kredi => {
          try {
            kredi.parsedIstek = JSON.parse(kredi.istekVerisi);
            kredi.parsedSonuc = JSON.parse(kredi.sonucVerisi);
          } catch (e) { console.error('Kayıtlı kredi verisi parse edilirken hata oluştu:', e); }
          return kredi;
        });
      });
    }
  }
  
  hesapla(): void {
    if (!this.istek.vade || this.istek.vade <= 0) {
      alert('Lütfen geçerli bir vade giriniz.');
      return;
    }
  
    if (this.istek.aylikVeriler.length !== this.istek.vade) {
      const mevcutVeriler = [...this.istek.aylikVeriler];
      this.istek.aylikVeriler = [];
      for (let i = 1; i <= this.istek.vade; i++) {
        const eskiVeri = mevcutVeriler.find(v => v.ay === i);
        this.istek.aylikVeriler.push(eskiVeri || {
          ay: i, atlandiMi: false, sabitTaksit: null, araOdeme: null, artis: null, artisTipi: ''
        });
      }
    }
    
    this.krediService.hesapla(this.istek).subscribe({
        next: (res) => {
          this.sonuc = res;
          this.mesaj = 'Hesaplama sonucu güncellendi. Değişiklikleri kaydetmek için ilgili "Kaydet" butonunu kullanın.';
        },
        error: (err) => this.mesaj = 'Hesaplama sırasında hata oluştu.'
    });
  }

  planiKaydet(): void {
    if (!this.sonuc || !this.aktifKullanici?.musteriID) return;

    const yeniKayit: KayitliKredi = {
      musteriId: this.aktifKullanici.musteriID,
      istekVerisi: JSON.stringify(this.istek),
      sonucVerisi: JSON.stringify(this.sonuc),
      kayitTarihi: new Date().toISOString()
    };

    this.krediService.kaydetKredi(yeniKayit).subscribe({
      next: () => {
        this.mesaj = 'Kredi planı başarıyla kaydedildi.';
        this.kredileriYukle();
      },
      error: (err) => this.mesaj = 'Kaydetme sırasında bir hata oluştu.'
    });
  }
  
  guncellemeyiKaydet(): void {
    if (!this.seciliKayitId) return;

    this.krediService.hesapla(this.istek).subscribe(guncelSonuc => {
        this.sonuc = guncelSonuc;
        
        this.krediService.guncelleKredi(this.seciliKayitId!, this.istek).subscribe({
          next: () => {
            this.mesaj = 'Kredi planı başarıyla güncellendi.';
            this.kredileriYukle();
            this.yeniHesaplamayaBasla();
          },
          error: (err) => this.mesaj = 'Güncelleme sırasında hata oluştu.'
        });
    });
  }

  planiSil(krediId?: number): void {
    if (!krediId) return;

    if (confirm("Bu kredi planını silmek istediğinizden emin misiniz?")) {
      this.krediService.silKayitliKredi(krediId).subscribe({
        next: () => {
          this.mesaj = 'Kayıt başarıyla silindi.';
          this.kredileriYukle();
        },
        error: (err) => {
          this.mesaj = 'Silme işlemi sırasında bir hata oluştu.';
        }
      });
    }
  }

  planiYukle(kredi: KayitliKredi): void {
    if (kredi.parsedIstek && kredi.parsedSonuc && kredi.id) {
      this.istek = JSON.parse(JSON.stringify(kredi.parsedIstek));
      this.sonuc = JSON.parse(JSON.stringify(kredi.parsedSonuc));
      this.seciliKayitId = kredi.id;
      this.mesaj = `Kayıtlı kredi planı düzenleniyor. Değişiklikleri görmek için 'Hesapla', kalıcı yapmak için 'Güncellemeyi Kaydet' butonuna basın.`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  yeniHesaplamayaBasla(): void {
      this.istek = {
        krediTuru: 'konut', tutar: 0, vade: 0, aylikOran: 0, odemeSikligi: 'bir', aylikVeriler: [],
      };
      this.sonuc = null;
      this.seciliKayitId = null;
      this.mesaj = '';
  }


  exportToCsv(): void {

    if (!this.sonuc?.taksitDetaylari || this.sonuc.taksitDetaylari.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    const taksitler = this.sonuc.taksitDetaylari;
    let csvContent = "";

    const headers = [
      'Taksit No', 'Ödeme Tarihi', 'Taksit Tutarı (TL)'
    ];
    csvContent += headers.join(';') + '\r\n';
    taksitler.forEach((taksit, index) => {
      const taksitNo = index + 1;
      const odemeTarihi = this.datePipe.transform(taksit.odemeTarihi, 'dd.MM.yyyy');

      const formatCurrencyForExcel = (value: number | null | undefined): string => {
        if (value === null || value === undefined) {
          return '0,00';
        }
        return value.toFixed(2).replace('.', ',');
      };

      const toplamTaksit = formatCurrencyForExcel(taksit.toplamTaksit);


      const row = [taksitNo, odemeTarihi, toplamTaksit].join(';');
      csvContent += row + '\r\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "kredi_odeme_plani.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}