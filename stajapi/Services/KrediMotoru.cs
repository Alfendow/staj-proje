using stajapi.Models;

public class KrediMotoru
{
  private const decimal BSMV_ORANI = 0.10m;
  private const decimal KKDF_ORANI = 0.10m;

  public KrediSonuc KrediHesapla(KrediIstek istek)
  {
    var parametreler = new KrediMotoruParametreleri { Istek = istek };

    if (istek.KrediTuru.ToLower() == "ihtiyac" || istek.KrediTuru.ToLower() == "tasit")
    {
      parametreler.BsmvOrani = BSMV_ORANI;
      parametreler.KkdfOrani = KKDF_ORANI;
    }

    parametreler.OdemeAraligi = istek.OdemeSikligi switch { "uc" => 3, "alti" => 6, _ => 1 };
    parametreler.PeriyotSayisi = istek.Vade / parametreler.OdemeAraligi;
    decimal aylikFaizDecimal = istek.AylikOran / 100.0m;
    parametreler.DonemselFaizOrani = aylikFaizDecimal * parametreler.OdemeAraligi;

    parametreler.AnaTaksit = AnaTaksitiBul(parametreler);
    parametreler.AnaTaksit = Math.Round(parametreler.AnaTaksit, 2, MidpointRounding.AwayFromZero);

    parametreler.BaslangicTarihi = DateTime.Now;
    return SonucTablosuHazirla(parametreler);
  }

  private decimal AnaTaksitiBul(KrediMotoruParametreleri parametreler)
  {
    decimal altSinir = 0;
    decimal ustSinir = parametreler.Istek.Tutar * 2;
    decimal tahmin = 0;

    for (int i = 0; i < 100; i++)
    {
      tahmin = (altSinir + ustSinir) / 2;
      if (ustSinir - altSinir < 0.001m) break;

      decimal kalanBakiye = KrediyiTestEt(tahmin, parametreler);

      if (kalanBakiye > 0) altSinir = tahmin;
      else ustSinir = tahmin;
    }
    return tahmin;
  }

  private decimal KrediyiTestEt(decimal anaTaksitTahmini, KrediMotoruParametreleri parametreler)
  {
    decimal kalanAnaPara = parametreler.Istek.Tutar;

    for (int periyot = 1; periyot <= parametreler.PeriyotSayisi; periyot++)
    {
      if (kalanAnaPara <= 0) break;

      int bitisAyi = periyot * parametreler.OdemeAraligi;
      int baslangicAyi = bitisAyi - parametreler.OdemeAraligi + 1;

      // Faiz her zaman dönemin başında hesaplanır
      decimal faiz = kalanAnaPara * parametreler.DonemselFaizOrani;

      // Ara ödemeler faizden sonra düşülür
      decimal araOdemeler = parametreler.Istek.AylikVeriler
        .Where(v => v.Ay >= baslangicAyi && v.Ay <= bitisAyi)
        .Sum(v => v.AraOdeme.GetValueOrDefault());
      kalanAnaPara -= araOdemeler;
      if (kalanAnaPara < 0) kalanAnaPara = 0;

      var ayVerisi = parametreler.Istek.AylikVeriler.FirstOrDefault(v => v.Ay == bitisAyi);
      bool atlandiMi = ayVerisi?.AtlandiMi ?? false;

      if (atlandiMi)
      {
        // Atlanan ayda: faiz ve vergiler anaparaya eklenir (kapitalizasyon)
        decimal bsmv = faiz * parametreler.BsmvOrani;
        decimal kkdf = faiz * parametreler.KkdfOrani;
        kalanAnaPara = kalanAnaPara + faiz + bsmv + kkdf;
      }
      else
      {
        // Normal ayda: taksit ödemesi yapılır
        decimal bsmv = faiz * parametreler.BsmvOrani;
        decimal kkdf = faiz * parametreler.KkdfOrani;
        decimal toplamVergi = bsmv + kkdf;
        decimal toplamFaizVeVergiler = faiz + toplamVergi;

        decimal guncelTaksit = anaTaksitTahmini;
        decimal sabitTaksit = ayVerisi?.SabitTaksit.GetValueOrDefault() ?? 0;

        if (sabitTaksit > 0)
        {
          guncelTaksit = sabitTaksit;
        }
        else
        {
          guncelTaksit = ArtisliTaksitiHesapla(anaTaksitTahmini, bitisAyi, parametreler.Istek.AylikVeriler);
        }

        decimal anaparaPayi = guncelTaksit - toplamFaizVeVergiler;
        kalanAnaPara = kalanAnaPara - anaparaPayi;
      }
    }
    return kalanAnaPara;
  }

