using System;
using System.Collections.Generic;
using HappySteppy.Domain.Common;

namespace HappySteppy.Domain.Catalog
{
    public class Brand : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public int SortOrder { get; set; } = 0;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }

    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public Category? ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();

        public string? ImageUrl { get; set; }
        public string? IconName { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool ShowInSidebar { get; set; } = true;
        public bool ShowOnHomepage { get; set; } = true;

        public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    }

    public class Product : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public decimal? CostPrice { get; set; }
        
        public int StockQuantity { get; set; } = 0;
        public int LowStockThreshold { get; set; } = 5;

        public Guid? BrandId { get; set; }
        public Brand? Brand { get; set; }

        public string PrimaryImageUrl { get; set; } = string.Empty;
        public string? BadgeText { get; set; } // e.g. "HOT", "SALE", "NEW", "-25%"
        public decimal Rating { get; set; } = 5.0m;
        public int ReviewsCount { get; set; } = 0;

        public bool IsFeatured { get; set; } = false;
        public bool IsTrending { get; set; } = true;
        public bool IsBestSeller { get; set; } = false;
        public int SortOrder { get; set; } = 0;

        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
    }

    public class ProductImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public string ImageUrl { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }

    public class ProductCategory
    {
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}

