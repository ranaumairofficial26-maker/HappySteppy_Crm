import { Component, OnInit, OnDestroy, AfterViewInit, signal, computed, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryItem, TrendingProduct } from '../../core/models/shopora.model';
import { BrandStoreService } from '../../core/services/brand-store.service';
import { HomepageContentService, normalizeImageUrl } from '../../core/services/homepage-content.service';

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

  // Flash Sale Dynamic Countdown Timers
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
      return this.resolveHeroImage(fs.secondaryImageUrl);
    }
    if (this.activeFlashImgIndex() === 1 && fs.secondaryImageUrl) {
      return this.resolveHeroImage(fs.secondaryImageUrl);
    }
    return this.resolveHeroImage(fs.imageUrl) || 'assets/images/bioray-belly-mend.webp';
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

  // Homepage Content (Hero Banner, 4 Feature Badges, Promo Banner, Footer, Styles, Flash Sale, Reviews, Social Proof synced with Database)
  readonly homepageContent = inject(HomepageContentService);
  readonly heroSlide = this.homepageContent.hero;
  readonly featureCards = this.homepageContent.featureCards;
  readonly promoBanner = this.homepageContent.promoBanner;
  readonly footerConfig = this.homepageContent.footer;
  readonly styleCategories = this.homepageContent.styles;
  readonly flashSale = this.homepageContent.flashSale;
  readonly testimonialsList = this.homepageContent.testimonials;
  readonly socialProof = this.homepageContent.socialProof;

  resolveHeroImage(url?: string): string {
    return normalizeImageUrl(url);
  }

  onHeroImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('hero-upgrade-lifestyle.jpg')) {
      img.src = 'assets/images/hero-upgrade-lifestyle.jpg?v=2';
    }
  }

  // Sidebar Categories (Top Brands synced with BrandStoreService)
  private readonly brandStore = inject(BrandStoreService);
  readonly categories = this.brandStore.brands;

  readonly currentTestimonialIndex = signal<number>(0);
  readonly isTestimonialSliding = signal<boolean>(false);
  private testimonialInterval: any;
  private isTestimonialsPaused = false;

  readonly testimonial = computed(() => {
    const list = this.testimonialsList();
    if (!list || list.length === 0) {
      return {
        name: 'Emily R.',
        role: 'Verified Customer',
        comment: 'The quality of products exceeded my expectations! Fast delivery and great customer support.',
        avatarUrl: 'assets/images/avatar-emily.jpg'
      };
    }
    const idx = Math.min(this.currentTestimonialIndex(), list.length - 1);
    const item = list[idx >= 0 ? idx : 0];
    return {
      name: item.name || (item as any).customerName || 'Customer',
      role: item.role || (item as any).customerRole || 'Verified Buyer',
      comment: item.comment,
      avatarUrl: normalizeImageUrl(item.avatarUrl) || 'assets/images/avatar-emily.jpg'
    };
  });

  // Trending Products (synced with PostgreSQL Database)
  readonly trendingProducts = this.homepageContent.trendingProducts;

  getLinksForColumn(col: string) {
    const list = this.footerLinks().filter(l => l.columnName?.toLowerCase() === col.toLowerCase());
    return list.length > 0 ? list : null;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
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
    const fs = this.flashSale();
    if (fs) {
      this.flashHours.set(fs.endsInHours ?? 11);
      this.flashMinutes.set(fs.endsInMinutes ?? 59);
      this.flashSeconds.set(fs.endsInSeconds ?? 55);
    }
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
    if (!email || !email.includes('@') || !email.includes('.')) {
      this.showStoreToast('Please enter a valid email address (e.g. name@domain.com).', 'Invalid Email');
      return;
    }
    this.isSubscribed.set(true);
    this.showStoreToast(`Thanks for subscribing! Exclusive deals will be sent to ${email}`, 'Subscribed Successfully 🎉');
    this.newsletterEmail.set('');
  }

  scrollToSection(sectionId: string) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openAdmin(): void {
    try {
      localStorage.removeItem('hs_admin_auth');
      sessionStorage.removeItem('hs_admin_auth');
    } catch { }
  }
}
