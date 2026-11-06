using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HappySteppy.Application.Interfaces.Services;

namespace HappySteppy.API.Controllers.Public
{
    [ApiController]
    [Route("api/public")]
    public class PublicController : ControllerBase
    {
        private readonly IHomepageService _homepageService;
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;

        public PublicController(
            IHomepageService homepageService,
            IProductService productService,
            ICategoryService categoryService)
        {
            _homepageService = homepageService;
            _productService = productService;
            _categoryService = categoryService;
        }

        [HttpGet("homepage")]
        public async Task<IActionResult> GetHomepageData(CancellationToken ct)
        {
            var data = await _homepageService.GetPublicHomepageDataAsync(ct);
            return Ok(data);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] bool activeOnly = true, CancellationToken ct = default)
        {
            var list = await _productService.GetAllAsync(activeOnly, ct);
            return Ok(list);
        }

        [HttpGet("products/{id:guid}")]
        public async Task<IActionResult> GetProductById(Guid id, CancellationToken ct)
        {
            var p = await _productService.GetByIdAsync(id, ct);
            if (p == null) return NotFound(new { message = "Product not found." });
            return Ok(p);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories(CancellationToken ct)
        {
            var list = await _categoryService.GetAllAsync(true, ct);
            return Ok(list);
        }

        [HttpGet("flash-sales")]
        public async Task<IActionResult> GetActiveFlashSale(CancellationToken ct)
        {
            var sale = await _homepageService.GetFlashSaleAsync(ct);
            return Ok(sale);
        }
    }
}

