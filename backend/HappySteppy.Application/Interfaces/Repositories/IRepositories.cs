using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Content;
using HappySteppy.Domain.Identity;

namespace HappySteppy.Application.Interfaces.Repositories
{
    public interface IAdminUserRepository
    {
        Task<AdminUser?> GetByEmailAsync(string email, CancellationToken ct = default);
        Task<AdminUser?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<List<AdminUser>> GetAllAsync(CancellationToken ct = default);
        Task AddAsync(AdminUser user, CancellationToken ct = default);
        Task UpdateAsync(AdminUser user, CancellationToken ct = default);
        Task SaveRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
        Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash, CancellationToken ct = default);
        Task RevokeRefreshTokenAsync(string tokenHash, string? replacedByTokenHash = null, CancellationToken ct = default);
        Task RevokeAllUserRefreshTokensAsync(Guid userId, CancellationToken ct = default);
    }

    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
        Task<List<Product>> GetTrendingAsync(int count = 4, CancellationToken ct = default);
        Task<List<Product>> GetFeaturedAsync(int count = 4, CancellationToken ct = default);
        Task AddAsync(Product product, CancellationToken ct = default);
        Task UpdateAsync(Product product, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
        Task<bool> ExistsSkuAsync(string sku, Guid? excludeId = null, CancellationToken ct = default);
    }

    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
        Task AddAsync(Category category, CancellationToken ct = default);
        Task UpdateAsync(Category category, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
    }

    public interface IHomepageRepository
    {
        Task<List<HeroSlide>> GetHeroSlidesAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<HeroSlide?> GetHeroSlideByIdAsync(Guid id, CancellationToken ct = default);
        Task AddHeroSlideAsync(HeroSlide slide, CancellationToken ct = default);
        Task UpdateHeroSlideAsync(HeroSlide slide, CancellationToken ct = default);
        Task DeleteHeroSlideAsync(Guid id, CancellationToken ct = default);

        Task<List<BenefitCard>> GetBenefitCardsAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<BenefitCard?> GetBenefitCardByIdAsync(Guid id, CancellationToken ct = default);
        Task AddBenefitCardAsync(BenefitCard card, CancellationToken ct = default);
        Task UpdateBenefitCardAsync(BenefitCard card, CancellationToken ct = default);
        Task DeleteBenefitCardAsync(Guid id, CancellationToken ct = default);

        Task<List<PromotionalBanner>> GetBannersAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<PromotionalBanner?> GetBannerByIdAsync(Guid id, CancellationToken ct = default);
        Task AddBannerAsync(PromotionalBanner banner, CancellationToken ct = default);
        Task UpdateBannerAsync(PromotionalBanner banner, CancellationToken ct = default);
        Task DeleteBannerAsync(Guid id, CancellationToken ct = default);

        Task<List<StyleCard>> GetStyleCardsAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<StyleCard?> GetStyleCardByIdAsync(Guid id, CancellationToken ct = default);
        Task AddStyleCardAsync(StyleCard card, CancellationToken ct = default);
        Task UpdateStyleCardAsync(StyleCard card, CancellationToken ct = default);
        Task DeleteStyleCardAsync(Guid id, CancellationToken ct = default);

        Task<FlashSale?> GetActiveFlashSaleAsync(CancellationToken ct = default);
        Task<FlashSale?> GetFlashSaleByIdAsync(Guid id, CancellationToken ct = default);
        Task SaveFlashSaleAsync(FlashSale sale, CancellationToken ct = default);

        Task<List<Testimonial>> GetTestimonialsAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<Testimonial?> GetTestimonialByIdAsync(Guid id, CancellationToken ct = default);
        Task AddTestimonialAsync(Testimonial t, CancellationToken ct = default);
        Task UpdateTestimonialAsync(Testimonial t, CancellationToken ct = default);
        Task DeleteTestimonialAsync(Guid id, CancellationToken ct = default);

        Task<List<TrustStatistic>> GetTrustStatisticsAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<TrustStatistic?> GetTrustStatisticByIdAsync(Guid id, CancellationToken ct = default);
        Task AddTrustStatisticAsync(TrustStatistic s, CancellationToken ct = default);
        Task UpdateTrustStatisticAsync(TrustStatistic s, CancellationToken ct = default);
        Task DeleteTrustStatisticAsync(Guid id, CancellationToken ct = default);

        Task<List<Brand>> GetBrandsAsync(bool activeOnly = false, CancellationToken ct = default);
        Task<Brand?> GetBrandByIdAsync(Guid id, CancellationToken ct = default);
        Task AddBrandAsync(Brand brand, CancellationToken ct = default);
        Task UpdateBrandAsync(Brand brand, CancellationToken ct = default);
        Task DeleteBrandAsync(Guid id, CancellationToken ct = default);
    }

    public interface ISettingsRepository
    {
        Task<List<WebsiteSetting>> GetAllSettingsAsync(CancellationToken ct = default);
        Task<WebsiteSetting?> GetSettingByKeyAsync(string key, CancellationToken ct = default);
        Task SaveSettingAsync(string key, string value, string group = "General", string? description = null, CancellationToken ct = default);
        Task<List<FooterLink>> GetFooterLinksAsync(bool activeOnly = false, CancellationToken ct = default);
        Task SaveFooterLinkAsync(FooterLink link, CancellationToken ct = default);
        Task DeleteFooterLinkAsync(Guid id, CancellationToken ct = default);
        Task<List<SocialLink>> GetSocialLinksAsync(bool activeOnly = false, CancellationToken ct = default);
        Task SaveSocialLinkAsync(SocialLink link, CancellationToken ct = default);
        Task DeleteSocialLinkAsync(Guid id, CancellationToken ct = default);
    }

    public interface IMediaRepository
    {
        Task<List<MediaAsset>> GetAllAsync(CancellationToken ct = default);
        Task<MediaAsset?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task AddAsync(MediaAsset asset, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
    }
}

