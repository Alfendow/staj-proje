using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stajapi.Models;

namespace stajapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalisanlarController : ControllerBase
    {
        private readonly StajContext _context;
        public CalisanlarController(StajContext context)
        {
            _context = context;
        }

        // Tüm çalışanları listele
        [HttpGet]
        public async Task<IActionResult> GetCalisanlar()
        {
            return Ok(await _context.Calisanlar.ToListAsync());
        }

        // Yeni çalışan ekle
        [HttpPost]
        public async Task<IActionResult> AddCalisan(Calisan calisan)
        {
            if (await _context.Calisanlar.AnyAsync(c => c.Email == calisan.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");
            }
            _context.Calisanlar.Add(calisan);
            await _context.SaveChangesAsync();
            return Ok(calisan);
        }

        // Çalışan sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCalisan(int id)
        {
            var calisan = await _context.Calisanlar.FindAsync(id);
            if (calisan == null) return NotFound();
            _context.Calisanlar.Remove(calisan);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}