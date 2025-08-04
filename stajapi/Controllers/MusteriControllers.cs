using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stajapi.Models;

namespace stajapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusteriController : ControllerBase
    {
        private readonly StajContext _context;

        public MusteriController(StajContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Musteriler.ToListAsync();
            return Ok(data);
        }

        [HttpDelete("tckn/{tckn}")]
        public async Task<IActionResult> DeleteMusteriByTckn(string tckn, [FromHeader(Name = "X-Admin-Email")] string adminEmail)
        {
            // Adım 1: İstek yapan kişinin admin olup olmadığını kontrol et
            var admin = await _context.Calisanlar.FirstOrDefaultAsync(c => c.Email == adminEmail && c.Rol == "Admin");
            if (admin == null)
            {
                return Forbid(); // 403 Forbidden - Yetkiniz yok
            }

            // Adım 2: Yetkisi varsa, silme işlemini yap
            var musteri = await _context.Musteriler.FirstOrDefaultAsync(m => m.TCKN == tckn);
            if (musteri == null)
                return NotFound();

            _context.Musteriler.Remove(musteri);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("tckn/{tckn}")]
        public async Task<IActionResult> GetByTckn(string tckn)
        {
            var musteri = await _context.Musteriler.FirstOrDefaultAsync(m => m.TCKN == tckn);
            if (musteri == null) return NotFound();
            return Ok(musteri);
        }

        [HttpPut("tckn/{tckn}")]
        public async Task<IActionResult> UpdateByTckn(string tckn, Musteri updated, [FromHeader(Name = "X-Admin-Email")] string adminEmail)
        {
            // Adım 1: İstek yapan kişinin admin olup olmadığını kontrol et
            var admin = await _context.Calisanlar.FirstOrDefaultAsync(c => c.Email == adminEmail && c.Rol == "Admin");
            if (admin == null)
            {
                return Forbid(); // 403 Forbidden - Yetkiniz yok
            }
            
            // Adım 2: Yetkisi varsa, güncelleme işlemini yap
            var musteri = await _context.Musteriler.FirstOrDefaultAsync(m => m.TCKN == tckn);
            if (musteri == null) return NotFound();

            musteri.Ad = updated.Ad;
            musteri.Soyad = updated.Soyad;
            musteri.Telefon = updated.Telefon;
            musteri.Email = updated.Email;
            if (!string.IsNullOrWhiteSpace(updated.Sifre))
            {
                musteri.Sifre = updated.Sifre;
            }

            await _context.SaveChangesAsync();
            return Ok(musteri);
        }
    
    }
}
