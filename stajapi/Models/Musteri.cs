namespace stajapi.Models
{
    public class Musteri
    {
        public int MusteriID { get; set; }
        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } = string.Empty;
        public string TCKN { get; set; } = string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty; 
        public string HesapNumarasi { get; set; } = null!;
    }
}
