// stajapi.Controllers.KrediKayitController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stajapi.Models;
using System.Text.Json;

namespace stajapi.Controllers
{
    [ApiController]
    [Route("api/krediler")]
    public class KrediKayitController : ControllerBase
    {
        private readonly StajContext _context;
        private readonly KrediMotoru _krediMotoru;

        public KrediKayitController(StajContext context)
        {
            _context = context;
            _krediMotoru = new KrediMotoru();
        }

        // Müşterinin tüm kayıtlı kredilerini getir
        [HttpGet("musteri/{musteriId}")]
        public async Task<IActionResult> GetKredilerByMusteri(int musteriId)
        {
            var krediler = await _context.KayitliKrediler
                .Where(k => k.MusteriId == musteriId)
                .OrderByDescending(k => k.KayitTarihi)
                .ToListAsync();

            return Ok(krediler);
        }

        // Adminin, bir müşterinin kredilerini görüntülemesi
        [HttpGet("admin/musteri/{musteriId}")]
        public async Task<IActionResult> AdminGetKredilerByMusteri(int musteriId)
        {
            var krediler = await _context.KayitliKrediler
               .Where(k => k.MusteriId == musteriId)
               .OrderByDescending(k => k.KayitTarihi)
               .ToListAsync();

            return Ok(krediler);
        }

        // Müşteri için yeni kredi planı kaydet
        [HttpPost]
        public async Task<IActionResult> KaydetKredi(KayitliKredi istek)
        {
            istek.KayitTarihi = DateTime.Now;
            _context.KayitliKrediler.Add(istek);
            await _context.SaveChangesAsync();
            return Ok(istek);
        }

        // Müşterinin bir kredi planını güncellemesi
        [HttpPut("{id}")]
        public async Task<IActionResult> GuncelleKredi(int id, KrediIstek guncelIstek)
        {
            var mevcutKayit = await _context.KayitliKrediler.FindAsync(id);
            if (mevcutKayit == null)
            {
                return NotFound();
            }

            // Yeni isteğe göre sonucu tekrar hesapla
            var yeniSonuc = _krediMotoru.KrediHesapla(guncelIstek);

            mevcutKayit.IstekVerisi = JsonSerializer.Serialize(guncelIstek);
            mevcutKayit.SonucVerisi = JsonSerializer.Serialize(yeniSonuc);
            mevcutKayit.GuncellemeTarihi = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(mevcutKayit);
        }

        // Bu metodu KrediKayitController sınıfınızın içine ekleyin.

        [HttpDelete("{id}")]
        public async Task<IActionResult> SilKredi(int id)
        {
            // Önce silinecek kaydı ID'sine göre veritabanında bul.
            var kayit = await _context.KayitliKrediler.FindAsync(id);

            // Eğer kayıt bulunamazsa, "Bulunamadı" hatası döndür.
            if (kayit == null)
            {
                return NotFound();
            }

            // Kaydı veritabanından sil.
            _context.KayitliKrediler.Remove(kayit);
            await _context.SaveChangesAsync();

            // İşlem başarılı olduğunda "NoContent" (İçerik Yok) yanıtı döndür.
            // Bu, silme işlemlerinde standart bir yaklaşımdır.
            return NoContent();
        }

    }
}