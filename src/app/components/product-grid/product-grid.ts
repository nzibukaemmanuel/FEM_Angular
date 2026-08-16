import { Component, computed, signal } from '@angular/core';
import { DESSERTS } from '../../data/desserts';
import { DessertCategory } from '../../models/dessert.model';
import { ProductCard } from '../product-card/product-card';

const CATEGORIES: DessertCategory[] = ['All', 'Cakes', 'Pastries', 'Tarts', 'Cookies'];

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid {
  protected readonly categories = CATEGORIES;
  protected readonly activeCategory = signal<DessertCategory>('All');

  protected readonly desserts = computed(() => {
    const category = this.activeCategory();
    return category === 'All' ? DESSERTS : DESSERTS.filter((d) => d.category === category);
  });

  protected selectCategory(category: DessertCategory): void {
    this.activeCategory.set(category);
  }
}
