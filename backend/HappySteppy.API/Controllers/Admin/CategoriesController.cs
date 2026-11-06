using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappySteppy.Application.DTOs;
using HappySteppy.Application.Interfaces.Services;

namespace HappySteppy.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/categories")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoryService) => _categoryService = categoryService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false, CancellationToken ct = default)
        {
            var list = await _categoryService.GetAllAsync(activeOnly, ct);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var c = await _categoryService.GetByIdAsync(id, ct);
            if (c == null) return NotFound();
            return Ok(c);
        }

        [HttpPost]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto, CancellationToken ct)
        {
            var created = await _categoryService.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CategoryDto dto, CancellationToken ct)
        {
            var updated = await _categoryService.UpdateAsync(id, dto, ct);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            var success = await _categoryService.DeleteAsync(id, ct);
            return Ok(new { success });
        }
    }
}

