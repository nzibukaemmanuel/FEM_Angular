import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CartItem, Dessert, DessertCategory } from '../../models/dessert.model';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
  private readonly productService = inject(ProductService);

  readonly cartItems = input<CartItem[]>([]);

  readonly add = output<Dessert>();
  readonly increment = output<string>();
  readonly decrement = output<string>();

  protected readonly categories = this.productService.categories;
  protected readonly activeCategory = signal<DessertCategory>('All');
  protected readonly sortDirection = signal<'asc' | 'desc' | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly desserts = computed(() => {
    const byCategory = this.productService.filterByCategory(this.activeCategory());
    const bySearch = this.productService.searchByName(byCategory, this.searchQuery());
    const direction = this.sortDirection();
    return direction ? this.productService.sortByPrice(bySearch, direction) : bySearch;
  });

  private readonly quantities = computed(() => {
    const map = new Map<string, number>();
    for (const item of this.cartItems()) {
      map.set(item.dessert.id, item.quantity);
    }
    return map;
  });

  protected quantityOf(dessertId: string): number {
    return this.quantities().get(dessertId) ?? 0;
  }

  protected selectCategory(category: DessertCategory): void {
    this.activeCategory.set(category);
  }

  protected onSortChange(value: string): void {
    this.sortDirection.set(value === 'asc' || value === 'desc' ? value : null);
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}
