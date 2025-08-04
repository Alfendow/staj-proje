using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stajapi.Models;

namespace stajapi.Controllers
{
    [EnableRateLimiting("giris")]
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly StajContext _context;

        public AuthController(StajContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(Musteri musteri)
        {
            // TCKN veya Email daha önce alınmış mı kontrol et
            if (await _context.Musteriler.AnyAsync(m => m.TCKN == musteri.TCKN || m.Email == musteri.Email))
            {
                return BadRequest("Bu TCKN veya E-posta adresi zaten kayıtlı.");
            }

            // Yeni müşteri için hesap numarası oluştur
            string hesapNo;
            do {
                hesapNo = new Random().Next(1000000000, 2000000000).ToString();
            } while (await _context.Musteriler.AnyAsync(m => m.HesapNumarasi == hesapNo));

            musteri.HesapNumarasi = hesapNo;

            _context.Musteriler.Add(musteri);
            await _context.SaveChangesAsync();
            return Ok(musteri);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var musteri = await _context.Musteriler
                .FirstOrDefaultAsync(m => m.Email == login.Email && m.Sifre == login.Sifre);
            
            if (musteri == null)
            {
                return Unauthorized("Geçersiz e-posta veya şifre.");
            }
            return Ok(musteri);
        }

        [HttpPost("admin-login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginRequest login)
        {
            // Çalışanı email ve şifresine göre bul.
            var calisan = await _context.Calisanlar
                .FirstOrDefaultAsync(c => c.Email == login.Email && c.Sifre == login.Sifre);

            // Çalışan bulunamazsa, yetkisiz hatası döndür.
            if (calisan == null)
            {
                return Unauthorized("Geçersiz çalışan bilgileri.");
            }

            // Çalışanın rolünün "Admin" olup olmadığını kontrol et.
            bool isAdmin = calisan.Rol.Trim().ToLower() == "admin";


            // Girişin başarılı olduğunu, çalışanın rolünü ve admin olup olmadığını bildir.
            return Ok(new
            {
                message = "Çalışan girişi başarılı.",
                email = calisan.Email,
                rol = calisan.Rol,
                isAdmin = isAdmin
            });
        }

    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty;
    }
}