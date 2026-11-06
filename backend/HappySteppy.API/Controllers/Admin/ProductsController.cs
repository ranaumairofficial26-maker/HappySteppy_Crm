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
    [Route("api/admin/products")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        public ProductsController(IProductService productService) => _productService = productService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false, CancellationToken ct = default)
        {
            var list = await _productService.GetAllAsync(activeOnly, ct);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var p = await _productService.GetByIdAsync(id, ct);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpPost]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest req, CancellationToken ct)
        {
            var created = await _productService.CreateAsync(req, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateProductRequest req, CancellationToken ct)
        {
            var updated = await _productService.UpdateAsync(id, req, ct);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "Products.Write")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            var success = await _productService.DeleteAsync(id, ct);
            return Ok(new { success });
        }
    }
}

