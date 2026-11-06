using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using HappySteppy.Application.DTOs;
using HappySteppy.Application.Interfaces.Repositories;
using HappySteppy.Application.Interfaces.Services;
using HappySteppy.Domain.Catalog;
using HappySteppy.Domain.Content;

namespace HappySteppy.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        public ProductService(IProductRepository repo) => _repo = repo;

        public async Task<List<ProductDto>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var list = await _repo.GetAllAsync(activeOnly, ct);
            return list.Select(MapToDto).ToList();
        }

        public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var p = await _repo.GetByIdAsync(id, ct);
            return p != null ? MapToDto(p) : null;
        }

        public async Task<ProductDto> CreateAsync(CreateProductRequest req, CancellationToken ct = default)
        {
            var slug = string.IsNullOrWhiteSpace(req.Slug) ? GenerateSlug(req.Name) : req.Slug;
            var product = new Product
            {
                Name = req.Name,
                Slug = slug,
                Sku = req.Sku,
                ShortDescription = req.ShortDescription,
                Description = req.Description,
                Price = req.Price,
                CompareAtPrice = req.CompareAtPrice,
                CostPrice = req.CostPrice,
                StockQuantity = req.StockQuantity,
                PrimaryImageUrl = req.PrimaryImageUrl,
                BadgeText = req.BadgeText,
                IsFeatured = req.IsFeatured,
                IsTrending = req.IsTrending,
                IsBestSeller = req.IsBestSeller,
                BrandId = req.BrandId,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            if (req.CategoryIds != null && req.CategoryIds.Any())
            {
                foreach (var catId in req.CategoryIds)
                {
                    product.ProductCategories.Add(new ProductCategory { ProductId = product.Id, CategoryId = catId });
                }
            }

            await _repo.AddAsync(product, ct);
            return MapToDto(product);
        }

        public async Task<ProductDto?> UpdateAsync(Guid id, CreateProductRequest req, CancellationToken ct = default)
        {
            var p = await _repo.GetByIdAsync(id, ct);
            if (p == null) return null;

            p.Name = req.Name;
            p.Slug = string.IsNullOrWhiteSpace(req.Slug) ? GenerateSlug(req.Name) : req.Slug;
            p.Sku = req.Sku;
            p.ShortDescription = req.ShortDescription;
            p.Description = req.Description;
            p.Price = req.Price;
            p.CompareAtPrice = req.CompareAtPrice;
            p.CostPrice = req.CostPrice;
            p.StockQuantity = req.StockQuantity;
            if (!string.IsNullOrEmpty(req.PrimaryImageUrl)) p.PrimaryImageUrl = req.PrimaryImageUrl;
            p.BadgeText = req.BadgeText;
            p.IsFeatured = req.IsFeatured;
            p.IsTrending = req.IsTrending;
            p.IsBestSeller = req.IsBestSeller;
            p.BrandId = req.BrandId;
            p.UpdatedAtUtc = DateTime.UtcNow;

            await _repo.UpdateAsync(p, ct);
            return MapToDto(p);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
        {
            await _repo.DeleteAsync(id, ct);
            return true;
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Sku = p.Sku,
            ShortDescription = p.ShortDescription,
            Description = p.Description,
            Price = p.Price,
            CompareAtPrice = p.CompareAtPrice,
            StockQuantity = p.StockQuantity,
            PrimaryImageUrl = p.PrimaryImageUrl,
            BadgeText = p.BadgeText,
            Rating = p.Rating,
            ReviewsCount = p.ReviewsCount,
            IsFeatured = p.IsFeatured,
            IsTrending = p.IsTrending,
            IsBestSeller = p.IsBestSeller,
            IsActive = p.IsActive,
            SortOrder = p.SortOrder,
            BrandId = p.BrandId,
            BrandName = p.Brand?.Name,
            CategoryNames = p.ProductCategories?.Select(pc => pc.Category?.Name ?? "").Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new()
        };

        private static string GenerateSlug(string name)
        {
            var str = name.ToLowerInvariant();
            str = Regex.Replace(str, @"\s+", "-");
            str = Regex.Replace(str, @"[^a-z0-9\-]", "");
            return str.Trim('-');
        }
    }

    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        public CategoryService(ICategoryRepository repo) => _repo = repo;

        public async Task<List<CategoryDto>> GetAllAsync(bool activeOnly = false, CancellationToken ct = default)
        {
            var list = await _repo.GetAllAsync(activeOnly, ct);
            return list.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IconName = c.IconName,
                SortOrder = c.SortOrder,
                ShowInSidebar = c.ShowInSidebar,
                ShowOnHomepage = c.ShowOnHomepage,
                IsActive = c.IsActive,
                ParentCategoryId = c.ParentCategoryId
            }).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var c = await _repo.GetByIdAsync(id, ct);
            if (c == null) return null;
            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IconName = c.IconName,
                SortOrder = c.SortOrder,
                ShowInSidebar = c.ShowInSidebar,
                ShowOnHomepage = c.ShowOnHomepage,
                IsActive = c.IsActive,
                ParentCategoryId = c.ParentCategoryId
            };
        }

        public async Task<CategoryDto> CreateAsync(CategoryDto dto, CancellationToken ct = default)
        {
            var slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug;
            var c = new Category
            {
                Name = dto.Name,
                Slug = slug,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                IconName = dto.IconName,
                SortOrder = dto.SortOrder,
                ShowInSidebar = dto.ShowInSidebar,
                ShowOnHomepage = dto.ShowOnHomepage,
                IsActive = dto.IsActive,
                ParentCategoryId = dto.ParentCategoryId
            };
            await _repo.AddAsync(c, ct);
            dto.Id = c.Id;
            return dto;
        }

        public async Task<CategoryDto?> UpdateAsync(Guid id, CategoryDto dto, CancellationToken ct = default)
        {
            var c = await _repo.GetByIdAsync(id, ct);
            if (c == null) return null;

            c.Name = dto.Name;
            c.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug;
            c.Description = dto.Description;
            c.ImageUrl = dto.ImageUrl;
            c.IconName = dto.IconName;
            c.SortOrder = dto.SortOrder;
            c.ShowInSidebar = dto.ShowInSidebar;
            c.ShowOnHomepage = dto.ShowOnHomepage;
            c.IsActive = dto.IsActive;
            c.ParentCategoryId = dto.ParentCategoryId;
            c.UpdatedAtUtc = DateTime.UtcNow;

            await _repo.UpdateAsync(c, ct);
            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
        {
            await _repo.DeleteAsync(id, ct);
            return true;
        }
    }

    public class HomepageService : IHomepageService
    {
        private readonly IHomepageRepository _homepageRepo;
        private readonly IProductRepository _productRepo;
        private readonly ICategoryRepository _categoryRepo;
        private readonly ISettingsRepository _settingsRepo;

        public HomepageService(
            IHomepageRepository homepageRepo,
            IProductRepository productRepo,
            ICategoryRepository categoryRepo,
            ISettingsRepository settingsRepo)
        {
            _homepageRepo = homepageRepo;
            _productRepo = productRepo;
            _categoryRepo = categoryRepo;
            _settingsRepo = settingsRepo;
        }

        public async Task<HomepagePayloadDto> GetPublicHomepageDataAsync(CancellationToken ct = default)
        {
            var slides = await _homepageRepo.GetHeroSlidesAsync(true, ct);
            var categories = await _categoryRepo.GetAllAsync(true, ct);
            var benefits = await _homepageRepo.GetBenefitCardsAsync(true, ct);
            var trending = await _productRepo.GetTrendingAsync(4, ct);
            var banners = await _homepageRepo.GetBannersAsync(true, ct);
            var styles = await _homepageRepo.GetStyleCardsAsync(true, ct);
            var flashSale = await _homepageRepo.GetActiveFlashSaleAsync(ct);
            var testimonials = await _homepageRepo.GetTestimonialsAsync(true, ct);
            var trustStats = await _homepageRepo.GetTrustStatisticsAsync(true, ct);
            var brands = await _homepageRepo.GetBrandsAsync(true, ct);
            var footerLinks = await _settingsRepo.GetFooterLinksAsync(true, ct);
            var socialLinks = await _settingsRepo.GetSocialLinksAsync(true, ct);
            var settings = await _settingsRepo.GetAllSettingsAsync(ct);

            return new HomepagePayloadDto
            {
                HeroSlides = slides.Select(s => new HeroSlideDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Subtitle = s.Subtitle,
                    Description = s.Description,
                    DesktopImageUrl = s.DesktopImageUrl,
                    MobileImageUrl = s.MobileImageUrl,
                    PrimaryButtonText = s.PrimaryButtonText,
                    PrimaryButtonUrl = s.PrimaryButtonUrl,
                    SecondaryButtonText = s.SecondaryButtonText,
                    SecondaryButtonUrl = s.SecondaryButtonUrl,
                    BadgeText = s.BadgeText,
                    SortOrder = s.SortOrder,
                    IsActive = s.IsActive
                }).ToList(),

                Categories = categories.Where(c => c.ShowOnHomepage).Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    ImageUrl = c.ImageUrl,
                    IconName = c.IconName,
                    SortOrder = c.SortOrder,
                    ShowInSidebar = c.ShowInSidebar,
                    ShowOnHomepage = c.ShowOnHomepage
                }).ToList(),

                Benefits = benefits.Select(b => new BenefitCardDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Description = b.Description,
                    IconName = b.IconName,
                    SortOrder = b.SortOrder,
                    IsActive = b.IsActive
                }).ToList(),

                TrendingProducts = trending.Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Sku = p.Sku,
                    ShortDescription = p.ShortDescription,
                    Price = p.Price,
                    CompareAtPrice = p.CompareAtPrice,
                    PrimaryImageUrl = p.PrimaryImageUrl,
                    BadgeText = p.BadgeText,
                    Rating = p.Rating,
                    ReviewsCount = p.ReviewsCount,
                    IsActive = p.IsActive
                }).ToList(),

                PromotionalBanner = banners.FirstOrDefault() != null ? new PromotionalBannerDto
                {
                    Id = banners[0].Id,
                    Title = banners[0].Title,
                    Subtitle = banners[0].Subtitle,
                    DiscountText = banners[0].DiscountText,
                    ButtonText = banners[0].ButtonText,
                    ButtonUrl = banners[0].ButtonUrl,
                    ImageUrl = banners[0].ImageUrl,
                    LocationKey = banners[0].LocationKey
                } : null,

                StyleCards = styles.Select(s => new StyleCardDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Subtitle = s.Subtitle,
                    ImageUrl = s.ImageUrl,
                    LinkUrl = s.LinkUrl,
                    SortOrder = s.SortOrder,
                    IsActive = s.IsActive
                }).ToList(),

                FlashSale = flashSale != null ? new FlashSaleDto
                {
                    Id = flashSale.Id,
                    Title = flashSale.Title,
                    Subtitle = flashSale.Subtitle,
                    DiscountPercentage = flashSale.DiscountPercentage,
                    EndsAtUtc = flashSale.EndsAtUtc,
                    IsActive = flashSale.IsActive
                } : null,

                Testimonials = testimonials.Select(t => new TestimonialDto
                {
                    Id = t.Id,
                    CustomerName = t.CustomerName,
                    CustomerRole = t.CustomerRole,
                    Rating = t.Rating,
                    Comment = t.Comment,
                    AvatarUrl = t.AvatarUrl,
                    IsVerified = t.IsVerified,
                    SortOrder = t.SortOrder,
                    IsActive = t.IsActive
                }).ToList(),

                TrustStatistic = trustStats.FirstOrDefault() != null ? new TrustStatisticDto
                {
                    Id = trustStats[0].Id,
                    PreHeading = trustStats[0].PreHeading,
                    MetricValue = trustStats[0].MetricValue,
                    Label = trustStats[0].Label,
                    IconName = trustStats[0].IconName,
                    SortOrder = trustStats[0].SortOrder
                } : null,

                Brands = brands.Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Slug = b.Slug,
                    LogoUrl = b.LogoUrl,
                    SortOrder = b.SortOrder,
                    IsActive = b.IsActive
                }).ToList(),

                FooterLinks = footerLinks.Select(fl => new FooterLinkDto
                {
                    Id = fl.Id,
                    ColumnName = fl.ColumnName,
                    Title = fl.Title,
                    Url = fl.Url,
                    SortOrder = fl.SortOrder,
                    IsActive = fl.IsActive
                }).ToList(),

                SocialLinks = socialLinks.Select(sl => new SocialLinkDto
                {
                    Id = sl.Id,
                    Platform = sl.Platform,
                    Url = sl.Url,
                    IconName = sl.IconName,
                    SortOrder = sl.SortOrder,
                    IsActive = sl.IsActive
                }).ToList(),

                Settings = settings.ToDictionary(s => s.Key, s => s.Value)
            };
        }

        public async Task<List<HeroSlideDto>> GetHeroSlidesAsync(CancellationToken ct = default)
        {
            var list = await _homepageRepo.GetHeroSlidesAsync(false, ct);
            return list.Select(s => new HeroSlideDto
            {
                Id = s.Id,
                Title = s.Title,
                Subtitle = s.Subtitle,
                Description = s.Description,
                DesktopImageUrl = s.DesktopImageUrl,
                MobileImageUrl = s.MobileImageUrl,
                PrimaryButtonText = s.PrimaryButtonText,
                PrimaryButtonUrl = s.PrimaryButtonUrl,
                SecondaryButtonText = s.SecondaryButtonText,
                SecondaryButtonUrl = s.SecondaryButtonUrl,
                BadgeText = s.BadgeText,
                SortOrder = s.SortOrder,
                IsActive = s.IsActive
            }).ToList();
        }

        public async Task<HeroSlideDto> SaveHeroSlideAsync(HeroSlideDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var s = await _homepageRepo.GetHeroSlideByIdAsync(dto.Id.Value, ct);
                if (s != null)
                {
                    s.Title = dto.Title;
                    s.Subtitle = dto.Subtitle;
                    s.Description = dto.Description;
                    s.DesktopImageUrl = dto.DesktopImageUrl;
                    s.MobileImageUrl = dto.MobileImageUrl;
                    s.PrimaryButtonText = dto.PrimaryButtonText;
                    s.PrimaryButtonUrl = dto.PrimaryButtonUrl;
                    s.SecondaryButtonText = dto.SecondaryButtonText;
                    s.SecondaryButtonUrl = dto.SecondaryButtonUrl;
                    s.BadgeText = dto.BadgeText;
                    s.SortOrder = dto.SortOrder;
                    s.IsActive = dto.IsActive;
                    s.UpdatedAtUtc = DateTime.UtcNow;
                    await _homepageRepo.UpdateHeroSlideAsync(s, ct);
                    return dto;
                }
            }

            var newSlide = new HeroSlide
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                Description = dto.Description,
                DesktopImageUrl = dto.DesktopImageUrl,
                MobileImageUrl = dto.MobileImageUrl,
                PrimaryButtonText = dto.PrimaryButtonText,
                PrimaryButtonUrl = dto.PrimaryButtonUrl,
                SecondaryButtonText = dto.SecondaryButtonText,
                SecondaryButtonUrl = dto.SecondaryButtonUrl,
                BadgeText = dto.BadgeText,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };
            await _homepageRepo.AddHeroSlideAsync(newSlide, ct);
            dto.Id = newSlide.Id;
            return dto;
        }

        public async Task<bool> DeleteHeroSlideAsync(Guid id, CancellationToken ct = default)
        {
            await _homepageRepo.DeleteHeroSlideAsync(id, ct);
            return true;
        }

        // Banners
        public async Task<List<PromotionalBannerDto>> GetBannersAsync(CancellationToken ct = default)
        {
            var list = await _homepageRepo.GetBannersAsync(false, ct);
            return list.Select(b => new PromotionalBannerDto
            {
                Id = b.Id,
                Title = b.Title,
                Subtitle = b.Subtitle,
                DiscountText = b.DiscountText,
                ButtonText = b.ButtonText,
                ButtonUrl = b.ButtonUrl,
                ImageUrl = b.ImageUrl,
                LocationKey = b.LocationKey,
                SortOrder = b.SortOrder,
                IsActive = b.IsActive
            }).ToList();
        }

        public async Task<PromotionalBannerDto> SaveBannerAsync(PromotionalBannerDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var b = await _homepageRepo.GetBannerByIdAsync(dto.Id.Value, ct);
                if (b != null)
                {
                    b.Title = dto.Title;
                    b.Subtitle = dto.Subtitle;
                    b.DiscountText = dto.DiscountText;
                    b.ButtonText = dto.ButtonText;
                    b.ButtonUrl = dto.ButtonUrl;
                    b.ImageUrl = dto.ImageUrl;
                    b.LocationKey = dto.LocationKey;
                    b.SortOrder = dto.SortOrder;
                    b.IsActive = dto.IsActive;
                    b.UpdatedAtUtc = DateTime.UtcNow;
                    await _homepageRepo.UpdateBannerAsync(b, ct);
                    return dto;
                }
            }

            var newB = new PromotionalBanner
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                DiscountText = dto.DiscountText,
                ButtonText = dto.ButtonText,
                ButtonUrl = dto.ButtonUrl,
                ImageUrl = dto.ImageUrl,
                LocationKey = dto.LocationKey,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };
            await _homepageRepo.AddBannerAsync(newB, ct);
            dto.Id = newB.Id;
            return dto;
        }

        public async Task<bool> DeleteBannerAsync(Guid id, CancellationToken ct = default)
        {
            await _homepageRepo.DeleteBannerAsync(id, ct);
            return true;
        }

        // Styles
        public async Task<List<StyleCardDto>> GetStyleCardsAsync(CancellationToken ct = default)
        {
            var list = await _homepageRepo.GetStyleCardsAsync(false, ct);
            return list.Select(s => new StyleCardDto
            {
                Id = s.Id,
                Title = s.Title,
                Subtitle = s.Subtitle,
                ImageUrl = s.ImageUrl,
                LinkUrl = s.LinkUrl,
                SortOrder = s.SortOrder,
                IsActive = s.IsActive
            }).ToList();
        }

        public async Task<StyleCardDto> SaveStyleCardAsync(StyleCardDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var s = await _homepageRepo.GetStyleCardByIdAsync(dto.Id.Value, ct);
                if (s != null)
                {
                    s.Title = dto.Title;
                    s.Subtitle = dto.Subtitle;
                    s.ImageUrl = dto.ImageUrl;
                    s.LinkUrl = dto.LinkUrl;
                    s.SortOrder = dto.SortOrder;
                    s.IsActive = dto.IsActive;
                    s.UpdatedAtUtc = DateTime.UtcNow;
                    await _homepageRepo.UpdateStyleCardAsync(s, ct);
                    return dto;
                }
            }

            var newCard = new StyleCard
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                ImageUrl = dto.ImageUrl,
                LinkUrl = dto.LinkUrl,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };
            await _homepageRepo.AddStyleCardAsync(newCard, ct);
            dto.Id = newCard.Id;
            return dto;
        }

        public async Task<bool> DeleteStyleCardAsync(Guid id, CancellationToken ct = default)
        {
            await _homepageRepo.DeleteStyleCardAsync(id, ct);
            return true;
        }

        // Flash Sale
        public async Task<FlashSaleDto?> GetFlashSaleAsync(CancellationToken ct = default)
        {
            var f = await _homepageRepo.GetActiveFlashSaleAsync(ct);
            if (f == null) return null;
            return new FlashSaleDto
            {
                Id = f.Id,
                Title = f.Title,
                Subtitle = f.Subtitle,
                DiscountPercentage = f.DiscountPercentage,
                EndsAtUtc = f.EndsAtUtc,
                IsActive = f.IsActive
            };
        }

        public async Task<FlashSaleDto> SaveFlashSaleAsync(FlashSaleDto dto, CancellationToken ct = default)
        {
            var f = (dto.Id.HasValue && dto.Id.Value != Guid.Empty ? await _homepageRepo.GetFlashSaleByIdAsync(dto.Id.Value, ct) : null) ?? new FlashSale();
            f.Title = dto.Title;
            f.Subtitle = dto.Subtitle;
            f.DiscountPercentage = dto.DiscountPercentage;
            f.EndsAtUtc = dto.EndsAtUtc;
            f.IsActive = dto.IsActive;
            await _homepageRepo.SaveFlashSaleAsync(f, ct);
            dto.Id = f.Id;
            return dto;
        }

        // Testimonials
        public async Task<List<TestimonialDto>> GetTestimonialsAsync(CancellationToken ct = default)
        {
            var list = await _homepageRepo.GetTestimonialsAsync(false, ct);
            return list.Select(t => new TestimonialDto
            {
                Id = t.Id,
                CustomerName = t.CustomerName,
                CustomerRole = t.CustomerRole,
                Rating = t.Rating,
                Comment = t.Comment,
                AvatarUrl = t.AvatarUrl,
                IsVerified = t.IsVerified,
                SortOrder = t.SortOrder,
                IsActive = t.IsActive
            }).ToList();
        }

        public async Task<TestimonialDto> SaveTestimonialAsync(TestimonialDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var t = await _homepageRepo.GetTestimonialByIdAsync(dto.Id.Value, ct);
                if (t != null)
                {
                    t.CustomerName = dto.CustomerName;
                    t.CustomerRole = dto.CustomerRole;
                    t.Rating = dto.Rating;
                    t.Comment = dto.Comment;
                    t.AvatarUrl = dto.AvatarUrl;
                    t.IsVerified = dto.IsVerified;
                    t.SortOrder = dto.SortOrder;
                    t.IsActive = dto.IsActive;
                    t.UpdatedAtUtc = DateTime.UtcNow;
                    await _homepageRepo.UpdateTestimonialAsync(t, ct);
                    return dto;
                }
            }

            var newT = new Testimonial
            {
                CustomerName = dto.CustomerName,
                CustomerRole = dto.CustomerRole,
                Rating = dto.Rating,
                Comment = dto.Comment,
                AvatarUrl = dto.AvatarUrl,
                IsVerified = dto.IsVerified,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };
            await _homepageRepo.AddTestimonialAsync(newT, ct);
            dto.Id = newT.Id;
            return dto;
        }

        public async Task<bool> DeleteTestimonialAsync(Guid id, CancellationToken ct = default)
        {
            await _homepageRepo.DeleteTestimonialAsync(id, ct);
            return true;
        }

        // Brands
        public async Task<List<BrandDto>> GetBrandsAsync(CancellationToken ct = default)
        {
            var list = await _homepageRepo.GetBrandsAsync(false, ct);
            return list.Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name,
                Slug = b.Slug,
                LogoUrl = b.LogoUrl,
                SortOrder = b.SortOrder,
                IsActive = b.IsActive
            }).ToList();
        }

        public async Task<BrandDto> SaveBrandAsync(BrandDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var b = await _homepageRepo.GetBrandByIdAsync(dto.Id.Value, ct);
                if (b != null)
                {
                    b.Name = dto.Name;
                    b.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug;
                    b.LogoUrl = dto.LogoUrl;
                    b.SortOrder = dto.SortOrder;
                    b.IsActive = dto.IsActive;
                    b.UpdatedAtUtc = DateTime.UtcNow;
                    await _homepageRepo.UpdateBrandAsync(b, ct);
                    return dto;
                }
            }

            var newB = new Brand
            {
                Name = dto.Name,
                Slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug,
                LogoUrl = dto.LogoUrl,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive
            };
            await _homepageRepo.AddBrandAsync(newB, ct);
            dto.Id = newB.Id;
            return dto;
        }

        public async Task<bool> DeleteBrandAsync(Guid id, CancellationToken ct = default)
        {
            await _homepageRepo.DeleteBrandAsync(id, ct);
            return true;
        }

        // Footer Links
        public async Task<List<FooterLinkDto>> GetFooterLinksAsync(CancellationToken ct = default)
        {
            var links = await _settingsRepo.GetFooterLinksAsync(false, ct);
            return links.Select(l => new FooterLinkDto
            {
                Id = l.Id,
                ColumnName = l.ColumnName,
                Title = l.Title,
                Url = l.Url,
                SortOrder = l.SortOrder,
                IsActive = l.IsActive
            }).ToList();
        }

        public async Task<FooterLinkDto> SaveFooterLinkAsync(FooterLinkDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var existing = (await _settingsRepo.GetFooterLinksAsync(false, ct)).FirstOrDefault(l => l.Id == dto.Id.Value);
                if (existing != null)
                {
                    existing.ColumnName = dto.ColumnName;
                    existing.Title = dto.Title;
                    existing.Url = dto.Url;
                    existing.SortOrder = dto.SortOrder;
                    existing.IsActive = dto.IsActive;
                    existing.UpdatedAtUtc = DateTime.UtcNow;
                    await _settingsRepo.SaveFooterLinkAsync(existing, ct);
                    return dto;
                }
            }

            var entity = new FooterLink
            {
                ColumnName = string.IsNullOrWhiteSpace(dto.ColumnName) ? "Shop" : dto.ColumnName,
                Title = dto.Title,
                Url = string.IsNullOrWhiteSpace(dto.Url) ? "#" : dto.Url,
                SortOrder = dto.SortOrder,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            await _settingsRepo.SaveFooterLinkAsync(entity, ct);
            dto.Id = entity.Id;
            dto.IsActive = entity.IsActive;
            return dto;
        }

        public async Task<bool> DeleteFooterLinkAsync(Guid id, CancellationToken ct = default)
        {
            await _settingsRepo.DeleteFooterLinkAsync(id, ct);
            return true;
        }

        // Social Links
        public async Task<List<SocialLinkDto>> GetSocialLinksAsync(CancellationToken ct = default)
        {
            var links = await _settingsRepo.GetSocialLinksAsync(false, ct);
            return links.Select(s => new SocialLinkDto
            {
                Id = s.Id,
                Platform = s.Platform,
                Url = s.Url,
                IconName = s.IconName,
                SortOrder = s.SortOrder,
                IsActive = s.IsActive
            }).ToList();
        }

        public async Task<SocialLinkDto> SaveSocialLinkAsync(SocialLinkDto dto, CancellationToken ct = default)
        {
            if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
            {
                var existing = (await _settingsRepo.GetSocialLinksAsync(false, ct)).FirstOrDefault(s => s.Id == dto.Id.Value);
                if (existing != null)
                {
                    existing.Platform = dto.Platform;
                    existing.Url = dto.Url;
                    existing.IconName = dto.IconName;
                    existing.SortOrder = dto.SortOrder;
                    existing.IsActive = dto.IsActive;
                    existing.UpdatedAtUtc = DateTime.UtcNow;
                    await _settingsRepo.SaveSocialLinkAsync(existing, ct);
                    return dto;
                }
            }

            var entity = new SocialLink
            {
                Platform = dto.Platform,
                Url = dto.Url,
                IconName = dto.IconName,
                SortOrder = dto.SortOrder,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            await _settingsRepo.SaveSocialLinkAsync(entity, ct);
            dto.Id = entity.Id;
            dto.IsActive = entity.IsActive;
            return dto;
        }

        public async Task<bool> DeleteSocialLinkAsync(Guid id, CancellationToken ct = default)
        {
            await _settingsRepo.DeleteSocialLinkAsync(id, ct);
            return true;
        }

        // Website Settings
        public async Task<Dictionary<string, string>> GetSettingsAsync(CancellationToken ct = default)
        {
            var s = await _settingsRepo.GetAllSettingsAsync(ct);
            return s.ToDictionary(x => x.Key, x => x.Value);
        }

        public async Task<bool> SaveSettingAsync(string key, string value, CancellationToken ct = default)
        {
            await _settingsRepo.SaveSettingAsync(key, value, "Footer", null, ct);
            return true;
        }
    }

    public class DashboardService : IDashboardService
    {
        private readonly IProductRepository _productRepo;
        private readonly ICategoryRepository _categoryRepo;
        private readonly IHomepageRepository _homepageRepo;

        public DashboardService(IProductRepository productRepo, ICategoryRepository categoryRepo, IHomepageRepository homepageRepo)
        {
            _productRepo = productRepo;
            _categoryRepo = categoryRepo;
            _homepageRepo = homepageRepo;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default)
        {
            var products = await _productRepo.GetAllAsync(false, ct);
            var categories = await _categoryRepo.GetAllAsync(false, ct);
            var slides = await _homepageRepo.GetHeroSlidesAsync(false, ct);
            var styles = await _homepageRepo.GetStyleCardsAsync(false, ct);
            var testimonials = await _homepageRepo.GetTestimonialsAsync(false, ct);
            var brands = await _homepageRepo.GetBrandsAsync(false, ct);

            return new DashboardStatsDto
            {
                TotalProducts = products.Count,
                ActiveProducts = products.Count(p => p.IsActive),
                TotalCategories = categories.Count,
                TotalHeroSlides = slides.Count,
                TotalStyleCards = styles.Count,
                TotalTestimonials = testimonials.Count,
                TotalBrands = brands.Count
            };
        }
    }
}

