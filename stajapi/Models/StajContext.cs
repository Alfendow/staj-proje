using Microsoft.EntityFrameworkCore;

namespace stajapi.Models
{
    public class StajContext : DbContext
    {
        public StajContext(DbContextOptions<StajContext> options) : base(options) { }

        public DbSet<Musteri> Musteriler { get; set; }
        public DbSet<Calisan> Calisanlar { get; set; }
        public DbSet<KayitliKredi> KayitliKrediler { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Musteri>().ToTable("musteri");
            modelBuilder.Entity<Calisan>().ToTable("calisan");
            modelBuilder.Entity<KayitliKredi>().ToTable("kayitlikredi");
        }
    }
}
