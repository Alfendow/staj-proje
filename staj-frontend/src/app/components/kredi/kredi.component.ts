import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KrediService } from '../../services/kredi.service';
import { AuthService } from '../../services/auth.service';
import { ExchangeService } from '../../services/exchange.service';
import { KrediSonuc } from '../../models/kredi-sonuc.model';
import { KrediIstek } from '../../models/kredi-istek.model';
import { KayitliKredi } from '../../models/kayitli-kredi.model';
import { Musteri } from '../../models/musteri';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

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
  dovizCinsi: 'TRY' | 'USD' | 'EUR' = 'TRY';
  convertedTaksitler: { [key: string]: number[] } = {
    'USD': [],
    'EUR': []
  };
  kayitliKrediler: KayitliKredi[] = [];
  seciliKayitId: number | null = null;
  mesaj: string = '';

  constructor(
    private krediService: KrediService,
    private authService: AuthService,
    private exchangeService: ExchangeService,
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
          // Mevcut para birimini koru
          const currentCurrency = this.dovizCinsi;
          this.convertedTaksitler = { 'USD': [], 'EUR': [] };
          this.hesaplaDovizKarsiligi();
          if (currentCurrency !== 'TRY') {
            // Hesaplama bittikten sonra önceki para birimine geri dön
            this.paraBirimiDegistir(currentCurrency);
          }
          this.mesaj = 'Hesaplama sonucu güncellendi. Değişiklikleri kaydetmek için "Kaydet" butonunu kullanın.';
        },
        error: (err) => this.mesaj = 'Hesaplama sırasında hata oluştu.'
    });
  }

  hesaplaDovizKarsiligi(): void {
    if (!this.sonuc) return;

    ['USD', 'EUR'].forEach(currency => {
      this.convertedTaksitler[currency] = [];
      this.sonuc!.taksitDetaylari.forEach(taksit => {
        this.exchangeService.convertAmount(taksit.toplamTaksit!, 'TRY', currency)
          .subscribe(amount => {
            this.convertedTaksitler[currency].push(amount);
          });
      });
    });
  }

  paraBirimiDegistir(birim: 'TRY' | 'USD' | 'EUR'): void {
    this.dovizCinsi = birim;
  }

  getTaksitTutari(index: number): number {
    if (this.dovizCinsi === 'TRY') {
      return this.sonuc!.taksitDetaylari[index].toplamTaksit!;
    }
    return this.convertedTaksitler[this.dovizCinsi][index] || 0;
  }

  getToplamOdeme(): number {
    if (this.dovizCinsi === 'TRY') {
      return this.sonuc!.toplamOdeme;
    }
    return this.convertedTaksitler[this.dovizCinsi].reduce((acc, curr) => acc + curr, 0);
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
      }
      this.sonuc = null;
      this.seciliKayitId = null;
      this.mesaj = '';
  }


  exportToPdf(): void {
    if (!this.sonuc?.taksitDetaylari || this.sonuc.taksitDetaylari.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    (pdfMake as any).vfs = pdfFonts.vfs;

    const tableRows = this.sonuc.taksitDetaylari.map((detay, index) => {
      const atlandiMi = this.istek.aylikVeriler[detay.ay - 1].atlandiMi;
      const araOdeme = this.istek.aylikVeriler[detay.ay - 1].araOdeme || 0;

      return [
        { text: (index + 1).toString(), alignment: 'center' },
        { text: this.datePipe.transform(detay.odemeTarihi, 'dd.MM.yyyy'), alignment: 'center' },
        { text: this.currencyPipe.transform(this.getTaksitTutari(index) + araOdeme, this.dovizCinsi, 'symbol-narrow', '1.2-2'), alignment: 'right' },
        { text: atlandiMi ? 'Atlandı' : 'Ödenecek', alignment: 'center' }
      ];
    });

    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 40, 40, 60],
      content: [
        {
          text: 'KREDİ ÖDEME PLANI',
          style: 'header',
          alignment: 'center'
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 1,
              lineColor: '#FFBC14' // VakıfBank sarısı
            }
          ]
        },
        {
          style: 'krediBilgileri',
          stack: [
            { text: `Kredi Türü: ${this.istek.krediTuru.toUpperCase()}` },
            { text: `Kredi Tutarı: ${this.currencyPipe.transform(this.istek.tutar, this.dovizCinsi, 'symbol-narrow', '1.2-2')}` },
            { text: `Vade: ${this.istek.vade} Ay` },
            { text: `Aylık Faiz Oranı: %${this.istek.aylikOran}` },
            { text: `Ödeme Sıklığı: ${this.istek.odemeSikligi === 'bir' ? 'Aylık' : 'Üç Aylık'}` }
          ]
        },
        {
          style: 'tablo',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Taksit No', style: 'tableHeader', alignment: 'center' },
                { text: 'Ödeme Tarihi', style: 'tableHeader', alignment: 'center' },
                { text: 'Ödenecek Tutar', style: 'tableHeader', alignment: 'center' },
                { text: 'Durum', style: 'tableHeader', alignment: 'center' }
              ],
              ...tableRows
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex % 2 === 0 ? '#FFFFFF' : '#F5F5F5';
            },
            hLineWidth: function (i: number, node: any) {
              return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function (i: number, node: any) {
              return 0.5;
            },
            hLineColor: function (i: number, node: any) {
              return (i === 0 || i === node.table.body.length) ? '#FFBC14' : '#E5E5E5';
            },
            vLineColor: function (i: number, node: any) {
              return '#E5E5E5';
            }
          }
        },
        {
          style: 'ozet',
          stack: [
            { text: 'Özet Bilgiler:', style: 'ozetBaslik' },
            { text: `Toplam Geri Ödeme: ${this.currencyPipe.transform(this.getToplamOdeme(), this.dovizCinsi, 'symbol-narrow', '1.2-2')}` }
          ]
        },
        {
          text: `Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.`,
          style: 'footer'
        }
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#003366',
          margin: [0, 0, 0, 10]
        },
        krediBilgileri: {
          fontSize: 12,
          margin: [0, 20, 0, 20],
          lineHeight: 1.5
        },
        tablo: {
          margin: [0, 0, 0, 20]
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#000000',
          fillColor: '#FFBC14',
          margin: [5, 5, 5, 5]
        },
        ozet: {
          margin: [0, 20, 0, 20]
        },
        ozetBaslik: {
          fontSize: 12,
          bold: true,
          color: '#003366',
          margin: [0, 0, 0, 10]
        },
        footer: {
          fontSize: 8,
          color: '#808080',
          alignment: 'right',
          margin: [0, 20, 0, 0]
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(documentDefinition).download(`kredi-odeme-plani-${new Date().toISOString().split('T')[0]}.pdf`);
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
