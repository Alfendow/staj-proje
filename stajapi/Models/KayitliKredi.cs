using System.ComponentModel.DataAnnotations.Schema;
using stajapi.Models;

public class KayitliKredi
{
    public int Id { get; set; }
    public int MusteriId { get; set; }
    public string IstekVerisi { get; set; } = string.Empty;
    public string SonucVerisi { get; set; } = string.Empty;
    public DateTime KayitTarihi { get; set; }

    [ForeignKey("MusteriId")]
    public Musteri? Musteri { get; set; }
    public DateTime GuncellemeTarihi { get; set; }
}