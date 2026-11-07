using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HappySteppy.Application.Interfaces.Repositories;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Content;
using HappySteppy.Domain.Identity;
using HappySteppy.Infrastructure.Data;

namespace HappySteppy.Infrastructure.Repositories
{
    public class AdminUserRepository : IAdminUserRepository
    {
        private readonly ApplicationDbContext _db;
        public AdminUserRepository(ApplicationDbContext db) => _db = db;

        public Task<AdminUser?> GetByEmailAsync(string email, CancellationToken ct = default)
            => _db.AdminUsers.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), ct);

        public Task<AdminUser?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);

        public Task<List<AdminUser>> GetAllAsync(CancellationToken ct = default)
            => _db.AdminUsers.OrderByDescending(u => u.CreatedAtUtc).ToListAsync(ct);

        public async Task AddAsync(AdminUser user, CancellationToken ct = default)
        {
            _db.AdminUsers.Add(user);
            await _db.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(AdminUser user, CancellationToken ct = default)
        {
            _db.AdminUsers.Update(user);
            await _db.SaveChangesAsync(ct);
        }

        public async Task SaveRefreshTokenAsync(RefreshToken token, CancellationToken ct = default)
        {
            _db.RefreshTokens.Add(token);
            await _db.SaveChangesAsync(ct);
        }

        public Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash, CancellationToken ct = default)
            => _db.RefreshTokens.Include(r => r.AdminUser).FirstOrDefaultAsync(r => r.TokenHash == tokenHash, ct);

        public async Task RevokeRefreshTokenAsync(string tokenHash, string? replacedByTokenHash = null, CancellationToken ct = default)
        {
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash, ct);
            if (token != null)
            {
                token.RevokedAtUtc = DateTime.UtcNow;
                token.ReplacedByTokenHash = replacedByTokenHash;
                await _db.SaveChangesAsync(ct);
            }
        }

        public async Task RevokeAllUserRefreshTokensAsync(Guid userId, CancellationToken ct = default)
        {
            var tokens = await _db.RefreshTokens.Where(r => r.AdminUserId == userId && r.RevokedAtUtc == null).ToListAsync(ct);
            foreach (var t in tokens)
            {
                t.RevokedAtUtc = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);
        }
    }

    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _db;
        public ProductRepository(ApplicationDbContext db) => _db = db;

        public Task<List<Product>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.Products.Include(p => p.Brand).AsQueryable();
            if (activeOnly) q = q.Where(p => p.IsActive);
            return q.OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAtUtc).ToListAsync(ct);
        }

        public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.Products.Include(p => p.Brand).Include(p => p.Images).Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
                           .FirstOrDefaultAsync(p => p.Id == id, ct);

        public Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default)
            => _db.Products.Include(p => p.Brand).Include(p => p.Images)
                           .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower(), ct);

        public Task<List<Product>> GetTrendingAsync(int count = 6, CancellationToken ct = default)
            => _db.Products.Where(p => p.IsActive && p.IsTrending)
                           .OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAtUtc).Take(count).ToListAsync(ct);

        public Task<List<Product>> GetFeaturedAsync(int count = 6, CancellationToken ct = default)
            => _db.Products.Where(p => p.IsActive && p.IsFeatured)
                           .OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAtUtc).Take(count).ToListAsync(ct);

        public async Task AddAsync(Product product, CancellationToken ct = default)
        {
            _db.Products.Add(product);
            await _db.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Product product, CancellationToken ct = default)
        {
            _db.Products.Update(product);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var p = await _db.Products.FindAsync(new object[] { id }, ct);
            if (p != null)
            {
                p.IsDeleted = true;
                await _db.SaveChangesAsync(ct);
            }
        }

        public Task<bool> ExistsSkuAsync(string sku, Guid? excludeId = null, CancellationToken ct = default)
            => _db.Products.AnyAsync(p => p.Sku.ToLower() == sku.ToLower() && (!excludeId.HasValue || p.Id != excludeId.Value), ct);
    }

    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _db;
        public CategoryRepository(ApplicationDbContext db) => _db = db;

        public Task<List<Category>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.Categories.Include(c => c.SubCategories).AsQueryable();
            if (activeOnly) q = q.Where(c => c.IsActive);
            return q.OrderBy(c => c.SortOrder).ToListAsync(ct);
        }

        public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.Categories.Include(c => c.SubCategories).FirstOrDefaultAsync(c => c.Id == id, ct);

        public Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default)
            => _db.Categories.FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.ToLower(), ct);

        public async Task AddAsync(Category category, CancellationToken ct = default)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Category category, CancellationToken ct = default)
        {
            _db.Categories.Update(category);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var c = await _db.Categories.FindAsync(new object[] { id }, ct);
            if (c != null)
            {
                c.IsDeleted = true;
                await _db.SaveChangesAsync(ct);
            }
        }
    }

    public class HomepageRepository : IHomepageRepository
    {
        private readonly ApplicationDbContext _db;
        public HomepageRepository(ApplicationDbContext db) => _db = db;

        // Hero slides
        public Task<List<HeroSlide>> GetHeroSlidesAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.HeroSlides.AsQueryable();
            if (activeOnly) q = q.Where(s => s.IsActive);
            return q.OrderBy(s => s.SortOrder).ToListAsync(ct);
        }
        public Task<HeroSlide?> GetHeroSlideByIdAsync(Guid id, CancellationToken ct = default) => _db.HeroSlides.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddHeroSlideAsync(HeroSlide slide, CancellationToken ct = default) { _db.HeroSlides.Add(slide); await _db.SaveChangesAsync(ct); }
        public async Task UpdateHeroSlideAsync(HeroSlide slide, CancellationToken ct = default) { _db.HeroSlides.Update(slide); await _db.SaveChangesAsync(ct); }
        public async Task DeleteHeroSlideAsync(Guid id, CancellationToken ct = default) { var s = await GetHeroSlideByIdAsync(id, ct); if (s != null) { s.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Benefits
        public Task<List<BenefitCard>> GetBenefitCardsAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.BenefitCards.AsQueryable();
            if (activeOnly) q = q.Where(b => b.IsActive);
            return q.OrderBy(b => b.SortOrder).ToListAsync(ct);
        }
        public Task<BenefitCard?> GetBenefitCardByIdAsync(Guid id, CancellationToken ct = default) => _db.BenefitCards.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddBenefitCardAsync(BenefitCard card, CancellationToken ct = default) { _db.BenefitCards.Add(card); await _db.SaveChangesAsync(ct); }
        public async Task UpdateBenefitCardAsync(BenefitCard card, CancellationToken ct = default) { _db.BenefitCards.Update(card); await _db.SaveChangesAsync(ct); }
        public async Task DeleteBenefitCardAsync(Guid id, CancellationToken ct = default) { var b = await GetBenefitCardByIdAsync(id, ct); if (b != null) { b.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Banners
        public Task<List<PromotionalBanner>> GetBannersAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.PromotionalBanners.AsQueryable();
            if (activeOnly) q = q.Where(b => b.IsActive);
            return q.OrderBy(b => b.SortOrder).ToListAsync(ct);
        }
        public Task<PromotionalBanner?> GetBannerByIdAsync(Guid id, CancellationToken ct = default) => _db.PromotionalBanners.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddBannerAsync(PromotionalBanner banner, CancellationToken ct = default) { _db.PromotionalBanners.Add(banner); await _db.SaveChangesAsync(ct); }
        public async Task UpdateBannerAsync(PromotionalBanner banner, CancellationToken ct = default) { _db.PromotionalBanners.Update(banner); await _db.SaveChangesAsync(ct); }
        public async Task DeleteBannerAsync(Guid id, CancellationToken ct = default) { var b = await GetBannerByIdAsync(id, ct); if (b != null) { b.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Style Cards
        public Task<List<StyleCard>> GetStyleCardsAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.StyleCards.AsQueryable();
            if (activeOnly) q = q.Where(s => s.IsActive);
            return q.OrderBy(s => s.SortOrder).ToListAsync(ct);
        }
        public Task<StyleCard?> GetStyleCardByIdAsync(Guid id, CancellationToken ct = default) => _db.StyleCards.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddStyleCardAsync(StyleCard card, CancellationToken ct = default) { _db.StyleCards.Add(card); await _db.SaveChangesAsync(ct); }
        public async Task UpdateStyleCardAsync(StyleCard card, CancellationToken ct = default) { _db.StyleCards.Update(card); await _db.SaveChangesAsync(ct); }
        public async Task DeleteStyleCardAsync(Guid id, CancellationToken ct = default) { var s = await GetStyleCardByIdAsync(id, ct); if (s != null) { s.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Flash Sale
        public async Task<FlashSale?> GetActiveFlashSaleAsync(CancellationToken ct = default)
        {
            var sale = await _db.FlashSales.Include(f => f.Products).ThenInclude(fp => fp.Product)
                                 .Where(f => f.IsActive && f.EndsAtUtc > DateTime.UtcNow)
                                 .OrderByDescending(f => f.CreatedAtUtc)
                                 .FirstOrDefaultAsync(ct);
            if (sale == null)
            {
                sale = await _db.FlashSales.Include(f => f.Products).ThenInclude(fp => fp.Product)
                                 .Where(f => f.IsActive)
                                 .OrderByDescending(f => f.CreatedAtUtc)
                                 .FirstOrDefaultAsync(ct);
            }
            return sale;
        }

        public Task<FlashSale?> GetFlashSaleByIdAsync(Guid id, CancellationToken ct = default)
            => _db.FlashSales.Include(f => f.Products).ThenInclude(fp => fp.Product).FirstOrDefaultAsync(f => f.Id == id, ct);

        public async Task SaveFlashSaleAsync(FlashSale sale, CancellationToken ct = default)
        {
            if (await _db.FlashSales.AnyAsync(f => f.Id == sale.Id, ct))
                _db.FlashSales.Update(sale);
            else
                _db.FlashSales.Add(sale);
            await _db.SaveChangesAsync(ct);
        }

        // Testimonials
        public Task<List<Testimonial>> GetTestimonialsAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.Testimonials.AsQueryable();
            if (activeOnly) q = q.Where(t => t.IsActive);
            return q.OrderBy(t => t.SortOrder).ToListAsync(ct);
        }
        public Task<Testimonial?> GetTestimonialByIdAsync(Guid id, CancellationToken ct = default) => _db.Testimonials.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddTestimonialAsync(Testimonial t, CancellationToken ct = default) { _db.Testimonials.Add(t); await _db.SaveChangesAsync(ct); }
        public async Task UpdateTestimonialAsync(Testimonial t, CancellationToken ct = default) { _db.Testimonials.Update(t); await _db.SaveChangesAsync(ct); }
        public async Task DeleteTestimonialAsync(Guid id, CancellationToken ct = default) { var t = await GetTestimonialByIdAsync(id, ct); if (t != null) { t.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Trust Statistics
        public Task<List<TrustStatistic>> GetTrustStatisticsAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.TrustStatistics.AsQueryable();
            if (activeOnly) q = q.Where(s => s.IsActive);
            return q.OrderBy(s => s.SortOrder).ToListAsync(ct);
        }
        public Task<TrustStatistic?> GetTrustStatisticByIdAsync(Guid id, CancellationToken ct = default) => _db.TrustStatistics.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddTrustStatisticAsync(TrustStatistic s, CancellationToken ct = default) { _db.TrustStatistics.Add(s); await _db.SaveChangesAsync(ct); }
        public async Task UpdateTrustStatisticAsync(TrustStatistic s, CancellationToken ct = default) { _db.TrustStatistics.Update(s); await _db.SaveChangesAsync(ct); }
        public async Task DeleteTrustStatisticAsync(Guid id, CancellationToken ct = default) { var s = await GetTrustStatisticByIdAsync(id, ct); if (s != null) { s.IsDeleted = true; await _db.SaveChangesAsync(ct); } }

        // Brands
        public Task<List<Brand>> GetBrandsAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.Brands.AsQueryable();
            if (activeOnly) q = q.Where(b => b.IsActive);
            return q.OrderBy(b => b.SortOrder).ToListAsync(ct);
        }
        public Task<Brand?> GetBrandByIdAsync(Guid id, CancellationToken ct = default) => _db.Brands.FindAsync(new object[] { id }, ct).AsTask();
        public async Task AddBrandAsync(Brand brand, CancellationToken ct = default) { _db.Brands.Add(brand); await _db.SaveChangesAsync(ct); }
        public async Task UpdateBrandAsync(Brand brand, CancellationToken ct = default) { _db.Brands.Update(brand); await _db.SaveChangesAsync(ct); }
        public async Task DeleteBrandAsync(Guid id, CancellationToken ct = default) { var b = await GetBrandByIdAsync(id, ct); if (b != null) { b.IsDeleted = true; await _db.SaveChangesAsync(ct); } }
    }

    public class SettingsRepository : ISettingsRepository
    {
        private readonly ApplicationDbContext _db;
        public SettingsRepository(ApplicationDbContext db) => _db = db;

        public Task<List<WebsiteSetting>> GetAllSettingsAsync(CancellationToken ct = default)
            => _db.WebsiteSettings.OrderBy(s => s.Group).ThenBy(s => s.Key).ToListAsync(ct);

        public Task<WebsiteSetting?> GetSettingByKeyAsync(string key, CancellationToken ct = default)
            => _db.WebsiteSettings.FirstOrDefaultAsync(s => s.Key.ToLower() == key.ToLower(), ct);

        public async Task SaveSettingAsync(string key, string value, string group = "General", string? description = null, CancellationToken ct = default)
        {
            var setting = await _db.WebsiteSettings.FirstOrDefaultAsync(s => s.Key.ToLower() == key.ToLower(), ct);
            if (setting == null)
            {
                setting = new WebsiteSetting { Key = key, Value = value, Group = group, Description = description, UpdatedAtUtc = DateTime.UtcNow };
                _db.WebsiteSettings.Add(setting);
            }
            else
            {
                setting.Value = value;
                if (!string.IsNullOrEmpty(description)) setting.Description = description;
                setting.UpdatedAtUtc = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);
        }

        public Task<List<FooterLink>> GetFooterLinksAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.FooterLinks.AsQueryable();
            if (activeOnly) q = q.Where(l => l.IsActive);
            return q.OrderBy(l => l.ColumnName).ThenBy(l => l.SortOrder).ToListAsync(ct);
        }

        public async Task SaveFooterLinkAsync(FooterLink link, CancellationToken ct = default)
        {
            if (await _db.FooterLinks.AnyAsync(l => l.Id == link.Id, ct))
                _db.FooterLinks.Update(link);
            else
                _db.FooterLinks.Add(link);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteFooterLinkAsync(Guid id, CancellationToken ct = default)
        {
            var l = await _db.FooterLinks.FindAsync(new object[] { id }, ct);
            if (l != null) { l.IsDeleted = true; await _db.SaveChangesAsync(ct); }
        }

        public Task<List<SocialLink>> GetSocialLinksAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var q = _db.SocialLinks.AsQueryable();
            if (activeOnly) q = q.Where(s => s.IsActive);
            return q.OrderBy(s => s.SortOrder).ToListAsync(ct);
        }

        public async Task SaveSocialLinkAsync(SocialLink link, CancellationToken ct = default)
        {
            if (await _db.SocialLinks.AnyAsync(s => s.Id == link.Id, ct))
                _db.SocialLinks.Update(link);
            else
                _db.SocialLinks.Add(link);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteSocialLinkAsync(Guid id, CancellationToken ct = default)
        {
            var s = await _db.SocialLinks.FindAsync(new object[] { id }, ct);
            if (s != null) { s.IsDeleted = true; await _db.SaveChangesAsync(ct); }
        }
    }

    public class MediaRepository : IMediaRepository
    {
        private readonly ApplicationDbContext _db;
        public MediaRepository(ApplicationDbContext db) => _db = db;

        public Task<List<MediaAsset>> GetAllAsync(CancellationToken ct = default)
            => _db.MediaAssets.OrderByDescending(m => m.CreatedAtUtc).ToListAsync(ct);

        public Task<MediaAsset?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => _db.MediaAssets.FindAsync(new object[] { id }, ct).AsTask();

        public async Task AddAsync(MediaAsset asset, CancellationToken ct = default)
        {
            _db.MediaAssets.Add(asset);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var asset = await GetByIdAsync(id, ct);
            if (asset != null)
            {
                _db.MediaAssets.Remove(asset);
                await _db.SaveChangesAsync(ct);
            }
        }
    }
}

