using stajapi.Models;

public class KrediMotoru
{
    private const decimal BSMV_ORANI = 0.10m;
    private const decimal KKDF_ORANI = 0.10m;

    public KrediSonuc KrediHesapla(KrediIstek istek)
    {
        decimal bsmvOrani = 0, kkdfOrani = 0;
        if (istek.KrediTuru.ToLower() == "ihtiyac" || istek.KrediTuru.ToLower() == "tasit")
        {
            bsmvOrani = BSMV_ORANI;
            kkdfOrani = KKDF_ORANI;
        }

        int odemeAraligi = istek.OdemeSikligi switch { "uc" => 3, "alti" => 6, _ => 1 };
        int periyotSayisi = istek.Vade / odemeAraligi;
        decimal aylikFaizDecimal = istek.AylikOran / 100.0m;
        decimal donemselFaizOrani = aylikFaizDecimal * odemeAraligi;

        decimal anaTaksit = AnaTaksitiBul(istek, periyotSayisi, donemselFaizOrani, odemeAraligi, bsmvOrani, kkdfOrani);
        anaTaksit = Math.Round(anaTaksit, 2, MidpointRounding.AwayFromZero);
        
        DateTime baslangicTarihi = DateTime.Now;
        return SonucTablosuHazirla(istek, anaTaksit, periyotSayisi, donemselFaizOrani, odemeAraligi, bsmvOrani, kkdfOrani, baslangicTarihi);
    }
    
    private decimal AnaTaksitiBul(KrediIstek istek, int periyotSayisi, decimal donemFaizOrani, int odemeAraligi, decimal bsmvOrani, decimal kkdfOrani)
    {
        decimal altSinir = 0;
        decimal ustSinir = istek.Tutar * 2;
        decimal tahmin = 0;

        for (int i = 0; i < 100; i++)
        {
            tahmin = (altSinir + ustSinir) / 2;
            if (ustSinir - altSinir < 0.001m) break;
            
            decimal kalanBakiye = KrediyiTestEt(istek, tahmin, periyotSayisi, donemFaizOrani, odemeAraligi, bsmvOrani, kkdfOrani);

            if (kalanBakiye > 0) altSinir = tahmin;
            else ustSinir = tahmin;
        }
        return tahmin;
    }

    private decimal KrediyiTestEt(KrediIstek istek, decimal anaTaksit, int periyotSayisi, decimal donemFaizOrani, int odemeAraligi, decimal bsmvOrani, decimal kkdfOrani)
    {
        decimal kalanAnaPara = istek.Tutar;

        for (int periyot = 1; periyot <= periyotSayisi; periyot++)
        {
            if (kalanAnaPara <= 0) break;

            int bitisAyi = periyot * odemeAraligi;
            int baslangicAyi = bitisAyi - odemeAraligi + 1;

            decimal faiz = Math.Round(kalanAnaPara * donemFaizOrani, 2, MidpointRounding.AwayFromZero);
            
            decimal araOdemeler = istek.AylikVeriler
                .Where(v => v.Ay >= baslangicAyi && v.Ay <= bitisAyi)
                .Sum(v => v.AraOdeme.GetValueOrDefault());
            kalanAnaPara -= araOdemeler;
            if (kalanAnaPara < 0) kalanAnaPara = 0;

            var ayVerisi = istek.AylikVeriler.FirstOrDefault(v => v.Ay == bitisAyi);
            bool atlandiMi = ayVerisi?.AtlandiMi ?? false;

            if (atlandiMi)
            {
                // NİHAİ DÜZELTME: Atlanan taksitte faiz ve o faizin vergileri anaparaya eklenir (kapitalize edilir).
                decimal bsmv = Math.Round(faiz * bsmvOrani, 2, MidpointRounding.AwayFromZero);
                decimal kkdf = Math.Round(faiz * kkdfOrani, 2, MidpointRounding.AwayFromZero);
                kalanAnaPara += faiz + bsmv + kkdf;
            }
            else
            {
                decimal bsmv = Math.Round(faiz * bsmvOrani, 2, MidpointRounding.AwayFromZero);
                decimal kkdf = Math.Round(faiz * kkdfOrani, 2, MidpointRounding.AwayFromZero);
                decimal toplamVergi = bsmv + kkdf;
                
                decimal guncelTaksit = anaTaksit;
                decimal sabitTaksit = ayVerisi?.SabitTaksit.GetValueOrDefault() ?? 0;
                
                if (sabitTaksit > 0)
                {
                    guncelTaksit = sabitTaksit;
                }
                else
                {
                    guncelTaksit = ArtisliTaksitiHesapla(anaTaksit, bitisAyi, istek.AylikVeriler);
                }
                
                decimal toplamFaizVeVergiler = faiz + toplamVergi;
                decimal anaparaPayi = Math.Round(guncelTaksit - toplamFaizVeVergiler, 2, MidpointRounding.AwayFromZero);
                kalanAnaPara -= anaparaPayi;
            }
        }
        return kalanAnaPara;
    }
    
