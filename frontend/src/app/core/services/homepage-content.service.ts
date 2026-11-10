import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrendingProduct, PromoBannerConfig, FooterConfig } from '../models/shopora.model';

export interface HeroBannerConfig {
  id?: number;
  badgeText: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  imageUrl: string;
  desktopImageUrl?: string;
  recommendedWidth: number;
  recommendedHeight: number;
}

export interface FeatureCardItem {
  id?: number;
  cardIndex: number;
  icon: string;
  title: string;
  subtitle: string;
  displayOrder?: number;
}

export interface StyleCategoryItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  displayOrder: number;
}

export interface FlashSaleConfig {
  id?: number;
  title: string;
  productName: string;
  rating: number;
  reviewCount: string;
  salePrice: number;
  originalPrice: number;
  discountPercentage: number;
  stockLeftText: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  endsInHours: number;
  endsInMinutes: number;
  endsInSeconds: number;
}

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  comment: string;
  avatarUrl: string;
  displayOrder: number;
}

export interface SocialProofConfig {
  id?: number;
  shoppersCaption: string;
  shoppersCount: string;
  shoppersLabel: string;
  trustedBrands: string[];
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return 'assets/images/hero-upgrade-lifestyle.jpg?v=2';
  if (url.startsWith('data:')) return url;
  // If URL references localhost:5000/uploads/ or /uploads/, point directly to the static bundled asset
  if (url.includes('localhost:5000/uploads/')) {
    const filename = url.split('localhost:5000/uploads/')[1];
    return `assets/uploads/${filename}`;
  }
  if (url.startsWith('/uploads/')) {
    const filename = url.replace('/uploads/', '');
    return `assets/uploads/${filename}`;
  }
  if (url.startsWith('assets/uploads/') || url.startsWith('assets/images/')) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
}

const DEFAULT_HERO: HeroBannerConfig = {
  badgeText: 'HEALTH & WELLNESS ESSENTIALS',
  title: 'Trusted Care\n for a Healthier You',
  description: 'Premium supplements and natural medicines\nfor your everyday wellness.',
  primaryButtonText: 'Shop Now',
  primaryButtonUrl: '#trending-products',
  secondaryButtonText: 'Explore Products',
  secondaryButtonUrl: '#trending-products',
  imageUrl: 'assets/uploads/hero-1794205517574-health_wellness_text_free_1200x420.png',
  recommendedWidth: 1200,
  recommendedHeight: 420
};

const DEFAULT_FEATURE_CARDS: FeatureCardItem[] = [
  { cardIndex: 1, icon: 'fa-solid fa-truck-fast', title: 'Shipping All Pakistan', subtitle: 'Fast doorstep delivery', displayOrder: 1 },
  { cardIndex: 2, icon: 'fa-solid fa-rotate-left', title: '7-Day Money Back', subtitle: '100% refund guarantee', displayOrder: 2 },
  { cardIndex: 3, icon: 'fa-solid fa-shield-halved', title: 'Our Guarantee', subtitle: 'Satisfaction guaranteed', displayOrder: 3 },
  { cardIndex: 4, icon: 'fa-solid fa-headset', title: '24/7 Customer Service', subtitle: 'Always here to help you', displayOrder: 4 }
];

const DEFAULT_PRODUCTS: TrendingProduct[] = [
  {
    id: 1,
    name: 'Nordic Naturals Omega-3 1560 mg 8 Oz Liquid',
    category: 'Supplements',
    discount: 15,
    rating: 5.0,
    reviewCount: '2.4k',
    price: 9800,
    originalPrice: 11500,
    imageUrl: 'assets/images/nordic-naturals-omega-3.jpg',
    displayOrder: 1,
    isActive: true,
    isWishlisted: false
  },
  {
    id: 2,
    name: 'Bioray Belly Mend',
    category: 'Supplements',
    discount: 20,
    rating: 5.0,
    reviewCount: '1.2k',
    price: 8200,
    originalPrice: 10250,
    imageUrl: 'assets/uploads/prod-1794209234560-BELLY-MEND-organic.webp',
    displayOrder: 2,
    isActive: true,
    isWishlisted: false
  },
  {
    id: 9,
    name: 'Stainless Steel Insulated Sport Bottle',
    category: 'Supplements',
    discount: 20,
    rating: 5.0,
    reviewCount: '850',
    price: 4500,
    originalPrice: 5600,
    imageUrl: 'assets/images/prod-bottle.jpg',
    displayOrder: 3,
    isActive: true,
    isWishlisted: false
  },
  {
    id: 11,
    name: 'Kirkman',
    category: 'Supplements',
    discount: 14,
    rating: 5.0,
    reviewCount: '410',
    price: 500,
    originalPrice: 582,
    imageUrl: 'assets/uploads/prod-1794286652120-0283-100_bottle_1.webp',
    displayOrder: 4,
    isActive: true,
    isWishlisted: false
  }
];

