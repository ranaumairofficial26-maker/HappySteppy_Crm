export interface CategoryItem {
  name: string;
  icon: string;
  imgUrl?: string;
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
  isWishlisted?: boolean;
}