    private KrediSonuc SonucTablosuHazirla(KrediIstek istek, decimal anaTaksit, int periyotSayisi, decimal donemFaizOrani, int odemeAraligi, decimal bsmvOrani, decimal kkdfOrani, DateTime baslangicTarihi)
    {
        var sonuc = new KrediSonuc();
        decimal kalanAnaPara = istek.Tutar;

        for (int periyot = 1; periyot <= periyotSayisi; periyot++)
        {
            int bitisAyi = periyot * odemeAraligi;
            int baslangicAyi = bitisAyi - odemeAraligi + 1;

            DateTime taksitTarihi = baslangicTarihi.AddMonths(bitisAyi);
            var detay = new TaksitDetay { Ay = bitisAyi, OdemeTarihi = taksitTarihi };

            // NİHAİ DÜZELTME: Faiz, her zaman ara ödemeden ÖNCE hesaplanır.
            decimal faiz = Math.Round(kalanAnaPara * donemFaizOrani, 2, MidpointRounding.AwayFromZero);
            detay.AylikFaiz = faiz;
            
            decimal araOdemeler = istek.AylikVeriler.Where(v => v.Ay >= baslangicAyi && v.Ay <= bitisAyi).Sum(v => v.AraOdeme.GetValueOrDefault());
            kalanAnaPara -= araOdemeler;
            if (kalanAnaPara < 0) kalanAnaPara = 0;

            var ayVerisi = istek.AylikVeriler.FirstOrDefault(v => v.Ay == bitisAyi);
            bool atlandiMi = ayVerisi?.AtlandiMi ?? false;

            if (atlandiMi)
            {
                // Atlanan taksitte taksit ödemesi olmaz, vergiler sıfırlanır ve faiz ile vergileri anaparaya eklenir (kapitalizasyon).
                detay.BSMV = 0;
                detay.KKDF = 0;
                detay.Anapara = 0;
                detay.ToplamTaksit = araOdemeler;

                decimal bsmv = Math.Round(faiz * bsmvOrani, 2, MidpointRounding.AwayFromZero);
                decimal kkdf = Math.Round(faiz * kkdfOrani, 2, MidpointRounding.AwayFromZero);
                kalanAnaPara += faiz + bsmv + kkdf;
            }
            else
            {
                detay.BSMV = Math.Round(faiz * bsmvOrani, 2, MidpointRounding.AwayFromZero);
                detay.KKDF = Math.Round(faiz * kkdfOrani, 2, MidpointRounding.AwayFromZero);
                decimal toplamFaizVeVergiler = faiz + detay.BSMV.GetValueOrDefault() + detay.KKDF.GetValueOrDefault();
                
                decimal guncelTaksit;
                decimal sabitTaksit = ayVerisi?.SabitTaksit.GetValueOrDefault() ?? 0;
                
                if (sabitTaksit > 0) guncelTaksit = sabitTaksit;
                else guncelTaksit = ArtisliTaksitiHesapla(anaTaksit, bitisAyi, istek.AylikVeriler);

                if (periyot == periyotSayisi) guncelTaksit = kalanAnaPara + toplamFaizVeVergiler;
                
                detay.Anapara = Math.Round(guncelTaksit - toplamFaizVeVergiler, 2, MidpointRounding.AwayFromZero);
                detay.ToplamTaksit = guncelTaksit + araOdemeler;
                kalanAnaPara -= detay.Anapara.GetValueOrDefault();
            }
            sonuc.TaksitDetaylari.Add(detay);
        }

        sonuc.ToplamOdeme = sonuc.TaksitDetaylari.Sum(d => d.ToplamTaksit.GetValueOrDefault());
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
        return guncelTaksit;
    }
}