const DEFAULT_PROMO: PromoBannerConfig = {
  eventTag: 'HOME REFRESH EVENT',
  title: 'Refresh Your Space',
  subtitle: 'Discover modern essentials for every corner of your home.',
  discountText: '40% OFF',
  buttonText: 'Discover Now',
  buttonUrl: '#trending-products',
  imageUrl: 'assets/uploads/promo-1794222998271-FINAL.png',
  recommendedWidth: 1200,
  recommendedHeight: 200
};

const DEFAULT_FOOTER: FooterConfig = {
  logoUrl: 'assets/images/logo.png',
  aboutText: 'Your one-stop shop for health supplements, sensory care, tech, and lifestyle essentials.',
  trustBadgeText: '100% Guaranteed & Verified',
  contactPhone: '+92 317 4641903',
  contactEmail: 'support@happysteppy.com',
  newsletterTitle: 'Stay in the Loop',
  newsletterSubtitle: 'Get the latest deals, new arrivals and exclusive store discounts.',
  socialInstagram: 'https://www.instagram.com/happysteppy01',
  socialFacebook: 'https://www.facebook.com/happysteppyltd',
  socialWhatsapp: 'https://wa.me/923174641903',
  socialTiktok: 'https://www.tiktok.com/@happysteppy.pk',
  socialYoutube: 'https://youtube.com',
  socialX: 'https://x.com',
  copyrightText: '© 2026 Happy Steppy. All rights reserved.',
  privacyPolicyUrl: '#',
  termsUrl: '#',
  showInstagram: true,
  showFacebook: true,
  showWhatsapp: true,
  showTiktok: true,
  showYoutube: true,
  showX: true
};

const DEFAULT_STYLES: StyleCategoryItem[] = [
  {
    id: 1,
    title: 'Tech Lover',
    subtitle: 'Smart & connected',
    imageUrl: 'assets/uploads/style-1794287461163-300x400.png',
    linkUrl: '/shop?cat=tech',
    displayOrder: 1
  },
  {
    id: 2,
    title: 'Modern Fashion',
    subtitle: 'Trendy & versatile',
    imageUrl: 'assets/uploads/style-1794288119428-300x400.png',
    linkUrl: '/shop?cat=fashion',
    displayOrder: 2
  },
  {
    id: 3,
    title: 'Home Vibes',
    subtitle: 'Cozy & stylish',
    imageUrl: 'assets/uploads/style-1794223760944-BELLY-MEND-bioray.webp',
    linkUrl: '/shop?cat=home',
    displayOrder: 3
  },
  {
    id: 4,
    title: 'Active Life',
    subtitle: 'Fit, strong & healthy',
    imageUrl: 'assets/uploads/style-1794223764876-BELLY-MEND-organic.webp',
    linkUrl: '/shop?cat=active',
    displayOrder: 4
  }
];

