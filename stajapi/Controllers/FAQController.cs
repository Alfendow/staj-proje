using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stajapi.Models;

namespace stajapi.Controllers
{
    [ApiController]
    [Route("api/faq")]
    public class FAQController : ControllerBase
    {
        private readonly StajContext _context;

        public FAQController(StajContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFAQs()
        {
            var faqs = await _context.FAQs
                .Where(f => f.IsActive)
                .OrderBy(f => f.Category)
                .ThenBy(f => f.OrderIndex)
                .ToListAsync();
            return Ok(faqs);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetFAQsByCategory(string category)
        {
            var faqs = await _context.FAQs
                .Where(f => f.IsActive && f.Category == category)
                .OrderBy(f => f.OrderIndex)
                .ToListAsync();
            return Ok(faqs);
        }

        [HttpPost]
        public async Task<IActionResult> AddFAQ(FAQ faq)
        {
            _context.FAQs.Add(faq);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllFAQs), new { id = faq.Id }, faq);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFAQ(int id, FAQ faq)
        {
            if (id != faq.Id)
            {
                return BadRequest();
            }

            _context.Entry(faq).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FAQExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFAQ(int id)
        {
            var faq = await _context.FAQs.FindAsync(id);
            if (faq == null)
            {
                return NotFound();
            }

            faq.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FAQExists(int id)
        {
            return _context.FAQs.Any(e => e.Id == id);
        }
    }
}
