using System;
using System.Collections.Generic;

namespace HappySteppy.Application.DTOs
{
    // Auth
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public AdminUserProfileDto User { get; set; } = null!;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AdminUserProfileDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    // Catalog DTOs
    public class ProductDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int StockQuantity { get; set; }
        public string PrimaryImageUrl { get; set; } = string.Empty;
        public string? BadgeText { get; set; }
        public decimal Rating { get; set; }
        public int ReviewsCount { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsTrending { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public Guid? BrandId { get; set; }
        public string? BrandName { get; set; }
        public List<string> CategoryNames { get; set; } = new();
    }

    public class CreateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public decimal? CostPrice { get; set; }
        public int StockQuantity { get; set; } = 100;
        public string PrimaryImageUrl { get; set; } = string.Empty;
        public string? BadgeText { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsTrending { get; set; }
        public bool IsBestSeller { get; set; }
        public Guid? BrandId { get; set; }
        public List<Guid>? CategoryIds { get; set; }
    }

    public class CategoryDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? IconName { get; set; }
        public int SortOrder { get; set; }
        public bool ShowInSidebar { get; set; }
        public bool ShowOnHomepage { get; set; }
        public bool IsActive { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }

    public class BrandDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    // Homepage DTOs
    public class HeroSlideDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string DesktopImageUrl { get; set; } = string.Empty;
        public string? MobileImageUrl { get; set; }
        public string? PrimaryButtonText { get; set; }
        public string? PrimaryButtonUrl { get; set; }
        public string? SecondaryButtonText { get; set; }
        public string? SecondaryButtonUrl { get; set; }
        public string? BadgeText { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class BenefitCardDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class PromotionalBannerDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = "Modern Living Essentials";
        public string? Subtitle { get; set; } = "Stylish, functional and made for everyday comfort.";
        public string? Tag { get; set; } = "HOME REFRESH EVENT";
        public string? DiscountText { get; set; } = "50% OFF";
        public string? ButtonText { get; set; } = "Shop Now";
        public string? ButtonUrl { get; set; } = "/products";
        public string ImageUrl { get; set; } = "assets/images/home-refresh-banner-clean.jpg?v=4";
        public string LocationKey { get; set; } = "home-refresh";
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class StyleCardDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = "/products";
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class FlashSaleDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = "Flash Sale";
        public string? Subtitle { get; set; }
        public int DiscountPercentage { get; set; }
        public DateTime EndsAtUtc { get; set; }
        public bool IsActive { get; set; }
        public List<ProductDto> Products { get; set; } = new();
    }

    public class TestimonialDto
    {
        public Guid? Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerRole { get; set; } = "Verified Customer";
        public int Rating { get; set; } = 5;
        public string Comment { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public bool IsVerified { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class TrustStatisticDto
    {
        public Guid? Id { get; set; }
        public string? PreHeading { get; set; }
        public string MetricValue { get; set; } = "500,000+";
        public string Label { get; set; } = "Happy Shoppers";
        public string? IconName { get; set; } = "laurel-wreath";
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class HomepagePayloadDto
    {
        public List<HeroSlideDto> HeroSlides { get; set; } = new();
        public List<CategoryDto> Categories { get; set; } = new();
        public List<BenefitCardDto> Benefits { get; set; } = new();
        public List<ProductDto> TrendingProducts { get; set; } = new();
        public PromotionalBannerDto? PromotionalBanner { get; set; }
        public List<StyleCardDto> StyleCards { get; set; } = new();
        public FlashSaleDto? FlashSale { get; set; }
        public List<TestimonialDto> Testimonials { get; set; } = new();
        public TrustStatisticDto? TrustStatistic { get; set; }
        public List<BrandDto> Brands { get; set; } = new();
        public List<FooterLinkDto> FooterLinks { get; set; } = new();
        public List<SocialLinkDto> SocialLinks { get; set; } = new();
        public Dictionary<string, string> Settings { get; set; } = new();
    }

    public class FooterLinkDto
    {
        public Guid? Id { get; set; }
        public string ColumnName { get; set; } = "Shop";
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = "#";
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class SocialLinkDto
    {
        public Guid? Id { get; set; }
        public string Platform { get; set; } = string.Empty;
        public string Url { get; set; } = "#";
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class SettingItemDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalHeroSlides { get; set; }
        public int TotalStyleCards { get; set; }
        public int TotalTestimonials { get; set; }
        public int TotalBrands { get; set; }
    }
}