const DEFAULT_FLASH_SALE: FlashSaleConfig = {
  id: 1,
  title: 'Sale',
  productName: 'Bioray Belly Mend',
  rating: 5.0,
  reviewCount: '1.2k',
  salePrice: 8200,
  originalPrice: 10250,
  discountPercentage: 20,
  stockLeftText: 'Only 15 left!',
  buttonText: 'Grab the Deal',
  buttonUrl: '#trending-products',
  imageUrl: 'assets/images/bioray-belly-mend.webp',
  secondaryImageUrl: 'assets/images/bioray-belly-mend-bottle.webp',
  endsInHours: 11,
  endsInMinutes: 59,
  endsInSeconds: 55
};

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { id: 1, name: 'Marcus K.', role: 'Verified Buyer', comment: 'Exceptional service and authentic supplements. Happy Steppy is my go-to...', avatarUrl: 'assets/images/avatar-emily.jpg', displayOrder: 1 },
  { id: 2, name: 'Emily R.', role: 'Verified Buyer', comment: 'The quality and presentation exceeded my expectations. Fast delivery across Pakistan!', avatarUrl: 'assets/images/avatar-emily.jpg', displayOrder: 2 },
  { id: 3, name: 'Zainab A.', role: 'Verified Buyer', comment: 'Loved the product range. Pure organic supplements at best prices.', avatarUrl: 'assets/images/avatar-emily.jpg', displayOrder: 3 }
];

const DEFAULT_SOCIAL_PROOF: SocialProofConfig = {
  id: 1,
  shoppersCaption: 'Loved by',
  shoppersCount: '500,000+',
  shoppersLabel: 'Happy Shoppers',
  trustedBrands: ['Puma', 'Nordic Naturals', 'NovaTech', 'UrbanFit', 'Bioray', 'Nova']
};

const STORAGE_HERO_KEY = 'hs_homepage_hero_v2';
const STORAGE_CARDS_KEY = 'hs_feature_cards_v2';
const STORAGE_PRODUCTS_KEY = 'hs_trending_products_v2';
const STORAGE_PROMO_KEY = 'hs_homepage_promo_banner_v2';
const STORAGE_FOOTER_KEY = 'hs_homepage_footer_v2';
const STORAGE_STYLES_KEY = 'hs_homepage_styles_v2';
const STORAGE_FLASH_KEY = 'hs_homepage_flash_sale_v2';
const STORAGE_TESTIMONIALS_KEY = 'hs_homepage_testimonials_v2';
const STORAGE_PROOF_KEY = 'hs_homepage_social_proof_v2';

