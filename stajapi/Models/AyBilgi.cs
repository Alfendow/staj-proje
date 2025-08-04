namespace stajapi.Models{
    public class AylikVeri
    {
        public int Ay { get; set; }
        public decimal? SabitTaksit { get; set; }
        public bool AtlandiMi { get; set; } = false;
        public decimal? AraOdeme { get; set; }
        public decimal? Artis { get; set; }
        public string? ArtisTipi { get; set; }
    }
}