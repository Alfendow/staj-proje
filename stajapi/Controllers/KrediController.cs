using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using stajapi.Models;

namespace stajapi.Controllers
{
    [EnableRateLimiting("sabit")]
    [ApiController]
    [Route("api/[controller]")]
    public class KrediController : ControllerBase
    {
        private readonly KrediMotoru _krediMotoru;

        public KrediController()
        {
            _krediMotoru = new KrediMotoru();
        }

        [HttpPost("hesapla")]
        public ActionResult<KrediSonuc> PostHesapla(KrediIstek istek)
        {
            if (istek.Tutar <= 0 || istek.Vade <= 0)
            {
                return BadRequest("Lütfen geçerli Tutar ve Vade giriniz.");
            }
            var sonuc = _krediMotoru.KrediHesapla(istek);
            return Ok(sonuc);
        }
    }
}