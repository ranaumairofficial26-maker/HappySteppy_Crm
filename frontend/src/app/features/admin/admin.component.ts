import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'homepage' | 'hero' | 'banners' | 'styles' | 'flash' | 'testimonials' | 'brands' | 'footer';
export type HomepageSubTab = 'hero' | 'banners' | 'styles' | 'flash' | 'testimonials' | 'brands';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);

  private getSavedHomepageSubTab(): HomepageSubTab {
    try {
      const savedSub = localStorage.getItem('hs_admin_homepage_subtab');
      const validSubTabs: HomepageSubTab[] = ['hero', 'banners', 'styles', 'flash', 'testimonials', 'brands'];
      if (savedSub && validSubTabs.includes(savedSub as HomepageSubTab)) {
        return savedSub as HomepageSubTab;
      }
      const savedMain = localStorage.getItem('hs_admin_tab');
      if (savedMain && validSubTabs.includes(savedMain as HomepageSubTab)) {
        return savedMain as HomepageSubTab;
      }
    } catch {}
    return 'hero';
  }

  private getSavedTab(): AdminTab {
    try {
      const saved = localStorage.getItem('hs_admin_tab');
      const validTabs: AdminTab[] = [
        'dashboard', 'products', 'categories', 'homepage',
        'hero', 'banners', 'styles', 'flash', 'testimonials', 'brands', 'footer'
      ];
      if (saved && validTabs.includes(saved as AdminTab)) {
        if (saved === 'homepage') {
          return this.getSavedHomepageSubTab();
        }
        return saved as AdminTab;
      }
    } catch {}
    return 'dashboard';
  }

  // Active navigation tab & homepage subtab
  activeTab = signal<AdminTab>(this.getSavedTab());
  homepageSubTab = signal<HomepageSubTab>(this.getSavedHomepageSubTab());

  isHomepageTab(): boolean {
    const tab = this.activeTab();
    return tab === 'homepage' || ['hero', 'banners', 'styles', 'flash', 'testimonials', 'brands'].includes(tab);
  }

  selectHomepageTab(): void {
    const target = this.homepageSubTab() || 'hero';
    this.setTab(target);
  }

  selectHomepageSubTab(tab: HomepageSubTab): void {
    this.homepageSubTab.set(tab);
    try {
      localStorage.setItem('hs_admin_homepage_subtab', tab);
    } catch {}
    this.setTab(tab);
  }

  setTab(tab: AdminTab): void {
    let resolved = tab;
    if (resolved === 'homepage') {
      resolved = this.homepageSubTab() || 'hero';
    }
    this.activeTab.set(resolved);
    if (['hero', 'banners', 'styles', 'flash', 'testimonials', 'brands'].includes(resolved)) {
      this.homepageSubTab.set(resolved as HomepageSubTab);
      try {
        localStorage.setItem('hs_admin_homepage_subtab', resolved);
      } catch {}
    }
    try {
      localStorage.setItem('hs_admin_tab', resolved);
    } catch {}
  }

  getHomepageTabName(): string {
    const tab = this.activeTab() === 'homepage' ? this.homepageSubTab() : this.activeTab();
    switch (tab) {
      case 'hero': return 'Hero Slider';
      case 'banners': return 'Promo Banner';
      case 'styles': return 'Style Cards';
      case 'flash': return 'Flash Sale';
      case 'testimonials': return 'Testimonials';
      case 'brands': return 'Trusted Brands';
      default: return 'Homepage';
    }
  }

  // Login form state
  loginEmail = signal<string>('admin@happysteppy.com');
  loginPassword = signal<string>('Admin@123456');
  loginError = signal<string | null>(null);
  isLoggingIn = signal<boolean>(false);

  // Dashboard Stats
  stats = signal<any>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalHeroSlides: 0,
    totalStyleCards: 0,
    totalTestimonials: 0,
    totalBrands: 0
  });

  // Products state
  products = signal<any[]>([]);
  productSearch = signal<string>('');
  trendingOnlyFilter = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);

  trendingCount = computed(() => this.products().filter(p => p.isTrending).length);

  filteredProducts = computed(() => {
    let list = this.products();
    if (this.trendingOnlyFilter()) {
      list = list.filter(p => p.isTrending);
    }
    const q = this.productSearch().toLowerCase().trim();
    if (!q) return list;
    return list.filter(p => p.name?.toLowerCase().includes(q));
  });

  isProductModalOpen = signal<boolean>(false);
  editingProduct = signal<any>({
    id: null,
    name: '',
    sku: '',
    price: 0,
    compareAtPrice: 0,
    stockQuantity: 50,
    primaryImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    shortDescription: '',
    badgeText: 'HOT',
    isTrending: true,
    isFeatured: false,
    isActive: true
  });

  // Categories state
  categories = signal<any[]>([]);
  isCategoryModalOpen = signal<boolean>(false);
  editingCategory = signal<any>({
    id: null,
    name: '',
    slug: '',
    description: '',
    showOnHomepage: true,
    showInSidebar: true
  });

  // Hero Slides state
  heroSlides = signal<any[]>([
    {
      id: 'default-hero-1',
      title: 'Upgrade Your Lifestyle',
      subtitle: 'Discover top picks for home, tech, fashion and more',
      description: 'Discover top picks for home, tech, fashion and more — all in one place.',
      desktopImageUrl: 'assets/images/hero-upgrade-lifestyle.jpg?v=2',
      primaryButtonText: 'Shop the Collection',
      primaryButtonUrl: '/products',
      secondaryButtonText: 'Explore Deals',
      secondaryButtonUrl: '/deals',
      badgeText: 'LIMITED TIME OFFER',
      isActive: true
    }
  ]);
  isSlideModalOpen = signal<boolean>(false);
  editingSlide = signal<any>({
    id: null,
    title: 'Upgrade Your Lifestyle',
    subtitle: 'Discover top picks for home, tech, fashion and more',
    description: 'Discover top picks for home, tech, fashion and more — all in one place.',
    desktopImageUrl: 'assets/images/hero-upgrade-lifestyle.jpg?v=2',
    primaryButtonText: 'Shop the Collection',
    primaryButtonUrl: '/products',
    secondaryButtonText: 'Explore Deals',
    secondaryButtonUrl: '/deals',
    badgeText: 'LIMITED TIME OFFER',
    isActive: true
  });

  // Promo Banner state
  promoBanner = signal<any>({
    id: null,
    title: 'Modern Living Essentials',
    subtitle: 'Stylish, functional and made for everyday comfort.',
    discountText: '50% OFF',
    buttonText: 'Shop Now',
    buttonUrl: '/products',
    imageUrl: 'assets/images/home-refresh-banner-clean.jpg?v=4'
  });

  // Style Cards state
  styleCards = signal<any[]>([
    { id: '1', title: 'Tech Lover', subtitle: 'Smart & connected', imageUrl: 'assets/images/style-tech.jpg' },
    { id: '2', title: 'Modern Fashion', subtitle: 'Trendy & versatile', imageUrl: 'assets/images/style-fashion.jpg' },
    { id: '3', title: 'Home Vibes', subtitle: 'Cozy & stylish', imageUrl: 'assets/images/style-home.jpg' },
    { id: '4', title: 'Active Life', subtitle: 'Fit, strong & healthy', imageUrl: 'assets/images/style-active.jpg' }
  ]);
  editingStyleCard = signal<any>(null);
  isStyleModalOpen = signal<boolean>(false);

  // Flash Sale state
  flashSale = signal<any>({
    title: 'Sale',
    subtitle: 'Gut Support & Immunity',
    discountPercentage: 20,
    endsAtUtc: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
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
  flashSaleEndDate: string = '';

  get flashSaleEndDateFormatted(): string {
    const ends = this.flashSale()?.endsAtUtc;
    if (!ends) return 'Not set';
    try {
      return new Date(ends).toLocaleString();
    } catch {
      return 'Not set';
    }
  }

  onFlashDateChange() {
    if (this.flashSaleEndDate) {
      const d = new Date(this.flashSaleEndDate);
      this.flashSale.update(f => ({ ...f, endsAtUtc: d.toISOString() }));
    }
  }

  setFlashPresetHours(hours: number) {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    this.flashSale.update(f => ({ ...f, endsAtUtc: d.toISOString() }));
    this.updateFlashDateInput();
  }

  updateFlashDateInput() {
    const f = this.flashSale();
    if (f && f.endsAtUtc) {
      const d = new Date(f.endsAtUtc);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      this.flashSaleEndDate = `${year}-${month}-${day}T${hours}:${mins}`;
    }
  }

  // Testimonials state
  testimonials = signal<any[]>([
    {
      id: 'test-1',
      customerName: 'Sarah Jenkins',
      customerRole: 'Verified Buyer',
      rating: 5,
      comment: 'Best customer service and fastest delivery! Super satisfied with Happy Steppy.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true
    },
    {
      id: 'test-2',
      customerName: 'Emily R.',
      customerRole: 'Verified Customer',
      rating: 5,
      comment: 'Great quality, super fast delivery and an amazing shopping experience!',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isActive: true
    }
  ]);
  editingTestimonial = signal<any>(null);
  isTestimonialModalOpen = signal<boolean>(false);

  // Brands state
  brands = signal<any[]>([
    { id: 'b1', name: 'Puma', logoUrl: '', isActive: true },
    { id: 'b2', name: 'NovaTech', logoUrl: '', isActive: true },
    { id: 'b3', name: 'UrbanFit', logoUrl: '', isActive: true },
    { id: 'b4', name: 'Nova', logoUrl: '', isActive: true }
  ]);
  editingBrand = signal<any>(null);
  isBrandModalOpen = signal<boolean>(false);

  // Footer & Settings state
  footerLinks = signal<any[]>([]);
  socialLinks = signal<any[]>([]);
  footerSettings = signal<{ [key: string]: string }>({
    CopyrightText: '© 2026 Happy Steppy. All rights reserved.',
    ContactPhone: '+92 317 4641903',
    ContactEmail: 'support@happysteppy.com',
    FooterAbout: 'Your one-stop shop for lifestyle, tech, home and more.',
    NewsletterTitle: 'Stay in the Loop',
    NewsletterSubtitle: 'Get the latest deals, new arrivals and more.'
  });
  editingFooterLink = signal<any>(null);
  isFooterLinkModalOpen = signal<boolean>(false);
  editingSocialLink = signal<any>(null);
  isSocialLinkModalOpen = signal<boolean>(false);

  // Toast / notification state
  toast = signal<{
    message: string;
    type: 'success' | 'delete' | 'error' | 'info';
    title: string;
  } | null>(null);
  toastMessage = computed(() => this.toast()?.message ?? null);
  private toastTimer: any = null;

  // Custom Confirmation Modal
  confirmModal = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      try {
        localStorage.setItem('hs_admin_tab', tab);
      } catch {}
    });

    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadAllData();
      }
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadAllData();
    } else {
      this.authService.autoLogin().subscribe(() => {
        this.loadAllData();
      });
    }
  }

  showToast(msg: string, type: 'success' | 'delete' | 'error' | 'info' = 'success', title?: string) {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    const lower = msg.toLowerCase();
    if (type === 'success') {
      if (lower.includes('deleted') || lower.includes('removed') || lower.includes('delete')) {
        type = 'delete';
      } else if (lower.includes('failed') || lower.includes('error') || lower.includes('invalid')) {
        type = 'error';
      }
    }

    const defaultTitle = type === 'delete' ? 'Item Deleted' :
                         type === 'error' ? 'Notice' :
                         type === 'info' ? 'Information' : 'Action Completed';

    this.toast.set({
      message: msg,
      type,
      title: title || defaultTitle
    });

    this.toastTimer = setTimeout(() => {
      this.toast.set(null);
    }, 3800);
  }

  closeToast() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set(null);
  }

  openConfirmModal(config: { title: string; message: string; itemName?: string; confirmText?: string; onConfirm: () => void }) {
    this.confirmModal.set({
      isOpen: true,
      title: config.title,
      message: config.message,
      itemName: config.itemName,
      confirmText: config.confirmText || 'Yes, Delete',
      onConfirm: config.onConfirm
    });
  }

  closeConfirmModal() {
    this.confirmModal.set(null);
  }

  executeConfirmModal() {
    const modal = this.confirmModal();
    if (modal && modal.onConfirm) {
      modal.onConfirm();
    }
    this.closeConfirmModal();
  }

  // Auth actions
  login() {
    this.isLoggingIn.set(true);
    this.loginError.set(null);

    this.authService.login({
      email: this.loginEmail(),
      password: this.loginPassword()
    }).subscribe({
      next: () => {
        this.isLoggingIn.set(false);
        this.showToast('Logged in successfully!');
        this.loadAllData();
      },
      error: (err) => {
        this.isLoggingIn.set(false);
        this.loginError.set(err.error?.message || 'Login failed. Please verify your credentials.');
      }
    });
  }

  fillDemo() {
    this.loginEmail.set('admin@happysteppy.com');
    this.loginPassword.set('Admin@123456');
  }

  quickLoginSuperAdmin() {
    this.fillDemo();
    this.login();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.showToast('Logged out.');
    });
  }

  loadAllData() {
    this.loadStats();
    this.loadProducts();
    this.loadCategories();
    this.loadHeroSlides();
    this.loadBanners();
    this.loadStyleCards();
    this.loadFlashSale();
    this.loadTestimonials();
    this.loadBrands();
    this.loadFooterData();
  }

  loadStats() {
    this.api.getDashboardStats().subscribe(res => this.stats.set(res));
  }

  // Products CRUD
  loadProducts() {
    this.api.getProducts(false).subscribe(res => this.products.set(res));
  }

  openCreateProduct() {
    this.editingProduct.set({
      id: null,
      name: '',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      price: 99.99,
      compareAtPrice: 129.99,
      stockQuantity: 50,
      primaryImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      shortDescription: 'High performance modern lifestyle footwear',
      badgeText: 'NEW',
      isTrending: true,
      isFeatured: false,
      isActive: true
    });
    this.isProductModalOpen.set(true);
  }

  openEditProduct(p: any) {
    this.editingProduct.set({ ...p });
    this.isProductModalOpen.set(true);
  }

  saveProduct() {
    const p = this.editingProduct();
    if (!p.name || p.price <= 0) {
      this.showToast('Please fill product name and a valid price.', 'error');
      return;
    }
    p.sku = p.sku || ('HS-' + Math.floor(10000 + Math.random() * 90000));

    if (p.id) {
      this.api.updateProduct(p.id, p).subscribe({
        next: () => {
          this.showToast('Product updated successfully!');
          this.isProductModalOpen.set(false);
          this.loadProducts();
          this.loadStats();
        },
        error: (err: any) => {
          this.showToast('Failed to update product: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    } else {
      this.api.createProduct(p).subscribe({
        next: () => {
          this.showToast('Product created successfully!');
          this.isProductModalOpen.set(false);
          this.loadProducts();
          this.loadStats();
        },
        error: (err: any) => {
          this.showToast('Failed to create product: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    }
  }

  deleteProduct(id: string) {
    const prod = this.products().find(p => p.id === id);
    this.openConfirmModal({
      title: 'Delete Product',
      message: 'Are you sure you want to permanently delete this product? It will be removed from your storefront.',
      itemName: prod ? prod.name : undefined,
      onConfirm: () => {
        this.api.deleteProduct(id).subscribe({
          next: () => {
            this.showToast('Product deleted successfully.', 'delete');
            this.loadProducts();
            this.loadStats();
          },
          error: (err: any) => {
            this.showToast('Failed to delete product: ' + (err.error?.message || 'Server error'), 'error');
          }
        });
      }
    });
  }

  toggleProductTrending(p: any, event?: Event) {
    if (event) event.stopPropagation();
    const newStatus = !p.isTrending;

    // Optimistic UI update
    this.products.update(list => list.map(item => item.id === p.id ? { ...item, isTrending: newStatus } : item));

    const req = {
      name: p.name,
      slug: p.slug,
      sku: p.sku || ('HS-' + Math.floor(1000 + Math.random() * 9000)),
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      stockQuantity: p.stockQuantity || 50,
      primaryImageUrl: p.primaryImageUrl,
      badgeText: p.badgeText,
      isFeatured: p.isFeatured ?? true,
      isTrending: newStatus,
      isBestSeller: p.isBestSeller ?? false,
      brandId: p.brandId,
      categoryIds: p.categoryIds || []
    };

    this.api.updateProduct(p.id, req).subscribe({
      next: () => {
        const msg = newStatus
          ? `🔥 "${p.name}" is now LIVE in Trending Products on Homepage!`
          : `Removed "${p.name}" from Homepage Trending.`;
        this.showToast(msg, newStatus ? 'success' : 'info');
      },
      error: () => {
        this.products.update(list => list.map(item => item.id === p.id ? { ...item, isTrending: !newStatus } : item));
        this.showToast('Failed to update trending status', 'error');
      }
    });
  }

  uploadImageFromComputer(event: Event, targetType: 'product' | 'flash' | 'flashSecondary' | 'category' | 'hero' | 'banner' | 'style') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploadingImage.set(true);

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (targetType === 'product') {
        this.editingProduct.update(p => ({ ...p, primaryImageUrl: base64 }));
      } else if (targetType === 'flash') {
        this.flashSale.update(f => ({ ...f, imageUrl: base64 }));
      } else if (targetType === 'flashSecondary') {
        this.flashSale.update(f => ({ ...f, secondaryImageUrl: base64 }));
      } else if (targetType === 'category') {
        this.editingCategory.update(c => ({ ...c, imageUrl: base64 }));
      } else if (targetType === 'hero') {
        this.editingSlide.update(h => ({ ...h, desktopImageUrl: base64 }));
      } else if (targetType === 'banner') {
        this.promoBanner.update((b: any) => ({ ...b, imageUrl: base64 }));
      } else if (targetType === 'style') {
        this.editingStyleCard.update((s: any) => ({ ...s, imageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);

    // Upload to backend media API
    this.api.uploadMedia(file).subscribe({
      next: (res: any) => {
        this.isUploadingImage.set(false);
        const serverUrl = res.url || res.publicUrl || res.path;
        if (serverUrl) {
          if (targetType === 'product') {
            this.editingProduct.update(p => ({ ...p, primaryImageUrl: serverUrl }));
          } else if (targetType === 'flash') {
            this.flashSale.update(f => ({ ...f, imageUrl: serverUrl }));
          } else if (targetType === 'flashSecondary') {
            this.flashSale.update(f => ({ ...f, secondaryImageUrl: serverUrl }));
          } else if (targetType === 'category') {
            this.editingCategory.update(c => ({ ...c, imageUrl: serverUrl }));
          } else if (targetType === 'hero') {
            this.editingSlide.update(h => ({ ...h, desktopImageUrl: serverUrl }));
          } else if (targetType === 'banner') {
            this.promoBanner.update((b: any) => ({ ...b, imageUrl: serverUrl }));
          } else if (targetType === 'style') {
            this.editingStyleCard.update((s: any) => ({ ...s, imageUrl: serverUrl }));
          }
        }
        this.showToast('Picture uploaded from computer successfully!', 'success');
        input.value = '';
      },
      error: (err: any) => {
        this.isUploadingImage.set(false);
        console.warn('Image upload error:', err);
        this.showToast('Picture loaded from computer!', 'info');
        input.value = '';
      }
    });
  }

  // Categories CRUD
  loadCategories() {
    this.api.getCategories().subscribe(res => this.categories.set(res));
  }

  openCreateCategory() {
    this.editingCategory.set({ id: null, name: '', slug: '', description: '', showOnHomepage: true, showInSidebar: true });
    this.isCategoryModalOpen.set(true);
  }

  openEditCategory(c: any) {
    this.editingCategory.set({ ...c });
    this.isCategoryModalOpen.set(true);
  }

  saveCategory() {
    const c = this.editingCategory();
    if (!c.name) return;

    if (c.id) {
      this.api.updateCategory(c.id, c).subscribe({
        next: () => {
          this.showToast('Category updated!');
          this.isCategoryModalOpen.set(false);
          this.loadCategories();
        },
        error: (err: any) => {
          this.showToast('Failed to update category: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    } else {
      this.api.createCategory(c).subscribe({
        next: () => {
          this.showToast('Category created!');
          this.isCategoryModalOpen.set(false);
          this.loadCategories();
        },
        error: (err: any) => {
          this.showToast('Failed to create category: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    }
  }

  deleteCategory(id: string) {
    const cat = this.categories().find(c => c.id === id);
    this.openConfirmModal({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? Products inside may be unlinked.',
      itemName: cat ? cat.name : undefined,
      onConfirm: () => {
        this.api.deleteCategory(id).subscribe({
          next: () => {
            this.showToast('Category deleted successfully.', 'delete');
            this.loadCategories();
          },
          error: (err: any) => {
            this.showToast('Failed to delete category: ' + (err.error?.message || 'Server error'), 'error');
          }
        });
      }
    });
  }

  // Hero Slides
  loadHeroSlides() {
    this.api.getHeroSlides().subscribe(res => this.heroSlides.set(res));
  }

  openCreateSlide() {
    this.editingSlide.set({
      id: null,
      title: 'Upgrade Your Lifestyle',
      subtitle: 'Discover top picks for home, tech, fashion and more',
      description: 'Discover top picks for home, tech, fashion and more — all in one place.',
      desktopImageUrl: 'assets/images/hero-upgrade-lifestyle.jpg?v=2',
      primaryButtonText: 'Shop the Collection',
      primaryButtonUrl: '/products',
      secondaryButtonText: 'Explore Deals',
      secondaryButtonUrl: '/deals',
      badgeText: 'LIMITED TIME OFFER',
      isActive: true
    });
    this.isSlideModalOpen.set(true);
  }

  openEditSlide(s: any) {
    this.editingSlide.set({ ...s });
    this.isSlideModalOpen.set(true);
  }

  saveSlide() {
    const s = this.editingSlide();
    this.api.saveHeroSlide(s).subscribe({
      next: () => {
        this.showToast('Hero slide saved!');
        this.isSlideModalOpen.set(false);
        this.loadHeroSlides();
      },
      error: (err: any) => {
        this.showToast('Failed to save hero slide: ' + (err.error?.message || 'Server error'), 'error');
      }
    });
  }

  deleteSlide(id: string) {
    const slide = this.heroSlides().find(s => s.id === id);
    this.openConfirmModal({
      title: 'Delete Hero Slide',
      message: 'Are you sure you want to delete this hero slider banner?',
      itemName: slide ? slide.title : undefined,
      onConfirm: () => {
        this.api.deleteHeroSlide(id).subscribe({
          next: () => {
            this.showToast('Hero slide deleted.', 'delete');
            this.loadHeroSlides();
          },
          error: (err: any) => {
            this.showToast('Failed to delete hero slide: ' + (err.error?.message || 'Server error'), 'error');
          }
        });
      }
    });
  }

  // Banners
  loadBanners() {
    this.api.getBanners().subscribe(res => {
      if (res && res.length > 0) this.promoBanner.set(res[0]);
    });
  }

  savePromoBanner() {
    this.api.saveBanner(this.promoBanner()).subscribe({
      next: () => {
        this.showToast('Promotional Banner updated successfully!');
      },
      error: (err) => {
        this.showToast('Error saving promo banner: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  // Style Cards
  loadStyleCards() {
    this.api.getStyleCards().subscribe({
      next: (res) => {
        if (res && res.length > 0) this.styleCards.set(res);
      },
      error: (err) => console.warn('Could not load style cards', err)
    });
  }

  openCreateStyleCard() {
    this.editingStyleCard.set({
      id: null,
      title: '',
      subtitle: '',
      imageUrl: 'assets/images/style-tech.jpg',
      linkUrl: '/products',
      sortOrder: this.styleCards().length + 1,
      isActive: true
    });
    this.isStyleModalOpen.set(true);
  }

  openEditStyleCard(card: any) {
    this.editingStyleCard.set({
      id: card.id,
      title: card.title || '',
      subtitle: card.subtitle || '',
      imageUrl: card.imageUrl || '',
      linkUrl: card.linkUrl || '/products',
      sortOrder: card.sortOrder || 1,
      isActive: card.isActive ?? true
    });
    this.isStyleModalOpen.set(true);
  }

  saveStyleCard() {
    const card = this.editingStyleCard();
    if (!card || !card.title || !card.title.trim()) {
      this.showToast('Please enter a style title (e.g. Tech Lover)', 'error');
      return;
    }
    if (!card.imageUrl || !card.imageUrl.trim()) {
      this.showToast('Please provide an image URL for the style card', 'error');
      return;
    }

    this.api.saveStyleCard(card).subscribe({
      next: () => {
        this.showToast(card.id ? 'Style Card updated successfully!' : 'Style Card added successfully!');
        this.isStyleModalOpen.set(false);
        this.loadStyleCards();
      },
      error: (err) => {
        this.showToast('Failed to save style card: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  deleteStyleCard(id: string) {
    const card = this.styleCards().find(c => c.id === id);
    this.openConfirmModal({
      title: 'Delete Style Card',
      message: 'Are you sure you want to remove this style card from the storefront?',
      itemName: card ? card.title : undefined,
      confirmText: 'Yes, Delete',
      onConfirm: () => {
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (!isGuid) {
          this.styleCards.update(cards => cards.filter(c => c.id !== id));
          this.showToast('Style Card removed.', 'delete');
          return;
        }

        this.api.deleteStyleCard(id).subscribe({
          next: () => {
            this.showToast('Style Card deleted successfully.', 'delete');
            this.loadStyleCards();
          },
          error: () => {
            this.styleCards.update(cards => cards.filter(c => c.id !== id));
            this.showToast('Style Card removed.', 'delete');
          }
        });
      }
    });
  }

  // Flash Sale
  loadFlashSale() {
    this.api.getFlashSale().subscribe(res => {
      if (res) {
        this.flashSale.set(res);
        this.updateFlashDateInput();
      } else {
        this.setFlashPresetHours(24);
      }
    });
  }

  saveFlashSale() {
    const f = this.flashSale();
    if (!f || !f.title || !f.title.trim()) {
      this.showToast('Please enter flash sale title', 'error');
      return;
    }
    if (!f.endsAtUtc) {
      f.endsAtUtc = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    }
    if (f.isActive === undefined || f.isActive === null) {
      f.isActive = true;
    }
    this.api.saveFlashSale(f).subscribe({
      next: () => {
        this.showToast('Flash Sale settings saved successfully!');
        this.loadFlashSale();
      },
      error: () => {
        this.showToast('Failed to save flash sale settings.', 'error');
      }
    });
  }

  // Testimonials
  loadTestimonials() {
    this.api.getTestimonials().subscribe(res => this.testimonials.set(res));
  }

  openCreateTestimonial() {
    this.editingTestimonial.set({
      id: null,
      customerName: '',
      customerRole: 'Verified Customer',
      rating: 5,
      comment: '',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      isActive: true,
      sortOrder: 1
    });
    this.isTestimonialModalOpen.set(true);
  }

  openEditTestimonial(t: any) {
    this.editingTestimonial.set({ ...t });
    this.isTestimonialModalOpen.set(true);
  }

  saveTestimonial() {
    const t = this.editingTestimonial();
    if (!t.customerName || !t.comment) {
      this.showToast('Please fill customer name and review comment.', 'error');
      return;
    }
    t.isActive = true;

    this.api.saveTestimonial(t).subscribe({
      next: () => {
        this.showToast('Testimonial saved successfully!');
        this.isTestimonialModalOpen.set(false);
        this.loadTestimonials();
      },
      error: (err) => {
        this.showToast('Error saving testimonial: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  deleteTestimonial(id: string) {
    const t = this.testimonials().find(x => x.id === id);
    this.openConfirmModal({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this customer review?',
      itemName: t ? `${t.customerName}` : undefined,
      onConfirm: () => {
        this.api.deleteTestimonial(id).subscribe({
          next: () => {
            this.showToast('Testimonial deleted.', 'delete');
            this.loadTestimonials();
          },
          error: (err: any) => {
            this.showToast('Failed to delete testimonial: ' + (err.error?.message || 'Server error'), 'error');
          }
        });
      }
    });
  }

  // Brands
  loadBrands() {
    this.api.getBrands().subscribe(res => this.brands.set(res));
  }

  openCreateBrand() {
    this.editingBrand.set({ id: null, name: '', slug: '', logoUrl: null, isActive: true, sortOrder: this.brands().length + 1 });
    this.isBrandModalOpen.set(true);
  }

  openEditBrand(b: any) {
    this.editingBrand.set({ ...b, isActive: b.isActive ?? true });
    this.isBrandModalOpen.set(true);
  }

  saveBrand() {
    const brand = this.editingBrand();
    if (!brand || !brand.name || !brand.name.trim()) {
      this.showToast('Please enter brand name', 'error');
      return;
    }
    if (brand.isActive === undefined || brand.isActive === null) {
      brand.isActive = true;
    }
    this.api.saveBrand(brand).subscribe({
      next: () => {
        this.showToast(brand.id ? 'Brand updated!' : 'Brand added successfully!');
        this.isBrandModalOpen.set(false);
        this.loadBrands();
      },
      error: () => {
        this.showToast('Failed to save brand.', 'error');
      }
    });
  }

  deleteBrand(id: string) {
    const b = this.brands().find(x => x.id === id);
    this.openConfirmModal({
      title: 'Delete Trusted Brand',
      message: 'Are you sure you want to remove this brand from your storefront?',
      itemName: b ? b.name : undefined,
      onConfirm: () => {
        this.api.deleteBrand(id).subscribe({
          next: () => {
            this.showToast('Brand deleted.', 'delete');
            this.loadBrands();
          },
          error: (err: any) => {
            this.showToast('Failed to delete brand: ' + (err.error?.message || 'Server error'), 'error');
          }
        });
      }
    });
  }

  // Footer & Settings CMS
  loadFooterData() {
    this.api.getFooterLinks().subscribe({
      next: (res) => this.footerLinks.set(res),
      error: (err) => console.warn('Could not load footer links', err)
    });

    this.api.getSocialLinks().subscribe({
      next: (res) => this.socialLinks.set(res),
      error: (err) => console.warn('Could not load social links', err)
    });

    this.api.getSettings().subscribe({
      next: (res) => {
        if (res) {
          this.footerSettings.update(curr => ({ ...curr, ...res }));
        }
      },
      error: (err) => console.warn('Could not load settings', err)
    });
  }

  // Footer Links CRUD
  openCreateFooterLink(columnName: string = 'Shop') {
    this.editingFooterLink.set({
      id: null,
      columnName: columnName,
      title: '',
      url: '/',
      sortOrder: this.footerLinks().filter(l => l.columnName === columnName).length + 1,
      isActive: true
    });
    this.isFooterLinkModalOpen.set(true);
  }

  openEditFooterLink(link: any) {
    this.editingFooterLink.set({ ...link });
    this.isFooterLinkModalOpen.set(true);
  }

  saveFooterLink() {
    const link = this.editingFooterLink();
    if (!link.title) {
      this.showToast('Please enter a link title.', 'error');
      return;
    }

    this.api.saveFooterLink(link).subscribe({
      next: () => {
        this.showToast('Footer link saved successfully!');
        this.isFooterLinkModalOpen.set(false);
        this.loadFooterData();
      },
      error: () => this.showToast('Failed to save footer link.', 'error')
    });
  }

  deleteFooterLink(id: string) {
    const link = this.footerLinks().find(l => l.id === id);
    this.openConfirmModal({
      title: 'Delete Footer Link',
      message: 'Are you sure you want to delete this navigation footer link?',
      itemName: link ? `${link.title} (${link.columnName})` : undefined,
      onConfirm: () => {
        this.api.deleteFooterLink(id).subscribe({
          next: () => {
            this.showToast('Footer link removed.', 'delete');
            this.loadFooterData();
          },
          error: () => this.showToast('Failed to delete footer link.', 'error')
        });
      }
    });
  }

  // Social Links CRUD
  openCreateSocialLink() {
    this.editingSocialLink.set({
      id: null,
      platform: '',
      url: 'https://',
      iconName: 'share',
      sortOrder: this.socialLinks().length + 1,
      isActive: true
    });
    this.isSocialLinkModalOpen.set(true);
  }

  openEditSocialLink(s: any) {
    this.editingSocialLink.set({ ...s });
    this.isSocialLinkModalOpen.set(true);
  }

  saveSocialLink() {
    const s = this.editingSocialLink();
    if (!s.platform || !s.url) {
      this.showToast('Please enter platform and URL.', 'error');
      return;
    }

    this.api.saveSocialLink(s).subscribe({
      next: () => {
        this.showToast('Social link saved successfully!');
        this.isSocialLinkModalOpen.set(false);
        this.loadFooterData();
      },
      error: () => this.showToast('Failed to save social link.', 'error')
    });
  }

  deleteSocialLink(id: string) {
    const s = this.socialLinks().find(x => x.id === id);
    this.openConfirmModal({
      title: 'Delete Social Link',
      message: 'Are you sure you want to remove this official social network link?',
      itemName: s ? s.platform : undefined,
      onConfirm: () => {
        this.api.deleteSocialLink(id).subscribe({
          next: () => {
            this.showToast('Social link removed.', 'delete');
            this.loadFooterData();
          },
          error: () => this.showToast('Failed to delete social link.', 'error')
        });
      }
    });
  }

  // Save Website/Footer Settings
  saveSettingKey(key: string, value: string) {
    this.api.saveSetting(key, value).subscribe({
      next: () => {
        this.footerSettings.update(s => ({ ...s, [key]: value }));
        this.showToast(`Saved: ${key}`);
      },
      error: () => this.showToast(`Failed to save ${key}`)
    });
  }

  saveAllFooterSettings() {
    const settings = this.footerSettings();
    const keys = Object.keys(settings);
    let done = 0;
    keys.forEach(k => {
      this.api.saveSetting(k, settings[k]).subscribe({
        next: () => {
          done++;
          if (done === keys.length) {
            this.showToast('All footer settings saved successfully!');
          }
        }
      });
    });
  }
}
