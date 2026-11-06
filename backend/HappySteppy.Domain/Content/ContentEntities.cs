using System;
using System.Collections.Generic;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Common;

namespace HappySteppy.Domain.Content
{
    public class HeroSlide : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string DesktopImageUrl { get; set; } = string.Empty;
        public string? MobileImageUrl { get; set; }
        public string? PrimaryButtonText { get; set; } = "Shop Now";
        public string? PrimaryButtonUrl { get; set; } = "/products";
        public string? SecondaryButtonText { get; set; } = "Learn More";
        public string? SecondaryButtonUrl { get; set; } = "/about";
        public string? BadgeText { get; set; } = "NEW COLLECTION";
        public int SortOrder { get; set; } = 0;
        public DateTime? StartAtUtc { get; set; }
        public DateTime? EndAtUtc { get; set; }
    }

    public class PromotionalBanner : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? DiscountText { get; set; }
        public string? ButtonText { get; set; } = "Discover Now";
        public string? ButtonUrl { get; set; } = "/products";
        public string ImageUrl { get; set; } = string.Empty;
        public string LocationKey { get; set; } = "home-refresh"; // key identifying placement
        public int SortOrder { get; set; } = 0;
    }

    public class HomepageSection : BaseEntity
    {
        public string SectionKey { get; set; } = string.Empty; // e.g., "hero", "benefits", "trending", "styles", "flash-sale", "testimonials", "brands"
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public bool IsVisible { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public string? CustomConfigJson { get; set; }
    }

    public class StyleCard : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = "/products";
        public int SortOrder { get; set; } = 0;
    }

    public class BenefitCard : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; } = 0;
    }

    public class FlashSale : BaseEntity
    {
        public string Title { get; set; } = "Flash Sale";
        public string? Subtitle { get; set; } = "Ends Soon";
        public int DiscountPercentage { get; set; } = 50;
        public DateTime EndsAtUtc { get; set; }
        
        public ICollection<FlashSaleProduct> Products { get; set; } = new List<FlashSaleProduct>();
    }

    public class FlashSaleProduct
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FlashSaleId { get; set; }
        public FlashSale FlashSale { get; set; } = null!;
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public decimal SalePrice { get; set; }
        public int QuantityLimit { get; set; } = 100;
        public int SoldQuantity { get; set; } = 0;
        public int SortOrder { get; set; } = 0;
    }

    public class Testimonial : BaseEntity
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerRole { get; set; } = "Verified Customer";
        public int Rating { get; set; } = 5;
        public string Comment { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public bool IsVerified { get; set; } = true;
        public int SortOrder { get; set; } = 0;
    }

    public class TrustStatistic : BaseEntity
    {
        public string MetricValue { get; set; } = "500,000+";
        public string Label { get; set; } = "Happy Shoppers";
        public string? PreHeading { get; set; } = "Loved by";
        public string? IconName { get; set; } = "laurel-wreath";
        public int SortOrder { get; set; } = 0;
    }

    public class NavigationItem : BaseEntity
    {
        public string Label { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public int SortOrder { get; set; } = 0;
        public string Position { get; set; } = "header"; // "header", "sidebar", "footer"
    }

    public class WebsiteSetting
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Group { get; set; } = "General"; // "General", "SEO", "Contact", "Social"
        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    }

    public class FooterLink : BaseEntity
    {
        public string ColumnName { get; set; } = "Shop"; // "Shop", "Help", "About"
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = "#";
        public int SortOrder { get; set; } = 0;
    }

    public class SocialLink : BaseEntity
    {
        public string Platform { get; set; } = string.Empty; // "Instagram", "Facebook", "YouTube", "TikTok", "X"
        public string Url { get; set; } = "#";
        public string IconName { get; set; } = string.Empty;
        public int SortOrder { get; set; } = 0;
    }

    public class MediaAsset
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FileName { get; set; } = string.Empty;
        public string StoragePath { get; set; } = string.Empty;
        public string PublicUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string? AltText { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}

