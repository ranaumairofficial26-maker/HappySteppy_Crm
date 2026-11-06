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
    [Route("api/admin/homepage")]
    [Authorize(Policy = "Homepage.Manage")]
    public class HomepageController : ControllerBase
    {
        private readonly IHomepageService _homepageService;
        public HomepageController(IHomepageService homepageService) => _homepageService = homepageService;

        // Hero Slides
        [HttpGet("slides")]
        public async Task<IActionResult> GetSlides(CancellationToken ct) => Ok(await _homepageService.GetHeroSlidesAsync(ct));

        [HttpPost("slides")]
        public async Task<IActionResult> SaveSlide([FromBody] HeroSlideDto dto, CancellationToken ct) => Ok(await _homepageService.SaveHeroSlideAsync(dto, ct));

        [HttpDelete("slides/{id:guid}")]
        public async Task<IActionResult> DeleteSlide(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteHeroSlideAsync(id, ct) });

        // Banners
        [HttpGet("banners")]
        public async Task<IActionResult> GetBanners(CancellationToken ct) => Ok(await _homepageService.GetBannersAsync(ct));

        [HttpPost("banners")]
        public async Task<IActionResult> SaveBanner([FromBody] PromotionalBannerDto dto, CancellationToken ct) => Ok(await _homepageService.SaveBannerAsync(dto, ct));

        [HttpDelete("banners/{id:guid}")]
        public async Task<IActionResult> DeleteBanner(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteBannerAsync(id, ct) });

        // Style Cards
        [HttpGet("styles")]
        public async Task<IActionResult> GetStyles(CancellationToken ct) => Ok(await _homepageService.GetStyleCardsAsync(ct));

        [HttpPost("styles")]
        public async Task<IActionResult> SaveStyle([FromBody] StyleCardDto dto, CancellationToken ct) => Ok(await _homepageService.SaveStyleCardAsync(dto, ct));

        [HttpDelete("styles/{id:guid}")]
        public async Task<IActionResult> DeleteStyle(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteStyleCardAsync(id, ct) });

        // Flash Sale
        [HttpGet("flash-sale")]
        public async Task<IActionResult> GetFlashSale(CancellationToken ct) => Ok(await _homepageService.GetFlashSaleAsync(ct));

        [HttpPost("flash-sale")]
        public async Task<IActionResult> SaveFlashSale([FromBody] FlashSaleDto dto, CancellationToken ct) => Ok(await _homepageService.SaveFlashSaleAsync(dto, ct));

        // Testimonials
        [HttpGet("testimonials")]
        public async Task<IActionResult> GetTestimonials(CancellationToken ct) => Ok(await _homepageService.GetTestimonialsAsync(ct));

        [HttpPost("testimonials")]
        public async Task<IActionResult> SaveTestimonial([FromBody] TestimonialDto dto, CancellationToken ct) => Ok(await _homepageService.SaveTestimonialAsync(dto, ct));

        [HttpDelete("testimonials/{id:guid}")]
        public async Task<IActionResult> DeleteTestimonial(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteTestimonialAsync(id, ct) });

        // Brands
        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands(CancellationToken ct) => Ok(await _homepageService.GetBrandsAsync(ct));

        [HttpPost("brands")]
        public async Task<IActionResult> SaveBrand([FromBody] BrandDto dto, CancellationToken ct) => Ok(await _homepageService.SaveBrandAsync(dto, ct));

        [HttpDelete("brands/{id:guid}")]
        public async Task<IActionResult> DeleteBrand(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteBrandAsync(id, ct) });

        // Footer Links
        [HttpGet("footer-links")]
        public async Task<IActionResult> GetFooterLinks(CancellationToken ct) => Ok(await _homepageService.GetFooterLinksAsync(ct));

        [HttpPost("footer-links")]
        public async Task<IActionResult> SaveFooterLink([FromBody] FooterLinkDto dto, CancellationToken ct) => Ok(await _homepageService.SaveFooterLinkAsync(dto, ct));

        [HttpDelete("footer-links/{id:guid}")]
        public async Task<IActionResult> DeleteFooterLink(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteFooterLinkAsync(id, ct) });

        // Social Links
        [HttpGet("social-links")]
        public async Task<IActionResult> GetSocialLinks(CancellationToken ct) => Ok(await _homepageService.GetSocialLinksAsync(ct));

        [HttpPost("social-links")]
        public async Task<IActionResult> SaveSocialLink([FromBody] SocialLinkDto dto, CancellationToken ct) => Ok(await _homepageService.SaveSocialLinkAsync(dto, ct));

        [HttpDelete("social-links/{id:guid}")]
        public async Task<IActionResult> DeleteSocialLink(Guid id, CancellationToken ct) => Ok(new { success = await _homepageService.DeleteSocialLinkAsync(id, ct) });

        // Website Settings
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings(CancellationToken ct) => Ok(await _homepageService.GetSettingsAsync(ct));

        [HttpPost("settings")]
        public async Task<IActionResult> SaveSetting([FromBody] SettingItemDto dto, CancellationToken ct) => Ok(new { success = await _homepageService.SaveSettingAsync(dto.Key, dto.Value, ct) });
    }
}

