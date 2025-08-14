using Microsoft.EntityFrameworkCore;

namespace stajapi.Models
{
    public class StajContext : DbContext
    {
        public StajContext(DbContextOptions<StajContext> options) : base(options) { }

        public DbSet<Musteri> Musteriler { get; set; }
        public DbSet<Calisan> Calisanlar { get; set; }
        public DbSet<KayitliKredi> KayitliKrediler { get; set; }
        public DbSet<FAQ> FAQs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Musteri>().ToTable("musteriler");
            modelBuilder.Entity<Calisan>().ToTable("calisanlar");
            modelBuilder.Entity<KayitliKredi>().ToTable("kayitli_krediler");
            modelBuilder.Entity<FAQ>().ToTable("faqs");
        }
    }
}
