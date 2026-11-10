import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BrandStoreService } from '../../core/services/brand-store.service';
import { HomepageContentService, HeroBannerConfig, FeatureCardItem, StyleCategoryItem, FlashSaleConfig, TestimonialItem, SocialProofConfig, normalizeImageUrl } from '../../core/services/homepage-content.service';
import { CategoryItem, TrendingProduct, PromoBannerConfig, FooterConfig } from '../../core/models/shopora.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  // Brand Store Service (synced with Storefront sidebar & Database)
  readonly brandStore = inject(BrandStoreService);
  readonly brands = this.brandStore.brands;

  // Homepage Content Service (synced with Database)
  readonly homepageContent = inject(HomepageContentService);

  // Authentication state
  isAuthenticated = signal<boolean>(false);
  email = signal<string>('admin@happysteppy.com');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Active navigation tab (persists across page refreshes)
  activeTab = signal<string>(this.getInitialTab());

  // Sub-tabs under "Home Page" tab
  homeSubTab = signal<'banner' | 'cards' | 'products' | 'promo' | 'brands' | 'styles' | 'flashSale' | 'socialProof'>('banner');

  private getInitialTab(): string {
    if (typeof window === 'undefined') return 'overview';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qTab = urlParams.get('tab');
      if (qTab === 'overview' || qTab === 'homepage' || qTab === 'footer') {
        return qTab;
      }
      const savedTab = localStorage.getItem('hs_admin_tab');
      if (savedTab === 'overview' || savedTab === 'homepage' || savedTab === 'footer') {
        return savedTab;
      }
    } catch {}
    return 'overview';
  }

  // --- Hero Banner Form State ---
  heroImageUrl = signal<string>('assets/uploads/hero-1794205517574-health_wellness_text_free_1200x420.png');
  resolvedHeroImageUrl = computed(() => normalizeImageUrl(this.heroImageUrl()));
  heroBadgeText = signal<string>('HEALTH & WELLNESS ESSENTIALS');
  heroTitle = signal<string>('Trusted Care for a Healthier You');
  heroDescription = signal<string>('Premium supplements and natural medicines for your everyday wellness.');
  heroPrimaryBtnText = signal<string>('Shop Now');
  heroPrimaryBtnUrl = signal<string>('#trending-products');
  heroSecondaryBtnText = signal<string>('Explore Products');
  heroSecondaryBtnUrl = signal<string>('#trending-products');
  heroRecWidth = signal<number>(1200);
  heroRecHeight = signal<number>(420);
  isHeroSaving = signal<boolean>(false);
  isImageUploading = signal<boolean>(false);
  uploadedFileName = signal<string | null>(null);

  // --- 4 Trust & Feature Badges Form State ---
  cardsForm = signal<FeatureCardItem[]>([
    { cardIndex: 1, icon: 'fa-solid fa-truck-fast', title: 'Shipping All Pakistan', subtitle: 'Fast doorstep delivery', displayOrder: 1 },
    { cardIndex: 2, icon: 'fa-solid fa-rotate-left', title: '7-Day Money Back', subtitle: '100% refund guarantee', displayOrder: 2 },
    { cardIndex: 3, icon: 'fa-solid fa-shield-halved', title: 'Our Guarantee', subtitle: 'Satisfaction guaranteed', displayOrder: 3 },
    { cardIndex: 4, icon: 'fa-solid fa-headset', title: '24/7 Customer Service', subtitle: 'Always here to help you', displayOrder: 4 }
  ]);
  isCardsSaving = signal<boolean>(false);

  // Icon presets for 4 feature cards
  readonly featureCardIcons = [
    { label: 'Truck Delivery', icon: 'fa-solid fa-truck-fast' },
    { label: 'Return / Refund', icon: 'fa-solid fa-rotate-left' },
    { label: 'Shield Guarantee', icon: 'fa-solid fa-shield-halved' },
    { label: 'Headset Support', icon: 'fa-solid fa-headset' },
    { label: 'Fast Clock', icon: 'fa-solid fa-clock' },
    { label: 'Quality Star', icon: 'fa-solid fa-star' },
    { label: 'Certificate', icon: 'fa-solid fa-certificate' },
    { label: 'Secure Lock', icon: 'fa-solid fa-lock' },
    { label: 'Credit Card', icon: 'fa-solid fa-credit-card' },
    { label: 'Gift Box', icon: 'fa-solid fa-gift' },
    { label: 'Check Circle', icon: 'fa-solid fa-circle-check' },
    { label: 'Heart Care', icon: 'fa-solid fa-heart' }
  ];

  // Brand Add / Edit Modal state
  isBrandModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingIndex = signal<number>(-1);
  editingBrand = signal<CategoryItem | null>(null);
  brandNameInput = signal<string>('');
  brandIconInput = signal<string>('fa-solid fa-leaf');
  brandOrderInput = signal<number>(1);
  brandFormError = signal<string>('');

  // Delete Confirmation Modal state
  isDeleteModalOpen = signal<boolean>(false);
  brandToDelete = signal<CategoryItem | null>(null);
  brandToDeleteIndex = signal<number>(-1);

  // Save Success Popup Modal state
  isSaveSuccessModalOpen = signal<boolean>(false);
  saveSuccessType = signal<'hero' | 'cards' | 'product' | 'promo' | 'footer' | 'styles' | 'flashSale' | 'socialProof'>('hero');

  closeSaveSuccessModal(): void {
    this.isSaveSuccessModalOpen.set(false);
  }

  // --- Promo Banner Form State (Home Refresh Event Synced with PostgreSQL) ---
  readonly promoBanner = this.homepageContent.promoBanner;
  promoEventTag = signal<string>('HOME REFRESH EVENT');
  promoTitle = signal<string>('Refresh Your Space');
  promoSubtitle = signal<string>('Discover modern essentials for every corner of your home.');
  promoDiscountText = signal<string>('40% OFF');
  promoButtonText = signal<string>('Discover Now');
  promoButtonUrl = signal<string>('#trending-products');
  promoImageUrl = signal<string>('assets/uploads/promo-1794222998271-FINAL.png');
  resolvedPromoImageUrl = computed(() => normalizeImageUrl(this.promoImageUrl()));
  promoRecWidth = signal<number>(1200);
  promoRecHeight = signal<number>(200);
  isPromoSaving = signal<boolean>(false);
  isPromoUploading = signal<boolean>(false);
  uploadedPromoFileName = signal<string | null>(null);

  // --- Footer Management State (PostgreSQL Synced) ---
  readonly footerConfig = this.homepageContent.footer;
  footerLogoUrl = signal<string>('assets/images/logo.png');
  resolvedFooterLogoUrl = computed(() => normalizeImageUrl(this.footerLogoUrl()));
  footerAboutText = signal<string>('Happy Steppy is your trusted destination for premium quality health supplements, natural wellness products, and everyday essentials delivered nationwide across Pakistan.');
  footerTrustBadgeText = signal<string>('100% Authentic & Halal Certified');
  footerPhone = signal<string>('+92 300 1234567');
  footerEmail = signal<string>('support@happysteppy.com');
  footerNewsletterTitle = signal<string>('Stay in the Loop');
  footerNewsletterSubtitle = signal<string>('Get the latest deals, new arrivals and wellness tips directly to your inbox.');
  footerInstagram = signal<string>('https://instagram.com');
  footerFacebook = signal<string>('https://facebook.com');
  footerWhatsapp = signal<string>('https://wa.me/923001234567');
  footerTiktok = signal<string>('https://tiktok.com');
  footerYoutube = signal<string>('https://youtube.com');
  footerX = signal<string>('https://x.com');
  footerCopyrightText = signal<string>('© 2026 Happy Steppy. All rights reserved.');
  footerPrivacyPolicyUrl = signal<string>('/privacy-policy');
  footerTermsUrl = signal<string>('/terms');
  footerShowInstagram = signal<boolean>(true);
  footerShowFacebook = signal<boolean>(true);
  footerShowWhatsapp = signal<boolean>(true);
  footerShowTiktok = signal<boolean>(true);
  footerShowYoutube = signal<boolean>(true);
  footerShowX = signal<boolean>(true);
  isFooterSaving = signal<boolean>(false);
  isFooterLogoUploading = signal<boolean>(false);
  uploadedFooterLogoFileName = signal<string | null>(null);

  // --- Trending Products Management State (PostgreSQL Synced) ---
  readonly trendingProducts = this.homepageContent.trendingProducts;
  isProductModalOpen = signal<boolean>(false);
  isEditingProduct = signal<boolean>(false);
  isProductSaving = signal<boolean>(false);
  editingProductId = signal<number | null>(null);
  prodNameInput = signal<string>('');
  prodCategoryInput = signal<string>('Supplements');
  prodPriceInput = signal<number>(9800);
  prodOriginalPriceInput = signal<number>(11500);
  prodDiscountInput = signal<number>(15);
  prodRatingInput = signal<number>(5.0);
  prodReviewCountInput = signal<string>('2.4k');
  prodImageUrlInput = signal<string>('assets/images/nordic-naturals-omega-3.jpg');
  prodImageUploading = signal<boolean>(false);
  prodFormError = signal<string>('');

  // Delete product confirmation modal
  isDeleteProductModalOpen = signal<boolean>(false);
  productToDelete = signal<TrendingProduct | null>(null);

  // --- Shop by Style State ---
  readonly styles = this.homepageContent.styles;
  stylesForm = signal<StyleCategoryItem[]>([]);
  isStylesSaving = signal<boolean>(false);
  uploadingStyleIndex = signal<number | null>(null);

  // --- Flash Sale Deal State ---
  readonly flashSale = this.homepageContent.flashSale;
  flashTitle = signal<string>('Sale');
  flashProductName = signal<string>('Bioray Belly Mend');
  flashRating = signal<number>(5.0);
  flashReviewCount = signal<string>('1.2k');
  flashSalePrice = signal<number>(8200);
  flashOriginalPrice = signal<number>(10250);
  flashDiscount = signal<number>(20);
  flashStockLeft = signal<string>('Only 15 left!');
  flashButtonText = signal<string>('Grab the Deal');
  flashButtonUrl = signal<string>('#trending-products');
  flashImageUrl = signal<string>('assets/images/bioray-belly-mend.webp');
  flashSecondaryImageUrl = signal<string>('assets/images/bioray-belly-mend-bottle.webp');
  flashEndsInHours = signal<number>(11);
  flashEndsInMinutes = signal<number>(59);
  flashEndsInSeconds = signal<number>(55);
  isFlashSaving = signal<boolean>(false);
  isFlashImgUploading = signal<boolean>(false);
  isFlashSecImgUploading = signal<boolean>(false);
  flashPreviewThumbIndex = signal<number>(0);
  currentFlashPreviewImg = computed(() => this.flashPreviewThumbIndex() === 1 && this.flashSecondaryImageUrl() ? this.flashSecondaryImageUrl() : this.flashImageUrl());

  // --- Reviews & Social Proof State ---
  readonly testimonials = this.homepageContent.testimonials;
  readonly socialProof = this.homepageContent.socialProof;
  shoppersCaption = signal<string>('Loved by');
  shoppersCount = signal<string>('500,000+');
  shoppersLabel = signal<string>('Happy Shoppers');
  trustedBrandsList = signal<string[]>(['Puma', 'Nordic Naturals', 'NovaTech', 'UrbanFit', 'Bioray', 'Nova']);
  newBrandName = signal<string>('');
  isSocialProofSaving = signal<boolean>(false);

  // Testimonial Modal State
  isTestimonialModalOpen = signal<boolean>(false);
  isEditingTestimonial = signal<boolean>(false);
  editingTestimonialId = signal<number | null>(null);
  testNameInput = signal<string>('');
  testRoleInput = signal<string>('Verified Buyer');
  testCommentInput = signal<string>('');
  testAvatarUrlInput = signal<string>('assets/images/avatar-emily.jpg');
  testAvatarUploading = signal<boolean>(false);

  // Delete Testimonial Modal
  isDeleteTestimonialModalOpen = signal<boolean>(false);
  testimonialToDelete = signal<TestimonialItem | null>(null);

  // Toast feedback
  toastMessage = signal<string | null>(null);
  private toastTimer: any = null;

  // Icon presets with clean, readable labels for Sidebar Brands
  readonly availableIcons = [
    { label: 'Flask', icon: 'fa-solid fa-flask' },
    { label: 'Leaf', icon: 'fa-solid fa-leaf' },
    { label: 'Capsules', icon: 'fa-solid fa-capsules' },
    { label: 'Heart Pulse', icon: 'fa-solid fa-heart-pulse' },
    { label: 'Shield Heart', icon: 'fa-solid fa-shield-heart' },
    { label: 'DNA Helix', icon: 'fa-solid fa-dna' },
    { label: 'Seedling', icon: 'fa-solid fa-seedling' },
    { label: 'Tree', icon: 'fa-solid fa-tree' },
    { label: 'Apple', icon: 'fa-solid fa-apple-whole' },
    { label: 'Bottle', icon: 'fa-solid fa-prescription-bottle-medical' },
    { label: 'Fish', icon: 'fa-solid fa-fish' },
    { label: 'Atom', icon: 'fa-solid fa-atom' },
    { label: 'Tag', icon: 'fa-solid fa-tag' }
  ];

  // Stats for the clean dashboard
  stats = signal({
    totalProducts: 4,
    storeStatus: 'Active & Live',
    lastSync: 'Just now'
  });

  private hasInitializedHero = false;
  private hasInitializedCards = false;
  private hasInitializedPromo = false;
  private hasInitializedFooter = false;
  private hasInitializedStyles = false;
  private hasInitializedFlash = false;
  private hasInitializedSocialProof = false;

  constructor() {
    effect(() => {
      const heroData = this.homepageContent.hero();
      if (heroData && heroData.title && !this.isImageUploading()) {
        if (!this.hasInitializedHero) {
          this.hasInitializedHero = true;
          this.heroImageUrl.set(normalizeImageUrl(heroData.imageUrl));
          this.heroBadgeText.set(heroData.badgeText);
          this.heroTitle.set(heroData.title);
          this.heroDescription.set(heroData.description);
          this.heroPrimaryBtnText.set(heroData.primaryButtonText);
          this.heroPrimaryBtnUrl.set(heroData.primaryButtonUrl);
          this.heroSecondaryBtnText.set(heroData.secondaryButtonText);
          this.heroSecondaryBtnUrl.set(heroData.secondaryButtonUrl);
          this.heroRecWidth.set(heroData.recommendedWidth || 1200);
          this.heroRecHeight.set(heroData.recommendedHeight || 420);
        }
      }
    });

    effect(() => {
      const cardsData = this.homepageContent.featureCards();
      if (cardsData && cardsData.length > 0 && !this.hasInitializedCards) {
        this.hasInitializedCards = true;
        this.cardsForm.set(JSON.parse(JSON.stringify(cardsData)));
      }
    });

    effect(() => {
      const promoData = this.homepageContent.promoBanner();
      if (promoData && promoData.title && !this.isPromoUploading()) {
        if (!this.hasInitializedPromo) {
          this.hasInitializedPromo = true;
          this.promoImageUrl.set(normalizeImageUrl(promoData.imageUrl));
          this.promoEventTag.set(promoData.eventTag || 'HOME REFRESH EVENT');
          this.promoTitle.set(promoData.title);
          this.promoSubtitle.set(promoData.subtitle);
          this.promoDiscountText.set(promoData.discountText);
          this.promoButtonText.set(promoData.buttonText);
          this.promoButtonUrl.set(promoData.buttonUrl);
          this.promoRecWidth.set(promoData.recommendedWidth || 1200);
          this.promoRecHeight.set(promoData.recommendedHeight || 200);
        }
      }
    });

    effect(() => {
      const footerData = this.homepageContent.footer();
      if (footerData && !this.isFooterLogoUploading()) {
        if (!this.hasInitializedFooter) {
          this.hasInitializedFooter = true;
          this.footerLogoUrl.set(normalizeImageUrl(footerData.logoUrl));
          this.footerAboutText.set(footerData.aboutText || '');
          this.footerTrustBadgeText.set(footerData.trustBadgeText || '');
          this.footerPhone.set(footerData.contactPhone || '');
          this.footerEmail.set(footerData.contactEmail || '');
          this.footerNewsletterTitle.set(footerData.newsletterTitle || '');
          this.footerNewsletterSubtitle.set(footerData.newsletterSubtitle || '');
          this.footerInstagram.set(footerData.socialInstagram || '');
          this.footerFacebook.set(footerData.socialFacebook || '');
          this.footerWhatsapp.set(footerData.socialWhatsapp || '');
          this.footerTiktok.set(footerData.socialTiktok || '');
          this.footerYoutube.set(footerData.socialYoutube || '');
          this.footerX.set(footerData.socialX || '');
          this.footerCopyrightText.set(footerData.copyrightText || '');
          this.footerPrivacyPolicyUrl.set(footerData.privacyPolicyUrl || '');
          this.footerTermsUrl.set(footerData.termsUrl || '');
          this.footerShowInstagram.set(footerData.showInstagram !== false);
          this.footerShowFacebook.set(footerData.showFacebook !== false);
          this.footerShowWhatsapp.set(footerData.showWhatsapp !== false);
          this.footerShowTiktok.set(footerData.showTiktok !== false);
          this.footerShowYoutube.set(footerData.showYoutube !== false);
          this.footerShowX.set(footerData.showX !== false);
        }
      }
    });

    effect(() => {
      const stylesData = this.homepageContent.styles();
      if (stylesData && stylesData.length > 0 && !this.hasInitializedStyles) {
        this.hasInitializedStyles = true;
        this.stylesForm.set(JSON.parse(JSON.stringify(stylesData)));
      }
    });

    effect(() => {
      const fs = this.homepageContent.flashSale();
      if (fs && fs.productName && !this.hasInitializedFlash && !this.isFlashImgUploading() && !this.isFlashSecImgUploading()) {
        this.hasInitializedFlash = true;
        this.flashTitle.set(fs.title || 'Sale');
        this.flashProductName.set(fs.productName);
        this.flashRating.set(fs.rating || 5.0);
        this.flashReviewCount.set(fs.reviewCount || '1.2k');
        this.flashSalePrice.set(fs.salePrice || 8200);
        this.flashOriginalPrice.set(fs.originalPrice || 10250);
        this.flashDiscount.set(fs.discountPercentage || 20);
        this.flashStockLeft.set(fs.stockLeftText || 'Only 15 left!');
        this.flashButtonText.set(fs.buttonText || 'Grab the Deal');
        this.flashButtonUrl.set(fs.buttonUrl || '#trending-products');
        this.flashImageUrl.set(normalizeImageUrl(fs.imageUrl));
        if (fs.secondaryImageUrl) {
          this.flashSecondaryImageUrl.set(normalizeImageUrl(fs.secondaryImageUrl));
        }
        this.flashEndsInHours.set(fs.endsInHours || 11);
        this.flashEndsInMinutes.set(fs.endsInMinutes || 59);
        this.flashEndsInSeconds.set(fs.endsInSeconds || 55);
      }
    });

    effect(() => {
      const sp = this.homepageContent.socialProof();
      if (sp && sp.shoppersCaption && !this.hasInitializedSocialProof) {
        this.hasInitializedSocialProof = true;
        this.shoppersCaption.set(sp.shoppersCaption);
        this.shoppersCount.set(sp.shoppersCount);
        this.shoppersLabel.set(sp.shoppersLabel);
        if (Array.isArray(sp.trustedBrands)) {
          this.trustedBrandsList.set([...sp.trustedBrands]);
        }
      }
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    // Always require fresh login when visiting the admin page from storefront or direct navigation
    this.isAuthenticated.set(false);
    this.password.set('');
    this.errorMessage.set('');
    this.activeTab.set('overview');
    try {
      localStorage.removeItem('hs_admin_auth');
      sessionStorage.removeItem('hs_admin_auth');
      localStorage.setItem('hs_admin_tab', 'overview');
    } catch {}

    // Sync tab from query param or localStorage
    const qTab = this.route.snapshot.queryParamMap.get('tab');
    if (qTab === 'overview' || qTab === 'homepage' || qTab === 'footer') {
      this.activeTab.set(qTab);
      try {
        localStorage.setItem('hs_admin_tab', qTab);
      } catch {}
    } else {
      const savedTab = localStorage.getItem('hs_admin_tab');
      if (savedTab === 'overview' || savedTab === 'homepage' || savedTab === 'footer') {
        this.activeTab.set(savedTab);
      }
    }

    // Sync Hero Banner Form with PostgreSQL data
    const heroData = this.homepageContent.hero();
    if (heroData) {
      this.heroImageUrl.set(heroData.imageUrl);
      this.heroBadgeText.set(heroData.badgeText);
      this.heroTitle.set(heroData.title);
      this.heroDescription.set(heroData.description);
      this.heroPrimaryBtnText.set(heroData.primaryButtonText);
      this.heroPrimaryBtnUrl.set(heroData.primaryButtonUrl);
      this.heroSecondaryBtnText.set(heroData.secondaryButtonText);
      this.heroSecondaryBtnUrl.set(heroData.secondaryButtonUrl);
      this.heroRecWidth.set(heroData.recommendedWidth || 1200);
      this.heroRecHeight.set(heroData.recommendedHeight || 420);
    }

    // Sync Feature Cards Form
    const cardsData = this.homepageContent.featureCards();
    if (cardsData && cardsData.length > 0) {
      this.cardsForm.set(JSON.parse(JSON.stringify(cardsData)));
    }
  }

  login(): void {
    this.errorMessage.set('');

    const emailVal = this.email().trim();
    const passVal = this.password().trim();

    if (!emailVal) {
      this.errorMessage.set('Please enter your admin email.');
      return;
    }

    if (!passVal) {
      this.errorMessage.set('Please enter your password.');
      return;
    }

    this.isLoading.set(true);

    // Smooth sign-in directly to Dashboard (Overview tab)
    setTimeout(() => {
      this.isLoading.set(false);
      this.isAuthenticated.set(true);
      this.activeTab.set('overview');
      try {
        localStorage.removeItem('hs_admin_auth');
        sessionStorage.removeItem('hs_admin_auth');
        localStorage.setItem('hs_admin_tab', 'overview');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: 'overview' },
          queryParamsHandling: 'merge'
        });
      } catch {}
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.password.set('');
    this.errorMessage.set('');
    try {
      localStorage.removeItem('hs_admin_auth');
      localStorage.removeItem('hs_admin_tab');
      sessionStorage.removeItem('hs_admin_auth');
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: null },
        queryParamsHandling: 'merge'
      });
    } catch {}
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    try {
      localStorage.setItem('hs_admin_tab', tab);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
    } catch {}
  }

  setHomeSubTab(subTab: 'banner' | 'cards' | 'products' | 'promo' | 'brands' | 'styles' | 'flashSale' | 'socialProof'): void {
    this.homeSubTab.set(subTab);
  }

  // --- Promo Banner (Home Refresh Event) Actions ---
  onPromoImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Please select an image smaller than 5MB.');
      return;
    }

    this.isPromoUploading.set(true);
    this.uploadedPromoFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      this.promoImageUrl.set(base64Data);

      const cleanName = `promo-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string; relativeUrl: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.isPromoUploading.set(false);
          if (res && res.url) {
            this.promoImageUrl.set(normalizeImageUrl(res.url));
          }
          this.showToast(`"${file.name}" uploaded successfully!`);
        },
        error: () => {
          this.isPromoUploading.set(false);
          this.showToast(`"${file.name}" loaded for preview! Click "Save Promo Banner" to publish.`);
        }
      });
    };

    reader.onerror = () => {
      this.isPromoUploading.set(false);
      this.showToast('Failed to read image file from your PC.');
    };

    reader.readAsDataURL(file);
  }

  resetPromoImage(): void {
    this.promoImageUrl.set('assets/images/home-refresh-banner.jpg');
    this.uploadedPromoFileName.set(null);
    this.showToast('Reset to original default promo banner image.');
  }

  savePromoBanner(): void {
    this.isPromoSaving.set(true);
    const updatedPromo: PromoBannerConfig = {
      eventTag: this.promoEventTag().trim() || 'HOME REFRESH EVENT',
      title: this.promoTitle().trim() || 'Refresh Your Space',
      subtitle: this.promoSubtitle().trim(),
      discountText: this.promoDiscountText().trim() || '40% OFF',
      buttonText: this.promoButtonText().trim() || 'Discover Now',
      buttonUrl: this.promoButtonUrl().trim() || '#trending-products',
      imageUrl: this.promoImageUrl().trim(),
      recommendedWidth: Number(this.promoRecWidth()) || 1200,
      recommendedHeight: Number(this.promoRecHeight()) || 200
    };

    this.homepageContent.updatePromoBanner(
      updatedPromo,
      () => {
        this.isPromoSaving.set(false);
        this.saveSuccessType.set('promo');
        this.isSaveSuccessModalOpen.set(true);
        this.showToast('Promo Banner changes saved successfully!');
      },
      () => {
        this.isPromoSaving.set(false);
        this.showToast('Error saving Promo Banner to database.');
      }
    );
  }

  // --- Footer Management Actions ---
  onFooterLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Please select a logo smaller than 5MB.');
      return;
    }

    this.isFooterLogoUploading.set(true);
    this.uploadedFooterLogoFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      this.footerLogoUrl.set(base64Data);

      const cleanName = `footer-logo-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.isFooterLogoUploading.set(false);
          if (res && res.url) {
            this.footerLogoUrl.set(normalizeImageUrl(res.url));
          }
          this.showToast(`Logo "${file.name}" uploaded successfully!`);
        },
        error: () => {
          this.isFooterLogoUploading.set(false);
          this.showToast(`Logo "${file.name}" loaded for preview! Click "Save Footer" to publish.`);
        }
      });
    };

    reader.onerror = () => {
      this.isFooterLogoUploading.set(false);
      this.showToast('Failed to read logo image file from your PC.');
    };

    reader.readAsDataURL(file);
  }

  resetFooterLogo(): void {
    this.footerLogoUrl.set('assets/images/logo.png');
    this.uploadedFooterLogoFileName.set(null);
    this.showToast('Reset to original default Happy Steppy navbar logo.');
  }

  toggleSocialVisibility(platform: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'youtube' | 'x'): void {
    switch (platform) {
      case 'instagram':
        this.footerShowInstagram.update(v => !v);
        break;
      case 'facebook':
        this.footerShowFacebook.update(v => !v);
        break;
      case 'whatsapp':
        this.footerShowWhatsapp.update(v => !v);
        break;
      case 'tiktok':
        this.footerShowTiktok.update(v => !v);
        break;
      case 'youtube':
        this.footerShowYoutube.update(v => !v);
        break;
      case 'x':
        this.footerShowX.update(v => !v);
        break;
    }
    const state = this.isSocialVisible(platform) ? 'SHOWN' : 'HIDDEN';
    this.showToast(`${platform.toUpperCase()} icon is now ${state} for Storefront footer.`);
  }

  isSocialVisible(platform: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'youtube' | 'x'): boolean {
    switch (platform) {
      case 'instagram': return this.footerShowInstagram();
      case 'facebook': return this.footerShowFacebook();
      case 'whatsapp': return this.footerShowWhatsapp();
      case 'tiktok': return this.footerShowTiktok();
      case 'youtube': return this.footerShowYoutube();
      case 'x': return this.footerShowX();
    }
  }

  saveFooterSettings(): void {
    this.isFooterSaving.set(true);
    const updatedFooter: FooterConfig = {
      logoUrl: this.footerLogoUrl().trim(),
      aboutText: this.footerAboutText().trim(),
      trustBadgeText: this.footerTrustBadgeText().trim(),
      contactPhone: this.footerPhone().trim(),
      contactEmail: this.footerEmail().trim(),
      newsletterTitle: this.footerNewsletterTitle().trim(),
      newsletterSubtitle: this.footerNewsletterSubtitle().trim(),
      socialInstagram: this.footerInstagram().trim(),
      socialFacebook: this.footerFacebook().trim(),
      socialWhatsapp: this.footerWhatsapp().trim(),
      socialTiktok: this.footerTiktok().trim(),
      socialYoutube: this.footerYoutube().trim(),
      socialX: this.footerX().trim(),
      copyrightText: this.footerCopyrightText().trim(),
      privacyPolicyUrl: this.footerPrivacyPolicyUrl().trim(),
      termsUrl: this.footerTermsUrl().trim(),
      showInstagram: this.footerShowInstagram(),
      showFacebook: this.footerShowFacebook(),
      showWhatsapp: this.footerShowWhatsapp(),
      showTiktok: this.footerShowTiktok(),
      showYoutube: this.footerShowYoutube(),
      showX: this.footerShowX()
    };

    this.homepageContent.updateFooter(
      updatedFooter,
      () => {
        this.isFooterSaving.set(false);
        this.saveSuccessType.set('footer');
        this.isSaveSuccessModalOpen.set(true);
        this.showToast('Footer settings saved successfully!');
      },
      () => {
        this.isFooterSaving.set(false);
        this.showToast('Error saving Footer settings to database.');
      }
    );
  }

  // --- Hero Banner Actions ---
  onHeroImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Max 5MB validation
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Please select an image smaller than 5MB.');
      return;
    }

    this.isImageUploading.set(true);
    this.uploadedFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      // Instant client-side preview with base64 so user immediately sees what they picked!
      this.heroImageUrl.set(base64Data);

      // Upload to backend to persist into assets/uploads/
      const cleanName = `hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.isImageUploading.set(false);
          if (res && res.url) {
            this.heroImageUrl.set(normalizeImageUrl(res.url));
          }
          this.showToast(`"${file.name}" picked from PC! Click "Save Hero Banner" to publish.`);
        },
        error: () => {
          this.isImageUploading.set(false);
          // Keep the base64 preview active so it never breaks!
          this.showToast(`"${file.name}" loaded from PC! Click "Save Hero Banner" to publish.`);
        }
      });
    };

    reader.onerror = () => {
      this.isImageUploading.set(false);
      this.showToast('Failed to read image file from your PC.');
    };

    reader.readAsDataURL(file);
  }

  onHeroImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('hero-upgrade-lifestyle.jpg')) {
      img.src = 'assets/images/hero-upgrade-lifestyle.jpg?v=2';
    }
  }

  resetHeroImage(): void {
    this.heroImageUrl.set('assets/images/hero-upgrade-lifestyle.jpg?v=2');
    this.uploadedFileName.set(null);
    this.showToast('Reset to original default hero image.');
  }

  saveHeroBanner(): void {
    this.isHeroSaving.set(true);
    const updatedHero: HeroBannerConfig = {
      badgeText: this.heroBadgeText().trim(),
      title: this.heroTitle().trim(),
      description: this.heroDescription().trim(),
      primaryButtonText: this.heroPrimaryBtnText().trim(),
      primaryButtonUrl: this.heroPrimaryBtnUrl().trim(),
      secondaryButtonText: this.heroSecondaryBtnText().trim(),
      secondaryButtonUrl: this.heroSecondaryBtnUrl().trim(),
      imageUrl: this.heroImageUrl().trim(),
      recommendedWidth: this.heroRecWidth(),
      recommendedHeight: this.heroRecHeight()
    };

    this.homepageContent.updateHero(updatedHero);
    setTimeout(() => {
      this.isHeroSaving.set(false);
      this.saveSuccessType.set('hero');
      this.isSaveSuccessModalOpen.set(true);
      this.showToast('Hero Banner changes saved successfully!');
    }, 400);
  }

  // --- Feature Cards Actions ---
  saveFeatureCards(): void {
    this.isCardsSaving.set(true);
    const cards = this.cardsForm();
    this.homepageContent.updateFeatureCards(cards);
    setTimeout(() => {
      this.isCardsSaving.set(false);
      this.saveSuccessType.set('cards');
      this.isSaveSuccessModalOpen.set(true);
      this.showToast('4 Feature Cards changes saved successfully!');
    }, 400);
  }

  updateCardIcon(index: number, icon: string): void {
    const list = [...this.cardsForm()];
    if (list[index]) {
      list[index].icon = icon;
      this.cardsForm.set(list);
    }
  }

  // --- Trending Products Actions ---
  openAddProductModal(): void {
    this.isEditingProduct.set(false);
    this.isProductSaving.set(false);
    this.editingProductId.set(null);
    this.prodNameInput.set('');
    this.prodCategoryInput.set('Supplements');
    this.prodPriceInput.set(5000);
    this.prodOriginalPriceInput.set(6000);
    this.prodDiscountInput.set(15);
    this.prodRatingInput.set(5.0);
    this.prodReviewCountInput.set('1.0k');
    this.prodImageUrlInput.set('assets/images/nordic-naturals-omega-3.jpg');
    this.prodFormError.set('');
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(prod: TrendingProduct): void {
    this.isEditingProduct.set(true);
    this.editingProductId.set(prod.id);
    this.prodNameInput.set(prod.name);
    this.prodCategoryInput.set(prod.category || 'Supplements');
    this.prodPriceInput.set(prod.price || 0);
    this.prodOriginalPriceInput.set(prod.originalPrice || prod.price || 0);
    this.prodDiscountInput.set(prod.discount || 0);
    this.prodRatingInput.set(prod.rating || 5.0);
    this.prodReviewCountInput.set(prod.reviewCount || '1.0k');
    this.prodImageUrlInput.set(prod.imageUrl || 'assets/images/nordic-naturals-omega-3.jpg');
    this.prodFormError.set('');
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
    this.isProductSaving.set(false);
    this.prodFormError.set('');
  }

  onProductImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Please select an image smaller than 5MB.');
      return;
    }

    this.prodImageUploading.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      this.prodImageUrlInput.set(base64Data);

      const cleanName = `prod-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.prodImageUploading.set(false);
          if (res && res.url) {
            this.prodImageUrlInput.set(normalizeImageUrl(res.url));
          }
          this.showToast(`"${file.name}" uploaded successfully!`);
        },
        error: () => {
          this.prodImageUploading.set(false);
          this.showToast(`"${file.name}" loaded for product!`);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  saveProductForm(): void {
    const name = this.prodNameInput().trim();
    if (!name) {
      this.prodFormError.set('Product name likhna zaroori hai.');
      return;
    }

    const price = Number(this.prodPriceInput());
    if (isNaN(price) || price <= 0) {
      this.prodFormError.set('Product ki sahi price (Rs) likhna zaroori hai.');
      return;
    }

    const origPrice = Number(this.prodOriginalPriceInput()) > 0 ? Number(this.prodOriginalPriceInput()) : price;
    const discount = Number(this.prodDiscountInput()) || 0;
    const rating = Number(this.prodRatingInput()) || 5.0;
    const reviewCount = this.prodReviewCountInput().trim() || '1.0k';
    const category = this.prodCategoryInput().trim() || 'Supplements';
    const imageUrl = this.prodImageUrlInput().trim() || 'assets/images/nordic-naturals-omega-3.jpg';

    const payload: Partial<TrendingProduct> = {
      name,
      category,
      price,
      originalPrice: origPrice,
      discount,
      rating,
      reviewCount,
      imageUrl
    };

    this.isProductSaving.set(true);
    this.prodFormError.set('');

    if (this.isEditingProduct() && this.editingProductId()) {
      this.homepageContent.updateProduct(
        this.editingProductId()!,
        payload,
        () => {
          this.isProductSaving.set(false);
          this.closeProductModal();
          this.saveSuccessType.set('product');
          this.isSaveSuccessModalOpen.set(true);
          this.showToast(`"${name}" updated successfully!`);
        },
        (err) => {
          this.isProductSaving.set(false);
          this.prodFormError.set(err?.error?.message || err?.message || 'Error updating product.');
        }
      );
    } else {
      this.homepageContent.addProduct(
        payload,
        () => {
          this.isProductSaving.set(false);
          this.closeProductModal();
          this.saveSuccessType.set('product');
          this.isSaveSuccessModalOpen.set(true);
          this.showToast(`"${name}" added successfully!`);
        },
        (err) => {
          this.isProductSaving.set(false);
          this.prodFormError.set(err?.error?.message || err?.message || 'Error adding product.');
        }
      );
    }
  }

  openDeleteProductModal(prod: TrendingProduct): void {
    this.productToDelete.set(prod);
    this.isDeleteProductModalOpen.set(true);
  }

  closeDeleteProductModal(): void {
    this.isDeleteProductModalOpen.set(false);
    this.productToDelete.set(null);
  }

  confirmDeleteProduct(): void {
    const prod = this.productToDelete();
    if (!prod) return;

    this.homepageContent.deleteProduct(prod.id, () => {
      this.closeDeleteProductModal();
      this.showToast(`"${prod.name}" deleted successfully.`);
    });
  }

  // --- Brand Add / Edit Modal Actions ---
  openAddBrandModal(): void {
    this.isEditing.set(false);
    this.editingIndex.set(-1);
    this.editingBrand.set(null);
    this.brandNameInput.set('');
    this.brandIconInput.set('fa-solid fa-leaf');
    this.brandOrderInput.set(this.brands().length + 1);
    this.brandFormError.set('');
    this.isBrandModalOpen.set(true);
  }

  openEditBrandModal(index: number, brand: CategoryItem): void {
    this.isEditing.set(true);
    this.editingIndex.set(index);
    this.editingBrand.set(brand);
    this.brandNameInput.set(brand.name);
    this.brandIconInput.set(brand.icon || 'fa-solid fa-tag');
    this.brandOrderInput.set(index + 1);
    this.brandFormError.set('');
    this.isBrandModalOpen.set(true);
  }

  closeBrandModal(): void {
    this.isBrandModalOpen.set(false);
    this.brandFormError.set('');
  }

  selectIcon(icon: string): void {
    this.brandIconInput.set(icon);
  }

  saveBrand(): void {
    const name = this.brandNameInput().trim();
    if (!name) {
      this.brandFormError.set('Brand name is required.');
      return;
    }

    if (this.isEditing()) {
      const brand = this.editingBrand() || this.editingIndex();
      const currentIdx = this.editingIndex();
      const ok = this.brandStore.updateBrand(brand, name, this.brandIconInput());
      if (ok) {
        const targetPos = this.brandOrderInput();
        if (targetPos && targetPos !== (currentIdx + 1)) {
          this.brandStore.setBrandPosition(currentIdx, targetPos);
        }
        this.showToast(`Brand "${name}" updated in database successfully!`);
        this.closeBrandModal();
      } else {
        this.brandFormError.set('Could not update brand. Please try again.');
      }
    } else {
      const ok = this.brandStore.addBrand(name, this.brandIconInput());
      if (ok) {
        this.showToast(`Brand "${name}" saved to database and added to sidebar!`);
        this.closeBrandModal();
      } else {
        this.brandFormError.set('A brand with this name already exists.');
      }
    }
  }

  // --- Sidebar Brand Reordering (Move Up / Down) ---
  moveBrandUp(index: number, brand: CategoryItem): void {
    if (index <= 0) return;
    const ok = this.brandStore.moveBrandUp(index);
    if (ok) {
      this.showToast(`"${brand.name}" moved up to position #${index} on sidebar.`);
    }
  }

  moveBrandDown(index: number, brand: CategoryItem): void {
    if (index >= this.brands().length - 1) return;
    const ok = this.brandStore.moveBrandDown(index);
    if (ok) {
      this.showToast(`"${brand.name}" moved down to position #${index + 2} on sidebar.`);
    }
  }

  // --- Custom CSS Delete Confirmation Modal ---
  openDeleteModal(index: number, brand: CategoryItem): void {
    this.brandToDelete.set(brand);
    this.brandToDeleteIndex.set(index);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.brandToDelete.set(null);
    this.brandToDeleteIndex.set(-1);
  }

  confirmDelete(): void {
    const brand = this.brandToDelete();
    if (!brand) return;
    const name = brand.name;
    this.brandStore.deleteBrand(brand);
    this.closeDeleteModal();
    this.showToast(`Brand "${name}" deleted from database and sidebar.`);
  }

  // --- Shop by Style Actions ---
  onStyleImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const list = [...this.stylesForm()];
      if (list[index]) {
        list[index].imageUrl = base64Data;
        this.stylesForm.set(list);
      }
      this.uploadingStyleIndex.set(index);
      const cleanName = `style-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.uploadingStyleIndex.set(null);
          const currentList = [...this.stylesForm()];
          if (currentList[index]) {
            currentList[index].imageUrl = res.url;
            this.stylesForm.set(currentList);
          }
          this.showToast(`Card #${index + 1} image uploaded successfully!`);
        },
        error: () => {
          this.uploadingStyleIndex.set(null);
          this.showToast('Failed to upload style image.');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  saveStyles(): void {
    this.isStylesSaving.set(true);
    this.homepageContent.updateStyles(
      this.stylesForm(),
      () => {
        this.isStylesSaving.set(false);
        this.saveSuccessType.set('styles');
        this.isSaveSuccessModalOpen.set(true);
        this.showToast('Shop by Style changes saved successfully!');
      },
      () => {
        this.isStylesSaving.set(false);
        this.showToast('Error saving Shop by Style changes.');
      }
    );
  }

  // --- Flash Sale Deal Actions ---
  onFlashImageSelected(event: Event, isSecondary: boolean): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      if (isSecondary) {
        this.flashSecondaryImageUrl.set(base64Data);
        this.isFlashSecImgUploading.set(true);
      } else {
        this.flashImageUrl.set(base64Data);
        this.isFlashImgUploading.set(true);
      }

      const cleanName = `flash-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          if (isSecondary) {
            this.isFlashSecImgUploading.set(false);
            this.flashSecondaryImageUrl.set(res.url);
          } else {
            this.isFlashImgUploading.set(false);
            this.flashImageUrl.set(res.url);
          }
          this.showToast('Product image uploaded successfully!');
        },
        error: () => {
          if (isSecondary) this.isFlashSecImgUploading.set(false);
          else this.isFlashImgUploading.set(false);
          this.showToast('Failed to upload product image.');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  saveFlashSale(): void {
    this.isFlashSaving.set(true);
    const payload: Partial<FlashSaleConfig> = {
      title: this.flashTitle(),
      productName: this.flashProductName(),
      rating: Number(this.flashRating()) || 5.0,
      reviewCount: this.flashReviewCount(),
      salePrice: Number(this.flashSalePrice()) || 8200,
      originalPrice: Number(this.flashOriginalPrice()) || 10250,
      discountPercentage: Number(this.flashDiscount()) || 20,
      stockLeftText: this.flashStockLeft(),
      buttonText: this.flashButtonText(),
      buttonUrl: this.flashButtonUrl(),
      imageUrl: this.flashImageUrl(),
      secondaryImageUrl: this.flashSecondaryImageUrl(),
      endsInHours: Number(this.flashEndsInHours()) || 11,
      endsInMinutes: Number(this.flashEndsInMinutes()) || 59,
      endsInSeconds: Number(this.flashEndsInSeconds()) || 55
    };

    this.homepageContent.updateFlashSale(
      payload,
      () => {
        this.isFlashSaving.set(false);
        this.saveSuccessType.set('flashSale');
        this.isSaveSuccessModalOpen.set(true);
        this.showToast('Flash Sale changes saved successfully!');
      },
      () => {
        this.isFlashSaving.set(false);
        this.showToast('Error saving Flash Sale changes.');
      }
    );
  }

  // --- Reviews & Social Proof Actions ---
  addBrandTag(): void {
    const val = this.newBrandName().trim();
    if (!val) return;
    if (!this.trustedBrandsList().includes(val)) {
      this.trustedBrandsList.update(list => [...list, val]);
      this.newBrandName.set('');
    }
  }

  removeBrandTag(index: number): void {
    this.trustedBrandsList.update(list => list.filter((_, i) => i !== index));
  }

  saveSocialProof(): void {
    this.isSocialProofSaving.set(true);
    const payload: Partial<SocialProofConfig> = {
      shoppersCaption: this.shoppersCaption(),
      shoppersCount: this.shoppersCount(),
      shoppersLabel: this.shoppersLabel(),
      trustedBrands: this.trustedBrandsList()
    };

    this.homepageContent.updateSocialProof(
      payload,
      () => {
        this.isSocialProofSaving.set(false);
        this.saveSuccessType.set('socialProof');
        this.isSaveSuccessModalOpen.set(true);
        this.showToast('Reviews & Social Proof saved successfully!');
      },
      () => {
        this.isSocialProofSaving.set(false);
        this.showToast('Error saving social proof.');
      }
    );
  }

  // Testimonial Modal Handlers
  openAddTestimonialModal(): void {
    this.isEditingTestimonial.set(false);
    this.editingTestimonialId.set(null);
    this.testNameInput.set('');
    this.testRoleInput.set('Verified Buyer');
    this.testCommentInput.set('');
    this.testAvatarUrlInput.set('assets/images/avatar-emily.jpg');
    this.isTestimonialModalOpen.set(true);
  }

  openEditTestimonialModal(t: TestimonialItem): void {
    this.isEditingTestimonial.set(true);
    this.editingTestimonialId.set(t.id);
    this.testNameInput.set(t.name);
    this.testRoleInput.set(t.role);
    this.testCommentInput.set(t.comment);
    this.testAvatarUrlInput.set(t.avatarUrl);
    this.isTestimonialModalOpen.set(true);
  }

  closeTestimonialModal(): void {
    this.isTestimonialModalOpen.set(false);
  }

  onTestAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      this.testAvatarUrlInput.set(base64Data);
      this.testAvatarUploading.set(true);

      const cleanName = `avatar-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      this.http.post<{ url: string }>('http://localhost:5000/api/upload', {
        filename: cleanName,
        base64: base64Data
      }).subscribe({
        next: (res) => {
          this.testAvatarUploading.set(false);
          this.testAvatarUrlInput.set(res.url);
          this.showToast('Avatar image uploaded successfully!');
        },
        error: () => {
          this.testAvatarUploading.set(false);
          this.showToast('Failed to upload avatar.');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  saveTestimonialForm(): void {
    const name = this.testNameInput().trim();
    const comment = this.testCommentInput().trim();
    if (!name || !comment) {
      this.showToast('Please enter both name and review comment.');
      return;
    }

    const payload: Partial<TestimonialItem> = {
      name,
      role: this.testRoleInput().trim() || 'Verified Buyer',
      comment,
      avatarUrl: this.testAvatarUrlInput() || 'assets/images/avatar-emily.jpg'
    };

    if (this.isEditingTestimonial() && this.editingTestimonialId()) {
      this.homepageContent.updateSingleTestimonial(
        this.editingTestimonialId()!,
        payload,
        () => {
          this.closeTestimonialModal();
          this.showToast(`Review by "${name}" updated successfully!`);
        },
        () => {
          this.closeTestimonialModal();
          this.showToast(`Review by "${name}" updated!`);
        }
      );
    } else {
      this.homepageContent.addTestimonial(
        payload,
        () => {
          this.closeTestimonialModal();
          this.showToast(`New review by "${name}" added successfully!`);
        },
        () => {
          this.closeTestimonialModal();
          this.showToast(`New review by "${name}" added!`);
        }
      );
    }
  }

  openDeleteTestimonialModal(t: TestimonialItem): void {
    this.testimonialToDelete.set(t);
    this.isDeleteTestimonialModalOpen.set(true);
  }

  closeDeleteTestimonialModal(): void {
    this.isDeleteTestimonialModalOpen.set(false);
    this.testimonialToDelete.set(null);
  }

  confirmDeleteTestimonial(): void {
    const t = this.testimonialToDelete();
    if (!t) return;
    this.homepageContent.deleteTestimonial(t.id, () => {
      this.closeDeleteTestimonialModal();
      this.showToast(`Review by "${t.name}" deleted.`);
    });
  }

  showToast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(msg);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
