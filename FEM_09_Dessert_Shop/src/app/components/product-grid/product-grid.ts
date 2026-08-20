import { Component, computed, input, output, signal } from '@angular/core';
import { DESSERTS } from '../../data/desserts';
import { CartItem, Dessert, DessertCategory } from '../../models/dessert.model';
import { ProductCard } from '../product-card/product-card';

const CATEGORIES: DessertCategory[] = ['All', 'Cakes', 'Pastries', 'Tarts', 'Cookies'];

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
  readonly cartItems = input<CartItem[]>([]);

  readonly add = output<Dessert>();
  readonly increment = output<string>();
  readonly decrement = output<string>();

  protected readonly categories = CATEGORIES;
  protected readonly activeCategory = signal<DessertCategory>('All');

  protected readonly desserts = computed(() => {
    const category = this.activeCategory();
    return category === 'All' ? DESSERTS : DESSERTS.filter((d) => d.category === category);
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
}
