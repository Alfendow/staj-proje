namespace stajapi.Models
{
    public class KrediSonuc
    {
        public List<TaksitDetay> TaksitDetaylari { get; set; } = new();
        public decimal ToplamOdeme { get; set; }
    }
}