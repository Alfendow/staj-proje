using System;

namespace stajapi.Models
{
    public class TaksitDetay
    {
        public int Ay { get; set; }
        public DateTime OdemeTarihi { get; set; }
        public decimal? Anapara { get; set; }
        public decimal? AylikFaiz { get; set; }
        public decimal? BSMV { get; set; }
        public decimal? KKDF { get; set; }
        public decimal? ToplamTaksit { get; set; }
        public decimal? AraOdeme { get; set; }
        public decimal KalanAnapara { get; internal set; }
    }
}