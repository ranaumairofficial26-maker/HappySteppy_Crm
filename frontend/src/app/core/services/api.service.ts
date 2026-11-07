import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5210/api';

  // Public Endpoints
  getPublicHomepage(): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/homepage`);
  }

  // Admin Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/dashboard/stats`);
  }

  // Admin Products
  getProducts(activeOnly: boolean = false): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products?activeOnly=${activeOnly}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/products`, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/products/${id}`);
  }

  // Admin Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/categories`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/categories`, category);
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/categories/${id}`);
  }

  // Admin Homepage CMS: Hero Slides
  getHeroSlides(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/slides`);
  }

  saveHeroSlide(slide: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/slides`, slide);
  }

  deleteHeroSlide(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/slides/${id}`);
  }

  // Admin Homepage CMS: Banners
  getBanners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/banners`);
  }

  saveBanner(banner: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/banners`, banner);
  }

  // Admin Homepage CMS: Style Cards
  getStyleCards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/styles`);
  }

  saveStyleCard(card: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/styles`, card);
  }

  deleteStyleCard(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/styles/${id}`);
  }

  // Admin Homepage CMS: Flash Sale
  getFlashSale(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/homepage/flash-sale`);
  }

  saveFlashSale(sale: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/flash-sale`, sale);
  }

  // Admin Homepage CMS: Testimonials
  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/testimonials`);
  }

  saveTestimonial(t: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/testimonials`, t);
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/testimonials/${id}`);
  }

  // Admin Homepage CMS: Brands
  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/brands`);
  }

  saveBrand(brand: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/brands`, brand);
  }

  deleteBrand(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/brands/${id}`);
  }

  // Admin Homepage CMS: Footer Links
  getFooterLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/footer-links`);
  }

  saveFooterLink(link: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/footer-links`, link);
  }

  deleteFooterLink(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/footer-links/${id}`);
  }

  // Admin Homepage CMS: Social Links
  getSocialLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/homepage/social-links`);
  }

  saveSocialLink(link: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/social-links`, link);
  }

  deleteSocialLink(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/homepage/social-links/${id}`);
  }

  // Admin Homepage CMS: Settings
  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/homepage/settings`);
  }

  saveSetting(key: string, value: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/homepage/settings`, { key, value });
  }

  // Media Upload
  uploadMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/admin/media/upload`, formData);
  }
}

