using System;
using Microsoft.EntityFrameworkCore;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Common;
using HappySteppy.Domain.Content;
using HappySteppy.Domain.Identity;

namespace HappySteppy.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Identity
        public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        // Catalog
        public DbSet<Brand> Brands => Set<Brand>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();

        // Content
        public DbSet<HeroSlide> HeroSlides => Set<HeroSlide>();
        public DbSet<PromotionalBanner> PromotionalBanners => Set<PromotionalBanner>();
        public DbSet<HomepageSection> HomepageSections => Set<HomepageSection>();
        public DbSet<StyleCard> StyleCards => Set<StyleCard>();
        public DbSet<BenefitCard> BenefitCards => Set<BenefitCard>();
        public DbSet<FlashSale> FlashSales => Set<FlashSale>();
        public DbSet<FlashSaleProduct> FlashSaleProducts => Set<FlashSaleProduct>();
        public DbSet<Testimonial> Testimonials => Set<Testimonial>();
        public DbSet<TrustStatistic> TrustStatistics => Set<TrustStatistic>();
        public DbSet<NavigationItem> NavigationItems => Set<NavigationItem>();

        // Settings & Media
        public DbSet<WebsiteSetting> WebsiteSettings => Set<WebsiteSetting>();
        public DbSet<FooterLink> FooterLinks => Set<FooterLink>();
        public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
        public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global Query Filters for Soft Deletes
            modelBuilder.Entity<AdminUser>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Brand>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<HeroSlide>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<PromotionalBanner>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<HomepageSection>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<StyleCard>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<BenefitCard>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FlashSale>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Testimonial>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TrustStatistic>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<NavigationItem>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FooterLink>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SocialLink>().HasQueryFilter(e => !e.IsDeleted);

            // AdminUser
            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).HasMaxLength(255).IsRequired();
                entity.Property(u => u.Role).HasConversion<string>();
            });

            // RefreshToken
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasIndex(r => r.TokenHash);
                entity.HasOne(r => r.AdminUser)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(r => r.AdminUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Brand
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasIndex(b => b.Slug).IsUnique();
                entity.Property(b => b.Name).HasMaxLength(150).IsRequired();
                entity.Property(b => b.Slug).HasMaxLength(150).IsRequired();
            });

            // Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Slug).IsUnique();
                entity.Property(c => c.Name).HasMaxLength(150).IsRequired();
                entity.Property(c => c.Slug).HasMaxLength(150).IsRequired();

                entity.HasOne(c => c.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(p => p.Slug).IsUnique();
                entity.HasIndex(p => p.Sku).IsUnique();
                entity.Property(p => p.Name).HasMaxLength(255).IsRequired();
                entity.Property(p => p.Slug).HasMaxLength(255).IsRequired();
                entity.Property(p => p.Sku).HasMaxLength(100).IsRequired();
                entity.Property(p => p.Price).HasPrecision(18, 2);
                entity.Property(p => p.CompareAtPrice).HasPrecision(18, 2);
                entity.Property(p => p.CostPrice).HasPrecision(18, 2);
                entity.Property(p => p.Rating).HasPrecision(3, 2);

                entity.HasOne(p => p.Brand)
                      .WithMany(b => b.Products)
                      .HasForeignKey(p => p.BrandId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ProductCategory Many-to-Many
            modelBuilder.Entity<ProductCategory>(entity =>
            {
                entity.HasKey(pc => new { pc.ProductId, pc.CategoryId });

                entity.HasOne(pc => pc.Product)
                      .WithMany(p => p.ProductCategories)
                      .HasForeignKey(pc => pc.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pc => pc.Category)
                      .WithMany(c => c.ProductCategories)
                      .HasForeignKey(pc => pc.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ProductImage
            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasOne(pi => pi.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(pi => pi.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // FlashSaleProduct
            modelBuilder.Entity<FlashSaleProduct>(entity =>
            {
                entity.Property(f => f.SalePrice).HasPrecision(18, 2);

                entity.HasOne(f => f.FlashSale)
                      .WithMany(fs => fs.Products)
                      .HasForeignKey(f => f.FlashSaleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.Product)
                      .WithMany()
                      .HasForeignKey(f => f.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // WebsiteSetting
            modelBuilder.Entity<WebsiteSetting>(entity =>
            {
                entity.HasIndex(s => s.Key).IsUnique();
                entity.Property(s => s.Key).HasMaxLength(100).IsRequired();
            });
        }
    }
}

