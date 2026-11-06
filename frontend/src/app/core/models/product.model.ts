export interface Product {
  id: number;
  name: string;
  brand: string;
  category: 'Supplements' | 'Sensory & Special Needs' | 'Natural Foods' | 'Vitamins & Minerals';
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  imageUrl: string;
  shortDescription: string;
  isFeatured: boolean;
  isDealOfTheDay: boolean;
  discountPercent?: number;
}

export interface AdminStats {
  totalProducts: number;
  totalStock: number;
  activeDeals: number;
  categoriesCount: number;
  totalBrands: number;
}

