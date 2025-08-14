namespace stajapi.Models;

// KrediMotoru servisi için özel olarak kullanılan hesaplama parametrelerini bir arada tutar.
public class KrediMotoruParametreleri
{
    public KrediIstek Istek { get; set; } = null!;
    public int PeriyotSayisi { get; set; }
    public decimal DonemselFaizOrani { get; set; }
    public int OdemeAraligi { get; set; }
    public decimal BsmvOrani { get; set; }
    public decimal KkdfOrani { get; set; }
    public decimal AnaTaksit { get; set; }
    public DateTime BaslangicTarihi { get; set; }
}
