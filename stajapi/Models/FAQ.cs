namespace stajapi.Models
{
    public class FAQ
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsOpen { get; set; } = false;
    }
}
