using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Content;
using HappySteppy.Domain.Identity;

namespace HappySteppy.Infrastructure.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            // 1. SuperAdmin
            if (!await context.AdminUsers.AnyAsync(u => u.Email == "admin@happysteppy.com"))
            {
                var admin = new AdminUser
                {
                    Email = "admin@happysteppy.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                    FirstName = "Super",
                    LastName = "Admin",
                    Role = AdminRoleType.SuperAdmin,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };
                context.AdminUsers.Add(admin);
            }

            // 2. Categories
            if (!await context.Categories.AnyAsync())
            {
                var tech = new Category { Name = "Tech Lover", Slug = "tech-lover", Description = "Smart & connected gadgets", ShowInSidebar = true, ShowOnHomepage = true, SortOrder = 1 };
                var fashion = new Category { Name = "Modern Fashion", Slug = "modern-fashion", Description = "Trendy & versatile styles", ShowInSidebar = true, ShowOnHomepage = true, SortOrder = 2 };
                var home = new Category { Name = "Home Vibes", Slug = "home-vibes", Description = "Cozy & stylish living", ShowInSidebar = true, ShowOnHomepage = true, SortOrder = 3 };
                var active = new Category { Name = "Active Life", Slug = "active-life", Description = "Fit, strong & healthy essentials", ShowInSidebar = true, ShowOnHomepage = true, SortOrder = 4 };

                context.Categories.AddRange(tech, fashion, home, active);
                await context.SaveChangesAsync();
            }

            // 3. Brands
            if (!await context.Brands.AnyAsync())
            {
                var brands = new List<Brand>
                {
                    new Brand { Name = "NovaTech", Slug = "novatech", SortOrder = 1 },
                    new Brand { Name = "UrbanFit", Slug = "urbanfit", SortOrder = 2 },
                    new Brand { Name = "HomeNest", Slug = "homenest", SortOrder = 3 },
                    new Brand { Name = "PureCare", Slug = "purecare", SortOrder = 4 },
                    new Brand { Name = "PlayZone", Slug = "playzone", SortOrder = 5 }
                };
                context.Brands.AddRange(brands);
                await context.SaveChangesAsync();
            }

            // 4. Products
            if (!await context.Products.AnyAsync())
            {
                var brandNova = await context.Brands.FirstOrDefaultAsync(b => b.Slug == "novatech");
                var catTech = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "tech-lover");

                var p1 = new Product
                {
                    Name = "EchoFit Pro Wireless Earbuds",
                    Slug = "echofit-pro-wireless-earbuds",
                    Sku = "ECH-EAR-001",
                    ShortDescription = "Active noise cancelling with crystal clear sound",
                    Price = 79.99m,
                    CompareAtPrice = 119.99m,
                    PrimaryImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
                    BadgeText = "HOT",
                    Rating = 4.9m,
                    ReviewsCount = 142,
                    IsTrending = true,
                    IsFeatured = true,
                    StockQuantity = 85,
                    BrandId = brandNova?.Id
                };

                var p2 = new Product
                {
                    Name = "AeroPulse Runner Pro Sneaker",
                    Slug = "aeropulse-runner-pro-sneaker",
                    Sku = "AER-RUN-002",
                    ShortDescription = "Breathable lightweight running shoes for ultimate comfort",
                    Price = 129.50m,
                    CompareAtPrice = 160.00m,
                    PrimaryImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
                    BadgeText = "-20%",
                    Rating = 4.8m,
                    ReviewsCount = 98,
                    IsTrending = true,
                    IsBestSeller = true,
                    StockQuantity = 40
                };

                var p3 = new Product
                {
                    Name = "Lumina Smart Ambient Lamp",
                    Slug = "lumina-smart-ambient-lamp",
                    Sku = "LUM-LMP-003",
                    ShortDescription = "Modern touch control ambient light with warm glow",
                    Price = 54.00m,
                    CompareAtPrice = 69.00m,
                    PrimaryImageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
                    BadgeText = "NEW",
                    Rating = 5.0m,
                    ReviewsCount = 63,
                    IsTrending = true,
                    StockQuantity = 110
                };

                var p4 = new Product
                {
                    Name = "Apex Ergonomic Smart Watch",
                    Slug = "apex-ergonomic-smart-watch",
                    Sku = "APX-WTC-004",
                    ShortDescription = "Heart rate, sleep tracking and ultra-long battery life",
                    Price = 89.00m,
                    CompareAtPrice = 120.00m,
                    PrimaryImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                    BadgeText = "SALE",
                    Rating = 4.7m,
                    ReviewsCount = 215,
                    IsTrending = true,
                    StockQuantity = 65
                };

                context.Products.AddRange(p1, p2, p3, p4);
                await context.SaveChangesAsync();

                if (catTech != null)
                {
                    context.ProductCategories.Add(new ProductCategory { ProductId = p1.Id, CategoryId = catTech.Id });
                    context.ProductCategories.Add(new ProductCategory { ProductId = p4.Id, CategoryId = catTech.Id });
                    await context.SaveChangesAsync();
                }
            }

            // 5. Hero Slides
            if (!await context.HeroSlides.AnyAsync())
            {
                var slide1 = new HeroSlide
                {
                    Title = "Upgrade Your Lifestyle",
                    Subtitle = "Discover top picks for home, tech, fashion and more",
                    Description = "Discover top picks for home, tech, fashion and more — all in one place.",
                    DesktopImageUrl = "assets/images/hero-upgrade-lifestyle.jpg?v=2",
                    PrimaryButtonText = "Shop the Collection",
                    PrimaryButtonUrl = "/products",
                    SecondaryButtonText = "Explore Deals",
                    SecondaryButtonUrl = "/deals",
                    BadgeText = "LIMITED TIME OFFER",
                    SortOrder = 1,
                    IsActive = true
                };
                context.HeroSlides.Add(slide1);
            }

            // 6. Benefits
            if (!await context.BenefitCards.AnyAsync())
            {
                var benefits = new List<BenefitCard>
                {
                    new BenefitCard { Title = "Free Delivery", Description = "Free shipping on all orders over $50 worldwide", IconName = "truck", SortOrder = 1 },
                    new BenefitCard { Title = "Secure Payment", Description = "100% secure payment with encrypted checkout", IconName = "shield-check", SortOrder = 2 },
                    new BenefitCard { Title = "30-Day Returns", Description = "Hassle-free 30 days money-back guarantee", IconName = "refresh-cw", SortOrder = 3 },
                    new BenefitCard { Title = "24/7 Support", Description = "Dedicated customer support ready to help", IconName = "headphones", SortOrder = 4 }
                };
                context.BenefitCards.AddRange(benefits);
            }

            // 7. Promotional Banners
            if (!await context.PromotionalBanners.AnyAsync())
            {
                var banner = new PromotionalBanner
                {
                    Title = "Modern Living Essentials",
                    Subtitle = "Stylish, functional and made for everyday comfort.",
                    DiscountText = "50% OFF",
                    ButtonText = "Shop Now",
                    ButtonUrl = "/products",
                    ImageUrl = "assets/images/home-refresh-banner-clean.jpg?v=4",
                    LocationKey = "home-refresh",
                    SortOrder = 1,
                    IsActive = true
                };
                context.PromotionalBanners.Add(banner);
            }

            // 8. Style Cards
            if (!await context.StyleCards.AnyAsync())
            {
                var styles = new List<StyleCard>
                {
                    new StyleCard { Title = "Tech Lover", Subtitle = "Smart & connected", ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", LinkUrl = "/products?style=tech", SortOrder = 1 },
                    new StyleCard { Title = "Modern Fashion", Subtitle = "Trendy & versatile", ImageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80", LinkUrl = "/products?style=fashion", SortOrder = 2 },
                    new StyleCard { Title = "Home Vibes", Subtitle = "Cozy & stylish", ImageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80", LinkUrl = "/products?style=home", SortOrder = 3 },
                    new StyleCard { Title = "Active Life", Subtitle = "Fit, strong & healthy", ImageUrl = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80", LinkUrl = "/products?style=active", SortOrder = 4 }
                };
                context.StyleCards.AddRange(styles);
            }

            // 9. Flash Sale
            if (!await context.FlashSales.AnyAsync())
            {
                var flash = new FlashSale
                {
                    Title = "Flash Sale",
                    Subtitle = "Ends in: 12 h 24 m 28 s",
                    DiscountPercentage = 50,
                    EndsAtUtc = DateTime.UtcNow.AddHours(12).AddMinutes(24).AddSeconds(28),
                    IsActive = true
                };
                context.FlashSales.Add(flash);
            }

            // 10. Testimonials
            if (!await context.Testimonials.AnyAsync())
            {
                var t = new Testimonial
                {
                    CustomerName = "Emily R.",
                    CustomerRole = "Verified Customer",
                    Rating = 5,
                    Comment = "Great quality, super fast delivery and an amazing shopping experience! Happy Steppy has become my go-to store.",
                    AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    IsVerified = true,
                    SortOrder = 1,
                    IsActive = true
                };
                context.Testimonials.Add(t);
            }

            // 11. Trust Statistics
            if (!await context.TrustStatistics.AnyAsync())
            {
                var stat = new TrustStatistic
                {
                    PreHeading = "Loved by",
                    MetricValue = "500,000+",
                    Label = "Happy Shoppers",
                    IconName = "laurel-wreath",
                    SortOrder = 1,
                    IsActive = true
                };
                context.TrustStatistics.Add(stat);
            }

            // 12. Footer Links
            if (!await context.FooterLinks.AnyAsync())
            {
                var fLinks = new List<FooterLink>
                {
                    new FooterLink { ColumnName = "Shop", Title = "All Products", Url = "/products", SortOrder = 1 },
                    new FooterLink { ColumnName = "Shop", Title = "Deals & Offers", Url = "/deals", SortOrder = 2 },
                    new FooterLink { ColumnName = "Shop", Title = "New Arrivals", Url = "/new", SortOrder = 3 },
                    new FooterLink { ColumnName = "Shop", Title = "Best Sellers", Url = "/bestsellers", SortOrder = 4 },

                    new FooterLink { ColumnName = "Help", Title = "Contact Us", Url = "/contact", SortOrder = 1 },
                    new FooterLink { ColumnName = "Help", Title = "FAQs", Url = "/faq", SortOrder = 2 },
                    new FooterLink { ColumnName = "Help", Title = "Shipping & Delivery", Url = "/shipping", SortOrder = 3 },
                    new FooterLink { ColumnName = "Help", Title = "Returns & Refunds", Url = "/returns", SortOrder = 4 },

                    new FooterLink { ColumnName = "About", Title = "Our Story", Url = "/about", SortOrder = 1 },
                    new FooterLink { ColumnName = "About", Title = "Careers", Url = "/careers", SortOrder = 2 },
                    new FooterLink { ColumnName = "About", Title = "Press", Url = "/press", SortOrder = 3 },
                    new FooterLink { ColumnName = "About", Title = "Blog", Url = "/blog", SortOrder = 4 }
                };
                context.FooterLinks.AddRange(fLinks);
            }

            // 13. Social Links
            if (!await context.SocialLinks.AnyAsync())
            {
                var socials = new List<SocialLink>
                {
                    new SocialLink { Platform = "WhatsApp", Url = "https://wa.me/923174641903", IconName = "whatsapp", SortOrder = 1 },
                    new SocialLink { Platform = "Instagram", Url = "https://www.instagram.com/happysteppy01", IconName = "instagram", SortOrder = 2 },
                    new SocialLink { Platform = "Facebook", Url = "https://www.facebook.com/happysteppyltd", IconName = "facebook", SortOrder = 3 },
                    new SocialLink { Platform = "TikTok", Url = "https://www.tiktok.com/@happysteppy.pk", IconName = "tiktok", SortOrder = 4 },
                    new SocialLink { Platform = "YouTube", Url = "https://youtube.com", IconName = "youtube", SortOrder = 5 }
                };
                context.SocialLinks.AddRange(socials);
            }

            // 14. Website Settings
            if (!await context.WebsiteSettings.AnyAsync())
            {
                var settings = new List<WebsiteSetting>
                {
                    new WebsiteSetting { Key = "SiteName", Value = "Happy Steppy", Group = "General", Description = "Main site title" },
                    new WebsiteSetting { Key = "SiteTagline", Value = "Step For A Better Body And Mind", Group = "General", Description = "Site tagline" },
                    new WebsiteSetting { Key = "ContactEmail", Value = "support@happysteppy.com", Group = "Contact", Description = "Customer support email" },
                    new WebsiteSetting { Key = "ContactPhone", Value = "+92 317 4641903", Group = "Contact", Description = "Customer support phone / WhatsApp" },
                    new WebsiteSetting { Key = "WhatsApp", Value = "https://wa.me/923174641903", Group = "Contact", Description = "Direct WhatsApp link" },
                    new WebsiteSetting { Key = "CopyrightText", Value = "© 2026 Happy Steppy. All rights reserved.", Group = "General", Description = "Footer copyright text" }
                };
                context.WebsiteSettings.AddRange(settings);
            }

            await context.SaveChangesAsync();
        }
    }
}

