import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryItem } from '../models/shopora.model';

const STORAGE_KEY = 'hs_top_brands';

const DEFAULT_BRANDS: CategoryItem[] = [
  { id: 1, name: 'Bioray', icon: 'fa-solid fa-flask', imgUrl: '' },
  { id: 2, name: 'CBD Plus', icon: 'fa-solid fa-leaf', imgUrl: '' },
  { id: 3, name: 'Designs for Health', icon: 'fa-solid fa-heart-pulse', imgUrl: '' },
  { id: 4, name: 'Kirkman', icon: 'fa-solid fa-capsules', imgUrl: '' },
  { id: 5, name: 'Life Extension', icon: 'fa-solid fa-dna', imgUrl: '' },
  { id: 6, name: 'Mary Ruth', icon: 'fa-solid fa-shield-heart', imgUrl: '' },
  { id: 7, name: "Nature's Answer", icon: 'fa-solid fa-seedling', imgUrl: '' },
  { id: 8, name: "Nature's Way", icon: 'fa-solid fa-tree', imgUrl: '' },
  { id: 9, name: 'NOW Foods', icon: 'fa-solid fa-apple-whole', imgUrl: '' }
];

@Injectable({
  providedIn: 'root'
})
export class BrandStoreService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/brands';

  readonly brands = signal<CategoryItem[]>(this.loadInitial());
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.refreshFromApi();
  }

  private loadInitial(): CategoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BRANDS;
  }

  private persist(items: CategoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  refreshFromApi(): void {
    this.isLoading.set(true);
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CategoryItem[] = data.map((b: any) => ({
            id: b.id,
            name: b.name,
            icon: b.icon || 'fa-solid fa-tag',
            imgUrl: b.imgUrl || '',
            displayOrder: b.displayOrder,
            isActive: b.isActive !== false
          }));
          this.brands.set(mapped);
          this.persist(mapped);
        }
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to local cache when backend server is waiting for connection
        this.isLoading.set(false);
      }
    });
  }

  addBrand(name: string, icon?: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;

    // Check duplicate locally
    if (this.brands().some(b => b.name.toLowerCase() === trimmed.toLowerCase())) {
      return false;
    }

    const payload = {
      name: trimmed,
      icon: icon?.trim() || 'fa-solid fa-tag'
    };

    // Optimistic UI update
    const current = this.brands();
    const tempItem: CategoryItem = {
      id: Date.now(),
      name: trimmed,
      icon: payload.icon,
      imgUrl: ''
    };
    const updated = [...current, tempItem];
    this.brands.set(updated);
    this.persist(updated);

    // Persist in backend SQLite database
    this.http.post<CategoryItem>(this.apiUrl, payload).subscribe({
      next: () => this.refreshFromApi(),
      error: (err) => {
        console.warn('[BrandStore] SQLite DB sync:', err.message);
        this.refreshFromApi();
      }
    });

    return true;
  }

  updateBrand(brandOrIndex: CategoryItem | number, newName: string, newIcon?: string): boolean {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    const current = [...this.brands()];
    let brand: CategoryItem | undefined;
    let targetIndex = -1;

    if (typeof brandOrIndex === 'number') {
      targetIndex = brandOrIndex;
      brand = current[targetIndex];
    } else {
      brand = brandOrIndex;
      targetIndex = current.findIndex(b => (b.id && brand?.id && b.id === brand.id) || b.name === brand?.name);
    }

    if (!brand || targetIndex === -1) return false;

    const brandId = brand.id || (targetIndex + 1);
    const payload = {
      name: trimmed,
      icon: newIcon?.trim() || brand.icon || 'fa-solid fa-tag'
    };

    // Optimistic update
    current[targetIndex] = { ...brand, ...payload };
    this.brands.set(current);
    this.persist(current);

    // Save to SQLite backend
    this.http.put(`${this.apiUrl}/${brandId}`, payload).subscribe({
      next: () => this.refreshFromApi(),
      error: (err) => {
        console.warn('[BrandStore] SQLite DB update failed:', err.message);
        this.refreshFromApi();
      }
    });

    return true;
  }

  deleteBrand(brandOrIndex: CategoryItem | number): boolean {
    const current = [...this.brands()];
    let brand: CategoryItem | undefined;
    let targetIndex = -1;

    if (typeof brandOrIndex === 'number') {
      targetIndex = brandOrIndex;
      brand = current[targetIndex];
    } else {
      brand = brandOrIndex;
      targetIndex = current.findIndex(b => (b.id && brand?.id && b.id === brand.id) || b.name === brand?.name);
    }

    if (!brand || targetIndex === -1) return false;

    const brandId = brand.id || (targetIndex + 1);

    // Optimistic remove
    current.splice(targetIndex, 1);
    this.brands.set(current);
    this.persist(current);

    // Delete in SQLite database
    this.http.delete(`${this.apiUrl}/${brandId}`).subscribe({
      next: () => this.refreshFromApi(),
      error: (err) => {
        console.warn('[BrandStore] SQLite DB delete failed:', err.message);
        this.refreshFromApi();
      }
    });

    return true;
  }

  resetDefaults(): void {
    this.brands.set([...DEFAULT_BRANDS]);
    this.persist(DEFAULT_BRANDS);

    // Call SQLite backend reset
    this.http.post(`${this.apiUrl}/reset-defaults`, {}).subscribe({
      next: () => this.refreshFromApi(),
      error: (err) => console.warn('[BrandStore] SQLite DB reset error:', err.message)
    });
  }

  moveBrandUp(index: number): boolean {
    if (index <= 0) return false;
    const current = [...this.brands()];
    const temp = current[index];
    current[index] = current[index - 1];
    current[index - 1] = temp;
    this.saveNewOrder(current);
    return true;
  }

  moveBrandDown(index: number): boolean {
    const current = [...this.brands()];
    if (index < 0 || index >= current.length - 1) return false;
    const temp = current[index];
    current[index] = current[index + 1];
    current[index + 1] = temp;
    this.saveNewOrder(current);
    return true;
  }

  setBrandPosition(currentIndex: number, newPosition1Based: number): boolean {
    const current = [...this.brands()];
    if (currentIndex < 0 || currentIndex >= current.length) return false;
    let targetIndex = newPosition1Based - 1;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= current.length) targetIndex = current.length - 1;
    if (targetIndex === currentIndex) return true;

    const [moved] = current.splice(currentIndex, 1);
    current.splice(targetIndex, 0, moved);
    this.saveNewOrder(current);
    return true;
  }

  private saveNewOrder(items: CategoryItem[]): void {
    const updated = items.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    this.brands.set(updated);
    this.persist(updated);

    const brandIds = updated.map(b => b.id).filter((id): id is number => id !== undefined);
    if (brandIds.length > 0) {
      this.http.post<any[]>(`${this.apiUrl}/reorder`, { brandIds }).subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: CategoryItem[] = data.map((b: any) => ({
              id: b.id,
              name: b.name,
              icon: b.icon || 'fa-solid fa-tag',
              imgUrl: b.imgUrl || '',
              displayOrder: b.displayOrder,
              isActive: b.isActive !== false
            }));
            this.brands.set(mapped);
            this.persist(mapped);
          }
        },
        error: (err) => console.warn('[BrandStore] Reorder failed:', err.message)
      });
    }
  }
}
