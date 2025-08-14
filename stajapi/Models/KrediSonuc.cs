using System.Collections.Generic;

namespace stajapi.Models
{
    public class KrediSonuc
    {
        public List<TaksitDetay> TaksitDetaylari { get; set; } = new();
        public decimal ToplamOdeme { get; set; }
        public List<string> DebugLog { get; set; } = new();
    }
}
