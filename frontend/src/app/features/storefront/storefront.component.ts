import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryItem, TrendingProduct } from '../../core/models/shopora.model';

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
  private readonly host = inject(ElementRef);
  private scrollObserver: IntersectionObserver | null = null;

  searchQuery = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  cartCount = signal<number>(2);
  wishlistCount = signal<number>(0);
  activeMenu = signal<string>('Home');
  activeSidebarCat = signal<string>('Bioray');

  // Flash Sale Dynamic State & Countdown
  flashSale = signal<{
    title: string;
    subtitle: string;
    discountPercentage: number;
    endsAtUtc: string;
    isActive: boolean;
    productName: string;
    imageUrl: string;
    secondaryImageUrl?: string;
    ratingText: string;
    salePrice: string;
    originalPrice: string;
    stockLeftText: string;
    buttonText: string;
    buttonUrl: string;
  }>({
    title: 'Sale',
    subtitle: 'Gut Support & Immunity',
    discountPercentage: 20,
    endsAtUtc: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    isActive: true,
    productName: 'Bioray Belly Mend',
    imageUrl: 'assets/images/bioray-belly-mend.webp',
    secondaryImageUrl: 'assets/images/bioray-belly-mend-bottle.webp',
    ratingText: '5.0 (1.2k)',
    salePrice: '₨8,200',
    originalPrice: '₨10,250',
    stockLeftText: 'Only 15 left!',
    buttonText: 'Grab the Deal',
    buttonUrl: '#trending-products'
  });
  flashHours = signal<number>(10);
  flashMinutes = signal<number>(39);
  flashSeconds = signal<number>(30);
  private timerInterval: any;

  // Flash Sale Interactive Images (Box + Bottle)
  activeFlashImgIndex = signal<number>(0);
  isFlashImgHovered = signal<boolean>(false);

  setFlashHover(hovered: boolean) {
    this.isFlashImgHovered.set(hovered);
  }

  selectFlashImgIndex(index: number) {
    this.activeFlashImgIndex.set(index);
  }

  currentFlashImg(): string {
    const fs = this.flashSale();
    if (this.isFlashImgHovered() && fs.secondaryImageUrl) {
      return fs.secondaryImageUrl;
    }
    if (this.activeFlashImgIndex() === 1 && fs.secondaryImageUrl) {
      return fs.secondaryImageUrl;
    }
    return fs.imageUrl || 'assets/images/bioray-belly-mend.webp';
  }

  onFlashSaleCta() {
    this.cartCount.update(c => c + 1);
    this.showStoreToast(
      `${this.flashSale().productName} (₨8,200) added to cart!`,
      '⚡ Flash Deal Claimed',
      this.currentFlashImg()
    );
  }

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
  footerLinks = signal<any[]>([
    { columnName: 'customer care', label: 'Help Center & FAQ', url: '#' },
    { columnName: 'customer care', label: 'Track Your Order', url: '#' },
    { columnName: 'customer care', label: 'Returns & Refunds', url: '#' },
    { columnName: 'customer care', label: 'Shipping & Delivery', url: '#' },
    { columnName: 'shop categories', label: 'Supplements', url: '#trending-products' },
    { columnName: 'shop categories', label: 'Tech Lover', url: '#style-categories' },
    { columnName: 'shop categories', label: 'Modern Fashion', url: '#style-categories' },
    { columnName: 'shop categories', label: 'Home Vibes', url: '#style-categories' },
    { columnName: 'shop categories', label: 'Active Life', url: '#style-categories' },
    { columnName: 'about happy steppy', label: 'Our Story', url: '#' },
    { columnName: 'about happy steppy', label: 'Authentic Quality', url: '#' },
    { columnName: 'about happy steppy', label: 'Contact Us', url: '#' }
  ]);

  footerSettings = signal<{ [key: string]: string }>({
    CopyrightText: '© 2026 Happy Steppy. All rights reserved.',
    ContactPhone: '+92 317 4641903',
    ContactEmail: 'support@happysteppy.com',
    FooterAbout: 'Your one-stop shop for health supplements, sensory care, tech, and lifestyle essentials.',
    NewsletterTitle: 'Stay in the Loop',
    NewsletterSubtitle: 'Get the latest deals, new arrivals and exclusive store discounts.'
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
    primaryButtonUrl: '#trending-products',
    secondaryButtonText: 'Explore Deals',
    secondaryButtonUrl: '#trending-products',
    desktopImageUrl: 'assets/images/hero-upgrade-lifestyle.jpg?v=2'
  });

  // Promotional Banner
  promoBanner = signal<{
    title: string;
    subtitle: string;
    discountText: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl: string;
  }>({
    title: 'Refresh Your Space',
    subtitle: 'Discover modern essentials for every corner of your home.',
    discountText: 'Up to 40% OFF',
    buttonText: 'Discover Now',
    buttonUrl: '#trending-products',
    imageUrl: 'assets/images/home-refresh-banner.jpg'
  });

  // Sidebar Categories (Top Brands matching store spec)
  readonly categories = signal<CategoryItem[]>([
    { name: 'Bioray', icon: 'fa-solid fa-flask', imgUrl: '' },
    { name: 'CBD Plus', icon: 'fa-solid fa-leaf', imgUrl: '' },
    { name: 'Designs for Health', icon: 'fa-solid fa-heart-pulse', imgUrl: '' },
    { name: 'Kirkman', icon: 'fa-solid fa-capsules', imgUrl: '' },
    { name: 'Life Extension', icon: 'fa-solid fa-dna', imgUrl: '' },
    { name: 'Mary Ruth', icon: 'fa-solid fa-shield-heart', imgUrl: '' },
    { name: 'Nature\'s Answer', icon: 'fa-solid fa-seedling', imgUrl: '' },
    { name: 'Nature\'s Way', icon: 'fa-solid fa-tree', imgUrl: '' },
    { name: 'NOW Foods', icon: 'fa-solid fa-apple-whole', imgUrl: '' },
    { name: 'Nordic Naturals', icon: 'fa-solid fa-fish', imgUrl: '' },
    { name: 'Quick Silver Scientific', icon: 'fa-solid fa-atom', imgUrl: '' },
    { name: 'Seeking Health', icon: 'fa-solid fa-prescription-bottle-medical', imgUrl: '' }
  ]);

  // 4 "Shop by Style" Cards
  readonly styleCategories = signal<StyleCategory[]>([
    { title: 'Tech Lover', subtitle: 'Smart & connected', imgUrl: 'assets/images/style-tech.jpg' },
    { title: 'Modern Fashion', subtitle: 'Trendy & versatile', imgUrl: 'assets/images/style-fashion.jpg' },
    { title: 'Home Vibes', subtitle: 'Cozy & stylish', imgUrl: 'assets/images/style-home.jpg' },
    { title: 'Active Life', subtitle: 'Fit, strong & healthy', imgUrl: 'assets/images/style-active.jpg' }
  ]);

  // Trusted by Leading Brands (Clean, Compact, Original)
  readonly trustedBrands = signal<{ name: string; logoUrl?: string | null }[]>([
    { name: 'Puma', logoUrl: null },
    { name: 'Nordic Naturals', logoUrl: null },
    { name: 'NovaTech', logoUrl: null },
    { name: 'UrbanFit', logoUrl: null },
    { name: 'Bioray', logoUrl: null },
    { name: 'Nova', logoUrl: null }
  ]);

  // Testimonials Auto-Slider (Every 3 seconds)
  readonly testimonialsList = signal<any[]>([
    {
      customerName: 'Emily R.',
      customerRole: 'Verified Customer',
      comment: 'The quality of products exceeded my expectations! Fast delivery and great customer support.',
      avatarUrl: 'assets/images/avatar-emily.jpg'
    },
    {
      customerName: 'Marcus K.',
      customerRole: 'Verified Buyer',
      comment: 'Exceptional service and authentic supplements. Happy Steppy is my go-to store!',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      customerName: 'Sarah T.',
      customerRole: 'Health Enthusiast',
      comment: 'Noticeable results with Belly Mend within days. Highly recommended!',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  ]);
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
    comment: 'The quality of products exceeded my expectations! Fast delivery and great customer support.',
    avatarUrl: 'assets/images/avatar-emily.jpg'
  });

  // Trending Products (Pure store products requested by owner)
  readonly trendingProducts = signal<TrendingProduct[]>([
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
      imageUrl: 'assets/images/bioray-belly-mend.webp',
      isWishlisted: false
    }
  ]);

  getLinksForColumn(col: string) {
    const list = this.footerLinks().filter(l => l.columnName?.toLowerCase() === col.toLowerCase());
    return list.length > 0 ? list : null;
  }

  ngOnInit() {
    this.startCountdown();
    this.startTestimonialRotation();
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
        avatarUrl: t.avatarUrl || 'assets/images/avatar-emily.jpg'
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
        avatarUrl: t.avatarUrl || 'assets/images/avatar-emily.jpg'
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
        avatarUrl: t.avatarUrl || 'assets/images/avatar-emily.jpg'
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

  // Countdown Timer
  private startCountdown() {
    this.calculateFlashRemaining();
    this.timerInterval = setInterval(() => {
      let s = this.flashSeconds() - 1;
      let m = this.flashMinutes();
      let h = this.flashHours();

      if (s < 0) {
        s = 59;
        m--;
        if (m < 0) {
          m = 59;
          h--;
          if (h < 0) {
            h = 10;
            m = 39;
            s = 30;
          }
        }
      }

      this.flashSeconds.set(s);
      this.flashMinutes.set(m);
      this.flashHours.set(h);
    }, 1000);
  }

  private calculateFlashRemaining() {
    const ends = this.flashSale().endsAtUtc;
    if (!ends) return;
    const diff = Math.max(0, new Date(ends).getTime() - Date.now());
    const totalSecs = Math.floor(diff / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    this.flashHours.set(h);
    this.flashMinutes.set(m);
    this.flashSeconds.set(s);
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleWishlist(product: TrendingProduct, event?: Event) {
    if (event) event.stopPropagation();
    product.isWishlisted = !product.isWishlisted;
    const count = this.trendingProducts().filter(p => p.isWishlisted).length;
    this.wishlistCount.set(count);
    if (product.isWishlisted) {
      this.showStoreToast(`${product.name} saved to wishlist!`, 'Saved', product.imageUrl);
    }
  }

  addToCart(product: TrendingProduct, event?: Event) {
    if (event) event.stopPropagation();
    this.cartCount.update(c => c + 1);
    this.showStoreToast(`${product.name} added to cart!`, 'Added to Cart', product.imageUrl);
  }

  subscribeNewsletter() {
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    this.isSubscribed.set(true);
    this.showStoreToast(`Thanks for subscribing with ${email}!`, 'Newsletter Subscribed');
    this.newsletterEmail.set('');
  }

  scrollToSection(sectionId: string) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