@Injectable({
  providedIn: 'root'
})
export class HomepageContentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/homepage';

  readonly hero = signal<HeroBannerConfig>(this.loadInitialHero());
  readonly featureCards = signal<FeatureCardItem[]>(this.loadInitialCards());
  readonly trendingProducts = signal<TrendingProduct[]>(this.loadInitialProducts());
  readonly promoBanner = signal<PromoBannerConfig>(this.loadInitialPromo());
  readonly footer = signal<FooterConfig>(this.loadInitialFooter());
  readonly styles = signal<StyleCategoryItem[]>(this.loadInitialStyles());
  readonly flashSale = signal<FlashSaleConfig>(this.loadInitialFlashSale());
  readonly testimonials = signal<TestimonialItem[]>(this.loadInitialTestimonials());
  readonly socialProof = signal<SocialProofConfig>(this.loadInitialSocialProof());
  readonly isSaving = signal<boolean>(false);

  constructor() {
    this.refresh();
  }

  private loadInitialHero(): HeroBannerConfig {
    try {
      const stored = localStorage.getItem(STORAGE_HERO_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.imageUrl) {
          parsed.imageUrl = normalizeImageUrl(parsed.imageUrl);
        }
        return parsed;
      }
    } catch {}
    return { ...DEFAULT_HERO };
  }

  private loadInitialPromo(): PromoBannerConfig {
    try {
      const stored = localStorage.getItem(STORAGE_PROMO_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.imageUrl) {
          parsed.imageUrl = normalizeImageUrl(parsed.imageUrl);
        }
        return parsed;
      }
    } catch {}
    return { ...DEFAULT_PROMO };
  }

  private loadInitialFooter(): FooterConfig {
    try {
      const stored = localStorage.getItem(STORAGE_FOOTER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.logoUrl) {
          parsed.logoUrl = normalizeImageUrl(parsed.logoUrl);
        }
        return parsed;
      }
    } catch {}
    return { ...DEFAULT_FOOTER };
  }

  private loadInitialCards(): FeatureCardItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_CARDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [...DEFAULT_FEATURE_CARDS];
  }

  private loadInitialProducts(): TrendingProduct[] {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => ({
            ...p,
            imageUrl: normalizeImageUrl(p.imageUrl)
          }));
        }
      }
    } catch {}
    return [...DEFAULT_PRODUCTS];
  }

  private loadInitialStyles(): StyleCategoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_STYLES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(s => ({
            ...s,
            imageUrl: normalizeImageUrl(s.imageUrl)
          }));
        }
      }
    } catch {}
    return [...DEFAULT_STYLES];
  }

  private loadInitialFlashSale(): FlashSaleConfig {
    try {
      const stored = localStorage.getItem(STORAGE_FLASH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.imageUrl) parsed.imageUrl = normalizeImageUrl(parsed.imageUrl);
        if (parsed.secondaryImageUrl) parsed.secondaryImageUrl = normalizeImageUrl(parsed.secondaryImageUrl);
        return parsed;
      }
    } catch {}
    return { ...DEFAULT_FLASH_SALE };
  }

  private loadInitialTestimonials(): TestimonialItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_TESTIMONIALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [...DEFAULT_TESTIMONIALS];
  }

  private loadInitialSocialProof(): SocialProofConfig {
    try {
      const stored = localStorage.getItem(STORAGE_PROOF_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { ...DEFAULT_SOCIAL_PROOF };
  }

  refresh(): void {
    // 1. Fetch Hero Banner from PostgreSQL
    this.http.get<HeroBannerConfig>(`${this.baseUrl}/hero`).subscribe({
      next: (data) => {
        if (data && data.title) {
          if (data.imageUrl) {
            data.imageUrl = normalizeImageUrl(data.imageUrl);
          }
          this.hero.set(data);
          try { localStorage.setItem(STORAGE_HERO_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Hero fetch:', err.message)
    });

    // 2. Fetch 4 Feature Cards from PostgreSQL
    this.http.get<FeatureCardItem[]>(`${this.baseUrl}/feature-cards`).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.featureCards.set(data);
          try { localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Cards fetch:', err.message)
    });

    // 3. Fetch Trending Products from PostgreSQL
    this.http.get<TrendingProduct[]>(`${this.baseUrl}/products`).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          const normalized = data.map(p => ({
            ...p,
            imageUrl: normalizeImageUrl(p.imageUrl)
          }));
          this.trendingProducts.set(normalized);
          try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(normalized)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Products fetch:', err.message)
    });

    // 4. Fetch Promo Banner from PostgreSQL
    this.http.get<PromoBannerConfig>(`${this.baseUrl}/promo-banner`).subscribe({
      next: (data) => {
        if (data && data.title) {
          if (data.imageUrl) {
            data.imageUrl = normalizeImageUrl(data.imageUrl);
          }
          this.promoBanner.set(data);
          try { localStorage.setItem(STORAGE_PROMO_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Promo banner fetch:', err.message)
    });

    // 5. Fetch Footer Settings from Database
    this.http.get<FooterConfig>(`${this.baseUrl}/footer`).subscribe({
      next: (data) => {
        if (data && data.aboutText) {
          if (data.logoUrl) {
            data.logoUrl = normalizeImageUrl(data.logoUrl);
          }
          this.footer.set(data);
          try { localStorage.setItem(STORAGE_FOOTER_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Footer fetch:', err.message)
    });

    // 6. Fetch 4 Style Categories
    this.http.get<StyleCategoryItem[]>(`${this.baseUrl}/styles`).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(s => ({ ...s, imageUrl: normalizeImageUrl(s.imageUrl) }));
          this.styles.set(normalized);
          try { localStorage.setItem(STORAGE_STYLES_KEY, JSON.stringify(normalized)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Styles fetch:', err.message)
    });

    // 7. Fetch Flash Sale Deal
    this.http.get<FlashSaleConfig>(`${this.baseUrl}/flash-sale`).subscribe({
      next: (data) => {
        if (data && data.productName) {
          data.imageUrl = normalizeImageUrl(data.imageUrl);
          if (data.secondaryImageUrl) {
            data.secondaryImageUrl = normalizeImageUrl(data.secondaryImageUrl);
          }
          this.flashSale.set(data);
          try { localStorage.setItem(STORAGE_FLASH_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Flash Sale fetch:', err.message)
    });

    // 8. Fetch Customer Reviews (Testimonials)
    this.http.get<TestimonialItem[]>(`${this.baseUrl}/testimonials`).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(t => ({ ...t, avatarUrl: normalizeImageUrl(t.avatarUrl) }));
          this.testimonials.set(normalized);
          try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(normalized)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Testimonials fetch:', err.message)
    });

    // 9. Fetch Social Proof & Trusted Brands
    this.http.get<SocialProofConfig>(`${this.baseUrl}/social-proof`).subscribe({
      next: (data) => {
        if (data && data.shoppersCaption) {
          this.socialProof.set(data);
          try { localStorage.setItem(STORAGE_PROOF_KEY, JSON.stringify(data)); } catch {}
        }
      },
      error: (err) => console.warn('[HomepageContent] Social proof fetch:', err.message)
    });
  }

  updateFooter(
    payload: Partial<FooterConfig>,
    callback?: (updated: FooterConfig) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const updated = { ...this.footer(), ...payload };
    if (updated.logoUrl) {
      updated.logoUrl = normalizeImageUrl(updated.logoUrl);
    }
    this.footer.set(updated);
    try { localStorage.setItem(STORAGE_FOOTER_KEY, JSON.stringify(updated)); } catch {}

    this.http.put<FooterConfig>(`${this.baseUrl}/footer`, updated).subscribe({
      next: (res) => {
        if (res && res.logoUrl) {
          res.logoUrl = normalizeImageUrl(res.logoUrl);
        }
        this.footer.set(res);
        try { localStorage.setItem(STORAGE_FOOTER_KEY, JSON.stringify(res)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(res);
      },
      error: (err) => {
        console.warn('[HomepageContent] Footer update error:', err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  updatePromoBanner(
    payload: Partial<PromoBannerConfig>,
    callback?: (updated: PromoBannerConfig) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const updated = { ...this.promoBanner(), ...payload };
    if (updated.imageUrl) {
      updated.imageUrl = normalizeImageUrl(updated.imageUrl);
    }
    this.promoBanner.set(updated);
    try { localStorage.setItem(STORAGE_PROMO_KEY, JSON.stringify(updated)); } catch {}

    this.http.put<PromoBannerConfig>(`${this.baseUrl}/promo-banner`, updated).subscribe({
      next: (res) => {
        if (res && res.imageUrl) {
          res.imageUrl = normalizeImageUrl(res.imageUrl);
        }
        this.promoBanner.set(res);
        try { localStorage.setItem(STORAGE_PROMO_KEY, JSON.stringify(res)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(res);
      },
      error: (err) => {
        console.warn('[HomepageContent] Promo banner update error:', err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  updateHero(payload: Partial<HeroBannerConfig>): void {
    this.isSaving.set(true);
    const updated = { ...this.hero(), ...payload };
    if (updated.imageUrl) {
      updated.imageUrl = normalizeImageUrl(updated.imageUrl);
    }
    this.hero.set(updated);
    try { localStorage.setItem(STORAGE_HERO_KEY, JSON.stringify(updated)); } catch {}

    this.http.put<HeroBannerConfig>(`${this.baseUrl}/hero`, updated).subscribe({
      next: (res) => {
        if (res && res.imageUrl) {
          res.imageUrl = normalizeImageUrl(res.imageUrl);
        }
        this.hero.set(res);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.warn('[HomepageContent] Hero update:', err.message);
        this.isSaving.set(false);
      }
    });
  }

  updateFeatureCards(cards: FeatureCardItem[]): void {
    this.isSaving.set(true);
    this.featureCards.set(cards);
    try { localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(cards)); } catch {}

    this.http.put<FeatureCardItem[]>(`${this.baseUrl}/feature-cards`, cards).subscribe({
      next: (res) => {
        this.featureCards.set(res);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.warn('[HomepageContent] Cards update:', err.message);
        this.isSaving.set(false);
      }
    });
  }

  // --- Product Management (PostgreSQL synced) ---
  addProduct(
    prod: Partial<TrendingProduct>,
    callback?: (created: TrendingProduct) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    this.http.post<TrendingProduct>(`${this.baseUrl}/products`, prod).subscribe({
      next: (created) => {
        const normalized = { ...created, imageUrl: normalizeImageUrl(created.imageUrl) };
        const current = [...this.trendingProducts(), normalized];
        this.trendingProducts.set(current);
        try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(current)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(normalized);
      },
      error: (err) => {
        console.warn('[HomepageContent] Product add:', err?.message || err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  updateProduct(
    id: number,
    prod: Partial<TrendingProduct>,
    callback?: (updated: TrendingProduct) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    this.http.put<TrendingProduct>(`${this.baseUrl}/products/${id}`, prod).subscribe({
      next: (updated) => {
        const normalized = { ...updated, imageUrl: normalizeImageUrl(updated.imageUrl) };
        const list = this.trendingProducts().map(p => p.id === id ? normalized : p);
        this.trendingProducts.set(list);
        try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(list)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(normalized);
      },
      error: (err) => {
        console.warn('[HomepageContent] Product update:', err?.message || err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  deleteProduct(id: number, callback?: () => void, errorCallback?: (err: any) => void): void {
    this.isSaving.set(true);
    this.http.delete(`${this.baseUrl}/products/${id}`).subscribe({
      next: () => {
        const list = this.trendingProducts().filter(p => p.id !== id);
        this.trendingProducts.set(list);
        try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(list)); } catch {}
        this.isSaving.set(false);
        if (callback) callback();
      },
      error: (err) => {
        console.warn('[HomepageContent] Product delete:', err?.message || err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  // --- 6. Shop by Style Actions ---
  updateStyles(
    styles: StyleCategoryItem[],
    callback?: (res: StyleCategoryItem[]) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const normalized = styles.map(s => ({ ...s, imageUrl: normalizeImageUrl(s.imageUrl) }));
    this.styles.set(normalized);
    try { localStorage.setItem(STORAGE_STYLES_KEY, JSON.stringify(normalized)); } catch {}

    this.http.put<StyleCategoryItem[]>(`${this.baseUrl}/styles`, normalized).subscribe({
      next: (res) => {
        const norm = res.map(s => ({ ...s, imageUrl: normalizeImageUrl(s.imageUrl) }));
        this.styles.set(norm);
        try { localStorage.setItem(STORAGE_STYLES_KEY, JSON.stringify(norm)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(norm);
      },
      error: (err) => {
        console.warn('[HomepageContent] Styles update error:', err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  // --- 7. Flash Sale Actions ---
  updateFlashSale(
    payload: Partial<FlashSaleConfig>,
    callback?: (res: FlashSaleConfig) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const updated = { ...this.flashSale(), ...payload };
    if (updated.imageUrl) updated.imageUrl = normalizeImageUrl(updated.imageUrl);
    if (updated.secondaryImageUrl) updated.secondaryImageUrl = normalizeImageUrl(updated.secondaryImageUrl);
    this.flashSale.set(updated);
    try { localStorage.setItem(STORAGE_FLASH_KEY, JSON.stringify(updated)); } catch {}

    this.http.put<FlashSaleConfig>(`${this.baseUrl}/flash-sale`, updated).subscribe({
      next: (res) => {
        const safeRes: FlashSaleConfig = { ...updated, ...(res || {}) };
        if (safeRes.imageUrl) safeRes.imageUrl = normalizeImageUrl(safeRes.imageUrl);
        if (safeRes.secondaryImageUrl) safeRes.secondaryImageUrl = normalizeImageUrl(safeRes.secondaryImageUrl);
        this.flashSale.set(safeRes);
        try { localStorage.setItem(STORAGE_FLASH_KEY, JSON.stringify(safeRes)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(safeRes);
      },
      error: (err) => {
        console.warn('[HomepageContent] Flash sale update error:', err);
        this.isSaving.set(false);
        if (errorCallback) errorCallback(err);
      }
    });
  }

  // --- 8. Customer Reviews (Testimonials) Actions ---
  addTestimonial(
    item: Partial<TestimonialItem>,
    callback?: (created: TestimonialItem) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const fallbackItem: TestimonialItem = {
      id: Date.now(),
      name: item.name || 'Customer',
      role: item.role || 'Verified Buyer',
      comment: item.comment || '',
      avatarUrl: normalizeImageUrl(item.avatarUrl || 'assets/images/avatar-emily.jpg'),
      displayOrder: this.testimonials().length + 1
    };

    this.http.post<TestimonialItem>(`${this.baseUrl}/testimonials`, item).subscribe({
      next: (created) => {
        const normalized = { ...created, avatarUrl: normalizeImageUrl(created.avatarUrl) };
        const list = [...this.testimonials(), normalized];
        this.testimonials.set(list);
        try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(list)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(normalized);
      },
      error: (err) => {
        console.warn('[HomepageContent] Testimonial add fallback to local:', err);
        const list = [...this.testimonials(), fallbackItem];
        this.testimonials.set(list);
        try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(list)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(fallbackItem);
        else if (errorCallback) errorCallback(err);
      }
    });
  }

  updateSingleTestimonial(
    id: number,
    item: Partial<TestimonialItem>,
    callback?: (updated: TestimonialItem) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const existing = this.testimonials().find(t => t.id === id);
    const updatedLocally: TestimonialItem = {
      ...(existing || { id, displayOrder: 1 }),
      ...item,
      id,
      name: item.name || existing?.name || 'Customer',
      role: item.role || existing?.role || 'Verified Buyer',
      comment: item.comment || existing?.comment || '',
      avatarUrl: normalizeImageUrl(item.avatarUrl || existing?.avatarUrl || 'assets/images/avatar-emily.jpg'),
      displayOrder: item.displayOrder || existing?.displayOrder || 1
    };
    const list = this.testimonials().map(t => t.id === id ? updatedLocally : t);
    this.testimonials.set(list);
    try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(list)); } catch {}

    this.http.put<TestimonialItem>(`${this.baseUrl}/testimonials/${id}`, item).subscribe({
      next: (updated) => {
        const normalized = { ...updated, avatarUrl: normalizeImageUrl(updated.avatarUrl) };
        const finalList = this.testimonials().map(t => t.id === id ? normalized : t);
        this.testimonials.set(finalList);
        try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(finalList)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(normalized);
      },
      error: (err) => {
        console.warn('[HomepageContent] Testimonial update fallback to local:', err);
        this.isSaving.set(false);
        if (callback) callback(updatedLocally);
        else if (errorCallback) errorCallback(err);
      }
    });
  }

  deleteTestimonial(
    id: number,
    callback?: () => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const list = this.testimonials().filter(t => t.id !== id);
    this.testimonials.set(list);
    try { localStorage.setItem(STORAGE_TESTIMONIALS_KEY, JSON.stringify(list)); } catch {}

    this.http.delete(`${this.baseUrl}/testimonials/${id}`).subscribe({
      next: () => {
        this.isSaving.set(false);
        if (callback) callback();
      },
      error: (err) => {
        console.warn('[HomepageContent] Testimonial delete local fallback:', err);
        this.isSaving.set(false);
        if (callback) callback();
        else if (errorCallback) errorCallback(err);
      }
    });
  }

  // --- 9. Social Proof & Brands Actions ---
  updateSocialProof(
    payload: Partial<SocialProofConfig>,
    callback?: (res: SocialProofConfig) => void,
    errorCallback?: (err: any) => void
  ): void {
    this.isSaving.set(true);
    const updated = { ...this.socialProof(), ...payload };
    this.socialProof.set(updated);
    try { localStorage.setItem(STORAGE_PROOF_KEY, JSON.stringify(updated)); } catch {}

    this.http.put<SocialProofConfig>(`${this.baseUrl}/social-proof`, updated).subscribe({
      next: (res) => {
        const safeRes: SocialProofConfig = { ...updated, ...(res || {}) };
        this.socialProof.set(safeRes);
        try { localStorage.setItem(STORAGE_PROOF_KEY, JSON.stringify(safeRes)); } catch {}
        this.isSaving.set(false);
        if (callback) callback(safeRes);
      },
      error: (err) => {
        console.warn('[HomepageContent] Social proof update error:', err);
        this.isSaving.set(false);
        if (callback) callback(updated);
        else if (errorCallback) errorCallback(err);
      }
    });
  }
}
