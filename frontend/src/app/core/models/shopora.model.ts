export interface CategoryItem {
  id?: number;
  name: string;
  icon: string;
  imgUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TrendingProduct {
  id: number;
  name: string;
  category: string;
  discount: number;
  rating: number;
  reviewCount: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  displayOrder?: number;
  isActive?: boolean;
  isWishlisted?: boolean;
}

export interface PromoBannerConfig {
  id?: number;
  eventTag: string;
  title: string;
  subtitle: string;
  discountText: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  recommendedWidth: number;
  recommendedHeight: number;
}

export interface FooterConfig {
  id?: number;
  logoUrl: string;
  aboutText: string;
  trustBadgeText: string;
  contactPhone: string;
  contactEmail: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  socialInstagram: string;
  socialFacebook: string;
  socialWhatsapp: string;
  socialTiktok: string;
  socialYoutube: string;
  socialX: string;
  copyrightText: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  showInstagram?: boolean;
  showFacebook?: boolean;
  showWhatsapp?: boolean;
  showTiktok?: boolean;
  showYoutube?: boolean;
  showX?: boolean;
}