  private KrediSonuc SonucTablosuHazirla(KrediMotoruParametreleri parametreler)
  {
    var sonuc = new KrediSonuc();
    decimal kalanAnaPara = parametreler.Istek.Tutar;

    for (int periyot = 1; periyot <= parametreler.PeriyotSayisi; periyot++)
    {
      int bitisAyi = periyot * parametreler.OdemeAraligi;
      int baslangicAyi = bitisAyi - parametreler.OdemeAraligi + 1;

      DateTime taksitTarihi = parametreler.BaslangicTarihi.AddMonths(bitisAyi);
      var detay = new TaksitDetay { Ay = bitisAyi, OdemeTarihi = taksitTarihi };

      // Faiz her zaman dönemin başında hesaplanır
      decimal faiz = kalanAnaPara * parametreler.DonemselFaizOrani;
      detay.AylikFaiz = Math.Round(faiz, 2);

      // Ara ödemeler faizden sonra düşülür
      decimal araOdemeler = parametreler.Istek.AylikVeriler
        .Where(v => v.Ay >= baslangicAyi && v.Ay <= bitisAyi)
        .Sum(v => v.AraOdeme.GetValueOrDefault());
      kalanAnaPara = kalanAnaPara - araOdemeler;
      if (kalanAnaPara < 0) kalanAnaPara = 0;

      var ayVerisi = parametreler.Istek.AylikVeriler.FirstOrDefault(v => v.Ay == bitisAyi);
      bool atlandiMi = ayVerisi?.AtlandiMi ?? false;

      if (atlandiMi)
      {
        // Atlanan ay: Vergiler gösterilmez, sadece ara ödemeler
        detay.BSMV = 0;
        detay.KKDF = 0;
        detay.Anapara = 0;
        detay.ToplamTaksit = Math.Round(araOdemeler, 2);

        // Atlanan ayda faiz ve vergiler anaparaya eklenir (kapitalizasyon)
        decimal bsmv = faiz * parametreler.BsmvOrani;
        decimal kkdf = faiz * parametreler.KkdfOrani;
        kalanAnaPara = kalanAnaPara + faiz + bsmv + kkdf;
      }
      else
      {
        // Normal ay: Vergiler ve taksit hesaplanır
        decimal bsmv = faiz * parametreler.BsmvOrani;
        decimal kkdf = faiz * parametreler.KkdfOrani;
        detay.BSMV = Math.Round(bsmv, 2);
        detay.KKDF = Math.Round(kkdf, 2);
        decimal toplamFaizVeVergiler = faiz + bsmv + kkdf;

        decimal guncelTaksit;
        decimal sabitTaksit = ayVerisi?.SabitTaksit.GetValueOrDefault() ?? 0;

        if (sabitTaksit > 0)
          guncelTaksit = sabitTaksit;
        else
          guncelTaksit = ArtisliTaksitiHesapla(parametreler.AnaTaksit, bitisAyi, parametreler.Istek.AylikVeriler);

        detay.Anapara = Math.Round(guncelTaksit - toplamFaizVeVergiler, 2);
        detay.ToplamTaksit = Math.Round(guncelTaksit + araOdemeler, 2);
        kalanAnaPara = kalanAnaPara - (guncelTaksit - toplamFaizVeVergiler);
      }

      sonuc.TaksitDetaylari.Add(detay);
    }

    sonuc.ToplamOdeme = Math.Round(sonuc.TaksitDetaylari.Sum(d => d.ToplamTaksit.GetValueOrDefault()), 2);
    return sonuc;
  }

  private decimal ArtisliTaksitiHesapla(decimal anaTaksit, int mevcutAy, List<AylikVeri> aylikVeriler)
  {
    var artisKurallari = aylikVeriler
      .Where(v => v.Artis.GetValueOrDefault() > 0 && v.Ay <= mevcutAy)
      .OrderBy(v => v.Ay)
      .ToList();

    if (!artisKurallari.Any()) return anaTaksit;

    decimal guncelTaksit = anaTaksit;
    foreach (var kural in artisKurallari)
    {
      if (kural.ArtisTipi?.ToLower().Contains("yuzde") == true)
        guncelTaksit *= 1 + (kural.Artis.GetValueOrDefault() / 100m);
      else
        guncelTaksit += kural.Artis.GetValueOrDefault();
    }
    return Math.Round(guncelTaksit, 2);
  }
}
