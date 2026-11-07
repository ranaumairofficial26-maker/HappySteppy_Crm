import { Injectable, signal, computed } from '@angular/core';
import { Product, AdminStats } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Exact authentic products matching happysteppy.pk home page
  private readonly initialProducts: Product[] = [
    {
      id: 1,
      name: 'Kirkman L-Taurine 1000 mg – Hypoallergenic 100 caps',
      brand: 'Kirkman',
      category: 'Supplements',
      price: 7400,
      salePrice: 2400,
      rating: 5.0,
      reviewCount: 42,
      stockQuantity: 14,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2024/04/0283-100_bottle_1-500x500.jpg',
      shortDescription: 'Kirkman offers L-Taurine 1000 mg in hypoallergenic vegetarian capsules. Gluten and casein free.',
      isFeatured: true,
      isDealOfTheDay: true,
      discountPercent: 68
    },
    {
      id: 2,
      name: 'Life Extension One-Per-Day Multivitamin 60 tablets',
      brand: 'Life Extension',
      category: 'Supplements',
      price: 8200,
      salePrice: 6300,
      rating: 4.9,
      reviewCount: 58,
      stockQuantity: 22,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2022/07/one-per-day-500x500.png',
      shortDescription: 'High-potency multivitamin and mineral supplement providing an essential spectrum of nutrients.',
      isFeatured: true,
      isDealOfTheDay: true,
      discountPercent: 23
    },
    {
      id: 3,
      name: 'Bioray Belly Mend',
      brand: 'Bioray',
      category: 'Supplements',
      price: 8200,
      salePrice: 8200,
      rating: 5.0,
      reviewCount: 36,
      stockQuantity: 15,
      imageUrl: 'assets/images/bioray-belly-mend.webp',
      secondaryImageUrl: 'assets/images/bioray-belly-mend-bottle.webp',
      images: ['assets/images/bioray-belly-mend.webp', 'assets/images/bioray-belly-mend-bottle.webp'],
      shortDescription: 'Bioray Daily Belly Mend Gut Support 11-Strain Probiotic Blend with Medicinal Mushrooms & Micronized Chlorella 60 ml (2 fl oz).',
      isFeatured: true,
      isDealOfTheDay: true,
      discountPercent: 0
    },
    {
      id: 4,
      name: 'NOW INULIN PURE POWDER 8 OZ',
      brand: 'NOW Foods',
      category: 'Supplements',
      price: 6500,
      salePrice: 4700,
      rating: 4.8,
      reviewCount: 27,
      stockQuantity: 18,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2021/01/inulin_1-500x500.jpg',
      shortDescription: 'Certified Organic Inulin is a prebiotic fructooligosaccharide that feeds friendly gut microflora.',
      isFeatured: true,
      isDealOfTheDay: false,
      discountPercent: 28
    },
    {
      id: 5,
      name: 'Nordic Naturals Omega-3 1560 mg 8 Oz Liquid',
      brand: 'Nordic Naturals',
      category: 'Supplements',
      price: 9800,
      salePrice: 9800,
      rating: 5.0,
      reviewCount: 49,
      stockQuantity: 12,
      imageUrl: 'assets/images/nordic-naturals-omega-3.jpg',
      shortDescription: 'Great-tasting lemon-flavored liquid omega-3 delivering 1560 mg EPA & DHA per serving.',
      isFeatured: true,
      isDealOfTheDay: false,
      discountPercent: 15
    },
    {
      id: 6,
      name: 'Cobram Estate Classic 100% California Extra Virgin Olive Oil First Cold Pressed 375ml Bottle',
      brand: 'Cobram Estate',
      category: 'Natural Foods',
      price: 11500,
      salePrice: undefined,
      rating: 4.9,
      reviewCount: 31,
      stockQuantity: 8,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2021/01/41dbDpRPruL._SL1080_-500x500.jpg',
      shortDescription: 'First cold pressed California extra virgin olive oil with vibrant fresh fruity notes.',
      isFeatured: true,
      isDealOfTheDay: false
    },
    {
      id: 7,
      name: 'Nordic Naturals Ultimate Omega3 Lemon 2840mg 4 FL OZ',
      brand: 'Nordic Naturals',
      category: 'Supplements',
      price: 9800,
      salePrice: undefined,
      rating: 4.9,
      reviewCount: 39,
      stockQuantity: 15,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2021/01/RUS-01793R_Ultimate_Omega__4oz-500x500.webp',
      shortDescription: 'Double-strength concentrated EPA & DHA liquid for heart, brain, and immune support.',
      isFeatured: false,
      isDealOfTheDay: false
    },
    {
      id: 8,
      name: 'Now Candida Support – 90 Veg Caps',
      brand: 'NOW Foods',
      category: 'Supplements',
      price: 5600,
      salePrice: undefined,
      rating: 4.8,
      reviewCount: 44,
      stockQuantity: 17,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2021/02/57.avif',
      shortDescription: 'Herbal combination with Pau D’Arco, Oregano Oil, and Biotin to support healthy intestinal flora balance.',
      isFeatured: false,
      isDealOfTheDay: false
    },
    {
      id: 9,
      name: 'NOW Double Strength DHA-500 Fish Oil 90 soft gel',
      brand: 'NOW Foods',
      category: 'Supplements',
      price: 7500,
      salePrice: 6500,
      rating: 4.9,
      reviewCount: 53,
      stockQuantity: 16,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2021/01/30.avif',
      shortDescription: 'Cardiovascular and brain health support with 500 mg concentrated DHA per softgel.',
      isFeatured: true,
      isDealOfTheDay: true,
      discountPercent: 13
    },
    {
      id: 10,
      name: 'Wooden Jigsaw Puzzle Board Set for Kids – Motor Skill & Focus Toy',
      brand: 'Happy Steppy Sensory',
      category: 'Sensory & Special Needs',
      price: 600,
      salePrice: undefined,
      rating: 4.9,
      reviewCount: 33,
      stockQuantity: 25,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2026/11/WhatsApp-Image-2026-11-02-at-8.51.49-AM-2-500x500.jpeg',
      shortDescription: 'Montessori wooden sorting and shape puzzle designed for autism tactile stimulation and hand-eye coordination.',
      isFeatured: true,
      isDealOfTheDay: false
    },
    {
      id: 11,
      name: '2-in-1 Wooden Spelling & Letter Matching Game as Preschool Educational Toy',
      brand: 'Happy Steppy Sensory',
      category: 'Sensory & Special Needs',
      price: 1350,
      salePrice: undefined,
      rating: 4.8,
      reviewCount: 24,
      stockQuantity: 20,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2026/11/WhatsApp-Image-2026-11-02-at-8.51.54-AM-500x500.jpeg',
      shortDescription: 'Preschool educational toy to practice phonics, letter recognition and fine motor skills.',
      isFeatured: true,
      isDealOfTheDay: false
    },
    {
      id: 12,
      name: 'Kids EVA Foam Puzzle Mat Set – Alphabet, Numbers & Shapes Learning Mats',
      brand: 'Happy Steppy Sensory',
      category: 'Sensory & Special Needs',
      price: 950,
      salePrice: undefined,
      rating: 4.9,
      reviewCount: 40,
      stockQuantity: 18,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2026/11/ChatGPT-Image-Nov-2-2026-10_39_36-AM-3-500x500.png',
      shortDescription: 'Soft and interlocking cushioned floor mat for playroom sensory safety, motor play, and crawling.',
      isFeatured: false,
      isDealOfTheDay: false
    },
    {
      id: 13,
      name: '3D Hamburger Press Gyroball Fidget Spinner Toy',
      brand: 'Happy Steppy Sensory',
      category: 'Sensory & Special Needs',
      price: 460,
      salePrice: undefined,
      rating: 4.7,
      reviewCount: 19,
      stockQuantity: 30,
      imageUrl: 'https://happysteppy.pk/wp-content/uploads/2026/11/S45261c4b4148433ab2c3c967237a14598.jpg_720x720q80-500x500.jpg',
      shortDescription: 'Calming fidget toy engineered to soothe ADHD hyperactivity and provide tactile pressure relief.',
      isFeatured: false,
      isDealOfTheDay: false
    }
  ];

  readonly products = signal<Product[]>(this.loadProducts());

  readonly featuredProducts = computed(() =>
    this.products().filter(p => p.isFeatured)
  );

  readonly dealsOfTheDay = computed(() =>
    this.products().filter(p => p.isDealOfTheDay)
  );

  readonly bestSellers = computed(() =>
    this.products().slice(0, 6)
  );

  readonly onSaleProducts = computed(() =>
    this.products().filter(p => p.salePrice && p.salePrice < p.price)
  );

  readonly newArrivals = computed(() =>
    this.products().slice(6)
  );

  readonly stats = computed<AdminStats>(() => {
    const list = this.products();
    const brands = new Set(list.map(p => p.brand));
    const categories = new Set(list.map(p => p.category));
    return {
      totalProducts: list.length,
      totalStock: list.reduce((acc, p) => acc + p.stockQuantity, 0),
      activeDeals: list.filter(p => p.isDealOfTheDay).length,
      categoriesCount: categories.size,
      totalBrands: brands.size
    };
  });

  private loadProducts(): Product[] {
    // We want the authentic items loaded fresh from the scraped happysteppy.pk site
    const saved = localStorage.getItem('happysteppy_products_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.initialProducts;
      }
    }
    return this.initialProducts;
  }

  private saveToStorage(products: Product[]) {
    localStorage.setItem('happysteppy_products_v2', JSON.stringify(products));
  }

  addProduct(productData: Omit<Product, 'id'>) {
    const current = this.products();
    const newId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...productData,
      id: newId
    };
    const updated = [newProduct, ...current];
    this.products.set(updated);
    this.saveToStorage(updated);
  }

  updateProduct(id: number, updatedData: Partial<Product>) {
    const current = this.products();
    const updated = current.map(p => (p.id === id ? { ...p, ...updatedData } : p));
    this.products.set(updated);
    this.saveToStorage(updated);
  }

  deleteProduct(id: number) {
    const current = this.products();
    const updated = current.filter(p => p.id !== id);
    this.products.set(updated);
    this.saveToStorage(updated);
  }

  resetToDefault() {
    this.products.set(this.initialProducts);
    this.saveToStorage(this.initialProducts);
  }
}
