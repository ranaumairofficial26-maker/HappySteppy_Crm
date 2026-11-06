using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HappySteppy.Application.DTOs;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Content;
using HappySteppy.Domain.Identity;

namespace HappySteppy.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<(LoginResponse? Response, string? RefreshToken, string? Error)> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
        Task<(LoginResponse? Response, string? NewRefreshToken, string? Error)> RefreshTokenAsync(string oldRefreshToken, string? ipAddress, CancellationToken ct = default);
        Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default);
        Task<AdminUserProfileDto?> GetCurrentUserProfileAsync(Guid userId, CancellationToken ct = default);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
    }

    public interface IProductService
    {
        Task<List<ProductDto>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
        Task<ProductDto?> UpdateAsync(Guid id, CreateProductRequest request, CancellationToken ct = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    }

    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<CategoryDto> CreateAsync(CategoryDto dto, CancellationToken ct = default);
        Task<CategoryDto?> UpdateAsync(Guid id, CategoryDto dto, CancellationToken ct = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    }

    public interface IHomepageService
    {
        Task<HomepagePayloadDto> GetPublicHomepageDataAsync(CancellationToken ct = default);

        // Slides
        Task<List<HeroSlideDto>> GetHeroSlidesAsync(CancellationToken ct = default);
        Task<HeroSlideDto> SaveHeroSlideAsync(HeroSlideDto dto, CancellationToken ct = default);
        Task<bool> DeleteHeroSlideAsync(Guid id, CancellationToken ct = default);

        // Banners
        Task<List<PromotionalBannerDto>> GetBannersAsync(CancellationToken ct = default);
        Task<PromotionalBannerDto> SaveBannerAsync(PromotionalBannerDto dto, CancellationToken ct = default);
        Task<bool> DeleteBannerAsync(Guid id, CancellationToken ct = default);

        // Styles
        Task<List<StyleCardDto>> GetStyleCardsAsync(CancellationToken ct = default);
        Task<StyleCardDto> SaveStyleCardAsync(StyleCardDto dto, CancellationToken ct = default);
        Task<bool> DeleteStyleCardAsync(Guid id, CancellationToken ct = default);

        // Flash Sale
        Task<FlashSaleDto?> GetFlashSaleAsync(CancellationToken ct = default);
        Task<FlashSaleDto> SaveFlashSaleAsync(FlashSaleDto dto, CancellationToken ct = default);

        // Testimonials
        Task<List<TestimonialDto>> GetTestimonialsAsync(CancellationToken ct = default);
        Task<TestimonialDto> SaveTestimonialAsync(TestimonialDto dto, CancellationToken ct = default);
        Task<bool> DeleteTestimonialAsync(Guid id, CancellationToken ct = default);

        // Brands
        Task<List<BrandDto>> GetBrandsAsync(CancellationToken ct = default);
        Task<BrandDto> SaveBrandAsync(BrandDto dto, CancellationToken ct = default);
        Task<bool> DeleteBrandAsync(Guid id, CancellationToken ct = default);

        // Footer Links
        Task<List<FooterLinkDto>> GetFooterLinksAsync(CancellationToken ct = default);
        Task<FooterLinkDto> SaveFooterLinkAsync(FooterLinkDto dto, CancellationToken ct = default);
        Task<bool> DeleteFooterLinkAsync(Guid id, CancellationToken ct = default);

        // Social Links
        Task<List<SocialLinkDto>> GetSocialLinksAsync(CancellationToken ct = default);
        Task<SocialLinkDto> SaveSocialLinkAsync(SocialLinkDto dto, CancellationToken ct = default);
        Task<bool> DeleteSocialLinkAsync(Guid id, CancellationToken ct = default);

        // Website Settings
        Task<Dictionary<string, string>> GetSettingsAsync(CancellationToken ct = default);
        Task<bool> SaveSettingAsync(string key, string value, CancellationToken ct = default);
    }

    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default);
    }
}

