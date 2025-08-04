namespace stajapi.Models
{
    public class KrediIstek
    {
        public string KrediTuru { get; set; } = string.Empty;
        public decimal Tutar { get; set; }
        public int Vade { get; set; }
        public decimal AylikOran { get; set; }
        public string OdemeSikligi { get; set; } = string.Empty;
        public List<AylikVeri> AylikVeriler { get; set; } = new();
    }
}