import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryItem, TrendingProduct } from '../../core/models/shopora.model';
import { ApiService } from '../../core/services/api.service';

export interface StyleCategory {
  title: string;
  subtitle: string;
  imgUrl: string;
}

@Component({
  selector: 'app-storefront',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './storefront.component.html',
  styleUrl: './storefront.component.scss'
})
export class StorefrontComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly api = inject(ApiService);
  private readonly host = inject(ElementRef);
  private scrollObserver: IntersectionObserver | null = null;

  searchQuery = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  cartCount = signal<number>(2);
  wishlistCount = signal<number>(0);
  activeMenu = signal<string>('Home');
  activeSidebarCat = signal<string>('Electronics');

  // Flash Sale Dynamic State & Countdown
  flashSale = signal<{
    title: string;
    subtitle: string;
    discountPercentage: number;
    endsAtUtc: string;
    isActive: boolean;
    productName: string;
    imageUrl: string;
    ratingText: string;
    salePrice: string;
    originalPrice: string;
    stockLeftText: string;
    buttonText: string;
    buttonUrl: string;
  }>({
    title: 'Flash Sale',
    subtitle: 'Limited Time Offer',
    discountPercentage: 25,
    endsAtUtc: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    isActive: true,
    productName: 'Wireless Headphones',
    imageUrl: 'assets/images/flash-headphones.jpg?v=6',
    ratingText: '4.8 (3.5k)',
    salePrice: '$79.99',
    originalPrice: '$99.99',
    stockLeftText: 'Only 42 left!',
    buttonText: 'Grab the Deal',
    buttonUrl: '#trending-products'
  });
  flashHours = signal<number>(12);
  flashMinutes = signal<number>(24);
  flashSeconds = signal<number>(36);
  private timerInterval: any;

  // Newsletter
  newsletterEmail = signal<string>('');
  isSubscribed = signal<boolean>(false);

  // Store Toast Notification
  storeToast = signal<{ message: string; title: string; image?: string } | null>(null);
  private storeToastTimer: any = null;

  showStoreToast(msg: string, title: string = 'Added to Cart', image?: string) {
    if (this.storeToastTimer) clearTimeout(this.storeToastTimer);
    this.storeToast.set({ message: msg, title, image });
    this.storeToastTimer = setTimeout(() => this.storeToast.set(null), 3200);
  }

  // Social Media Links (Official Happy Steppy Channels)
  socialLinks = signal<{ [key: string]: string }>({
    facebook: 'https://www.facebook.com/happysteppyltd',
    whatsapp: 'https://wa.me/923174641903',
    tiktok: 'https://www.tiktok.com/@happysteppy.pk',
    instagram: 'https://www.instagram.com/happysteppy01',
    youtube: 'https://youtube.com',
    x: 'https://x.com'
  });

  // Footer Links & Settings
  footerLinks = signal<any[]>([]);
  footerSettings = signal<{ [key: string]: string }>({
    CopyrightText: '© 2026 Happy Steppy. All rights reserved.',
    ContactPhone: '+92 317 4641903',
    ContactEmail: 'support@happysteppy.com',
    FooterAbout: 'Your one-stop shop for lifestyle, tech, home and more.',
    NewsletterTitle: 'Stay in the Loop',
    NewsletterSubtitle: 'Get the latest deals, new arrivals and more.'
  });

  // Hero Slide
  heroSlide = signal<{
    title: string;
    subtitle: string;
    description: string;
    badgeText: string;
    primaryButtonText: string;
    primaryButtonUrl: string;
    secondaryButtonText: string;
    secondaryButtonUrl: string;
    desktopImageUrl: string;
  }>({
    title: 'Upgrade Your Lifestyle',
    subtitle: 'Discover top picks for home, tech, fashion and more — all in one place.',
    description: 'Discover top picks for home, tech, fashion and more — all in one place.',
    badgeText: 'LIMITED TIME OFFER',
    primaryButtonText: 'Shop the Collection',
    primaryButtonUrl: '/products',
    secondaryButtonText: 'Explore Deals',
    secondaryButtonUrl: '/deals',
    desktopImageUrl: 'assets/images/hero-upgrade-lifestyle.jpg?v=2'
  });

  // Dynamic Promotional Banner
  promoBanner = signal<{
    title: string;
    subtitle: string;
    discountText: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl: string;
  }>({
    title: 'Modern Living Essentials',
    subtitle: 'Stylish, functional and made for everyday comfort.',
    discountText: '50% OFF',
    buttonText: 'Discover Now',
    buttonUrl: '/products',
    imageUrl: 'assets/images/home-refresh-banner.jpg'
  });

  // Sidebar Categories
  readonly categories = signal<CategoryItem[]>([
    { name: 'Electronics', icon: 'fa-solid fa-headphones', imgUrl: '' },
    { name: 'Beauty & Personal Care', icon: 'fa-solid fa-pump-soap', imgUrl: '' },
    { name: 'Sports & Fitness', icon: 'fa-solid fa-dumbbell', imgUrl: '' },
    { name: 'Toys & Kids', icon: 'fa-solid fa-shapes', imgUrl: '' },
    { name: 'Books & Stationery', icon: 'fa-solid fa-book-open', imgUrl: '' },
    { name: 'Accessories', icon: 'fa-solid fa-clock', imgUrl: '' }
  ]);

  // 4 "Shop by Style" Cards
  readonly styleCategories = signal<StyleCategory[]>([
    { title: 'Tech Lover', subtitle: 'Smart & connected', imgUrl: 'assets/images/style-tech.jpg' },
    { title: 'Modern Fashion', subtitle: 'Trendy & versatile', imgUrl: 'assets/images/style-fashion.jpg' },
    { title: 'Home Vibes', subtitle: 'Cozy & stylish', imgUrl: 'assets/images/style-home.jpg' },
    { title: 'Active Life', subtitle: 'Fit, strong & healthy', imgUrl: 'assets/images/style-active.jpg' }
  ]);

  // Trusted Brands from DB
  readonly trustedBrands = signal<{ name: string; logoUrl?: string | null }[]>([
    { name: 'NovaTech', logoUrl: null },
    { name: 'UrbanFit', logoUrl: null },
    { name: 'PureCare', logoUrl: null },
    { name: 'PlayZone', logoUrl: null }
  ]);

  // Testimonial from DB
  readonly testimonialsList = signal<any[]>([]);
  readonly currentTestimonialIndex = signal<number>(0);
  readonly isTestimonialSliding = signal<boolean>(false);
  private testimonialInterval: any;
  private isTestimonialsPaused = false;

  readonly testimonial = signal<{
    name: string;
    role: string;
    comment: string;
    avatarUrl: string;
  }>({
    name: 'Emily R.',
    role: 'Verified Customer',
    comment: 'Great quality, super fast delivery and an amazing shopping experience! Happy Steppy has become my go-to store.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  });

  // 5 Trending Products
  readonly trendingProducts = signal<TrendingProduct[]>([
    {
      id: 1,
      name: 'Wireless Headphones',
      category: 'Electronics',
      discount: 25,
      rating: 4.8,
      reviewCount: '3.5k',
      price: 59.99,
      originalPrice: 79.99,
      imageUrl: 'assets/images/prod-headphones.jpg?v=5',
      isWishlisted: false
    },
    {
      id: 2,
      name: 'Smartwatch Pro',
      category: 'Electronics',
      discount: 20,
      rating: 4.7,
      reviewCount: '2.9k',
      price: 79.99,
      originalPrice: 99.99,
      imageUrl: 'assets/images/prod-smartwatch.jpg?v=5',
      isWishlisted: false
    },
    {
      id: 3,
      name: 'Casual Sneakers',
      category: 'Fashion',
      discount: 30,
      rating: 4.6,
      reviewCount: '1.8k',
      price: 49.99,
      originalPrice: 69.99,
      imageUrl: 'assets/images/prod-sneakers.jpg?v=5',
      isWishlisted: false
    },
    {
      id: 4,
      name: 'Daily Laptop Backpack',
      category: 'Accessories',
      discount: 25,
      rating: 4.8,
      reviewCount: '897',
      price: 44.99,
      originalPrice: 59.99,
      imageUrl: 'assets/images/prod-backpack.jpg?v=5',
      isWishlisted: false
    },
    {
      id: 5,
      name: 'Insulated Water Bottle',
      category: 'Sports & Fitness',
      discount: 20,
      rating: 4.7,
      reviewCount: '1.2k',
      price: 19.99,
      originalPrice: 24.99,
      imageUrl: 'assets/images/prod-bottle.jpg?v=5',
      isWishlisted: false
    }
  ]);

  getLinksForColumn(col: string) {
    const list = this.footerLinks().filter(l => l.columnName?.toLowerCase() === col.toLowerCase());
    return list.length > 0 ? list : null;
  }

  ngOnInit() {
    this.startCountdown();
    this.loadHomepageFromApi();
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  private setupScrollAnimations() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.host.nativeElement.querySelectorAll('.scroll-fade-up, .scroll-stagger').forEach((el: Element) => {
        el.classList.add('in-view');
      });
      return;
    }

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.scrollObserver?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    this.observeElements();
  }

  private observeElements() {
    setTimeout(() => {
      if (!this.scrollObserver) return;
      const elements = this.host.nativeElement.querySelectorAll('.scroll-fade-up:not(.in-view), .scroll-stagger:not(.in-view)');
      elements.forEach((el: Element) => this.scrollObserver?.observe(el));
    }, 120);
  }

  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }

  startTestimonialRotation() {
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
    // Auto-slide every 3 seconds (3000ms)
    this.testimonialInterval = setInterval(() => {
      if (this.isTestimonialsPaused) return;
      this.nextTestimonial();
    }, 3000);
  }

  nextTestimonial() {
    const list = this.testimonialsList();
    if (list.length <= 1) return;
    this.isTestimonialSliding.set(true);
    setTimeout(() => {
      this.currentTestimonialIndex.update(idx => (idx + 1) % list.length);
      const t = list[this.currentTestimonialIndex()];
      this.testimonial.set({
        name: t.customerName,
        role: t.customerRole,
        comment: t.comment,
        avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      });
      setTimeout(() => {
        this.isTestimonialSliding.set(false);
      }, 50);
    }, 250);
  }

  prevTestimonial() {
    const list = this.testimonialsList();
    if (list.length <= 1) return;
    this.isTestimonialSliding.set(true);
    setTimeout(() => {
      this.currentTestimonialIndex.update(idx => (idx - 1 + list.length) % list.length);
      const t = list[this.currentTestimonialIndex()];
      this.testimonial.set({
        name: t.customerName,
        role: t.customerRole,
        comment: t.comment,
        avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      });
      setTimeout(() => {
        this.isTestimonialSliding.set(false);
      }, 50);
    }, 250);
  }

  goToTestimonial(idx: number) {
    const list = this.testimonialsList();
    if (idx < 0 || idx >= list.length || idx === this.currentTestimonialIndex()) return;
    this.isTestimonialSliding.set(true);
    setTimeout(() => {
      this.currentTestimonialIndex.set(idx);
      const t = list[idx];
      this.testimonial.set({
        name: t.customerName,
        role: t.customerRole,
        comment: t.comment,
        avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      });
      setTimeout(() => {
        this.isTestimonialSliding.set(false);
      }, 50);
    }, 250);
  }

  pauseTestimonials() {
    this.isTestimonialsPaused = true;
  }

  resumeTestimonials() {
    this.isTestimonialsPaused = false;
  }

  private loadHomepageFromApi() {
    this.api.getPublicHomepage().subscribe({
      next: (data: any) => {
        // Dynamic Hero Slide
        if (data.heroSlides && data.heroSlides.length > 0) {
          const s = data.heroSlides[0];
          this.heroSlide.set({
            title: s.title || this.heroSlide().title,
            subtitle: s.subtitle || this.heroSlide().subtitle,
            description: s.description || this.heroSlide().description,
            badgeText: s.badgeText || this.heroSlide().badgeText,
            primaryButtonText: s.primaryButtonText || this.heroSlide().primaryButtonText,
            primaryButtonUrl: s.primaryButtonUrl || this.heroSlide().primaryButtonUrl,
            secondaryButtonText: s.secondaryButtonText || this.heroSlide().secondaryButtonText,
            secondaryButtonUrl: s.secondaryButtonUrl || this.heroSlide().secondaryButtonUrl,
            desktopImageUrl: s.desktopImageUrl || this.heroSlide().desktopImageUrl
          });
        }

        // Dynamic Brands
        if (data.brands && data.brands.length > 0) {
          this.trustedBrands.set(data.brands.map((b: any) => ({ name: b.name, logoUrl: b.logoUrl })));
        }

        // Dynamic Testimonials
        if (data.testimonials && data.testimonials.length > 0) {
          this.testimonialsList.set(data.testimonials);
          const t = data.testimonials[0];
          this.testimonial.set({
            name: t.customerName,
            role: t.customerRole,
            comment: t.comment,
            avatarUrl: t.avatarUrl || this.testimonial().avatarUrl
          });
          this.startTestimonialRotation();
        }

        // Dynamic Promo Banner
        if (data.promotionalBanner) {
          const b = data.promotionalBanner;
          this.promoBanner.set({
            title: b.title || this.promoBanner().title,
            subtitle: b.subtitle || this.promoBanner().subtitle,
            discountText: b.discountText || this.promoBanner().discountText,
            buttonText: b.buttonText || this.promoBanner().buttonText,
            buttonUrl: b.buttonUrl || this.promoBanner().buttonUrl,
            imageUrl: b.imageUrl || this.promoBanner().imageUrl
          });
        }

        // Dynamic Flash Sale
        if (data.flashSale) {
          const fs = data.flashSale;
          this.flashSale.set({
            title: fs.title || 'Flash Sale',
            subtitle: fs.subtitle || 'Limited Time Offer',
            discountPercentage: fs.discountPercentage || 25,
            endsAtUtc: fs.endsAtUtc || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
            isActive: fs.isActive ?? true,
            productName: fs.productName || 'Wireless Headphones',
            imageUrl: fs.imageUrl || 'assets/images/flash-headphones.jpg?v=6',
            ratingText: fs.ratingText || '4.8 (3.5k)',
            salePrice: fs.salePrice || '$79.99',
            originalPrice: fs.originalPrice || '$99.99',
            stockLeftText: fs.stockLeftText || 'Only 42 left!',
            buttonText: fs.buttonText || 'Grab the Deal',
            buttonUrl: fs.buttonUrl || '#trending-products'
          });
          this.calculateFlashRemaining();
        }

        // Dynamic Categories from DB (For Desktop Sidebar & Mobile Drawer - preserve defaults if DB has style seed only)
        if (data.categories && data.categories.length > 0) {
          const customCats = data.categories.filter((c: any) => c.showInSidebar !== false && c.iconName);
          if (customCats.length >= 4) {
            this.categories.set(customCats.map((c: any) => ({
              name: c.name,
              icon: c.iconName,
              imgUrl: c.imageUrl || ''
            })));
          }
        }

        // Dynamic Style Cards
        if (data.styleCards && data.styleCards.length >= 4) {
          this.styleCategories.set(data.styleCards.slice(0, 4).map((s: any) => ({
            title: s.title,
            subtitle: s.subtitle,
            imgUrl: s.imageUrl
          })));
        }

        // Dynamic Trending Products from DB
        if (data.trendingProducts && data.trendingProducts.length > 0) {
          const mapped = data.trendingProducts.map((p: any, idx: number) => ({
            id: idx + 1,
            name: p.name,
            category: p.brandName || 'General',
            discount: p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 20,
            rating: p.rating || 4.8,
            reviewCount: (p.reviewsCount || 150).toString(),
            price: p.price,
            originalPrice: p.compareAtPrice || p.price * 1.25,
            imageUrl: p.primaryImageUrl || 'assets/images/prod-headphones.jpg?v=5',
            isWishlisted: false
          }));
          this.trendingProducts.set(mapped);
        }

        // Dynamic Social Links
        if (data.socialLinks && data.socialLinks.length > 0) {
          const map = { ...this.socialLinks() };
          for (const s of data.socialLinks) {
            if (s.platform && s.url) {
              const key = s.platform.toLowerCase();
              map[key] = s.url;
            }
          }
          this.socialLinks.set(map);
        }

        // Dynamic Footer Links
        if (data.footerLinks && data.footerLinks.length > 0) {
          this.footerLinks.set(data.footerLinks);
        }

        // Dynamic Footer Settings (Copyright, Tagline, Contact)
        if (data.settings) {
          this.footerSettings.update(curr => ({ ...curr, ...data.settings }));
        }

        this.observeElements();
      },
      error: (err) => {
        console.warn('API connection offline, using cached storefront assets', err);
      }
    });
  }

  private calculateFlashRemaining() {
    const endsStr = this.flashSale().endsAtUtc;
    if (!endsStr) return;
    const ends = new Date(endsStr).getTime();
    const now = Date.now();
    const diff = Math.max(0, ends - now);

    const totalSeconds = Math.floor(diff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    this.flashHours.set(h);
    this.flashMinutes.set(m);
    this.flashSeconds.set(s);
  }

  private startCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.calculateFlashRemaining();
    this.timerInterval = setInterval(() => {
      this.calculateFlashRemaining();
    }, 1000);
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  toggleWishlist(product: TrendingProduct, event: MouseEvent) {
    event.stopPropagation();
    product.isWishlisted = !product.isWishlisted;
    this.wishlistCount.update(c => product.isWishlisted ? c + 1 : Math.max(0, c - 1));
  }

  addToCart(product: TrendingProduct, event: MouseEvent) {
    event.stopPropagation();
    this.cartCount.update(c => c + 1);

    const btn = event.currentTarget as HTMLElement;
    btn.style.transform = 'scale(1.25)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 200);

    this.showStoreToast(`${product.name} has been added to your shopping cart.`, 'Added to Cart 🛍️', product.imageUrl);
  }

  subscribeNewsletter() {
    if (this.newsletterEmail().trim()) {
      this.isSubscribed.set(true);
      this.showStoreToast('Thank you for subscribing to Happy Steppy updates!', 'Subscribed 🎉');
      setTimeout(() => {
        this.newsletterEmail.set('');
        this.isSubscribed.set(false);
      }, 3000);
    }
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
