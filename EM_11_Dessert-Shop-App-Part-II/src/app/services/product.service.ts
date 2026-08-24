import { Injectable } from '@angular/core';
import { DESSERTS } from '../data/desserts';
import { Dessert, DessertCategory } from '../models/dessert.model';

const CATEGORIES: DessertCategory[] = ['All', 'Cakes', 'Pastries', 'Tarts', 'Cookies'];

// Registered with providedIn: 'root', so Angular creates one shared instance for the whole app.
@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly categories = CATEGORIES;

  getAll(): Dessert[] {
    return DESSERTS;
  }

  findById(dessertId: string): Dessert | undefined {
    return DESSERTS.find((dessert) => dessert.id === dessertId);
  }

  filterByCategory(category: DessertCategory): Dessert[] {
    return category === 'All' ? DESSERTS : DESSERTS.filter((dessert) => dessert.category === category);
  }

  sortByPrice(desserts: Dessert[], direction: 'asc' | 'desc' = 'asc'): Dessert[] {
    const sign = direction === 'asc' ? 1 : -1;
    return [...desserts].sort((a, b) => sign * (a.price - b.price));
  }
}
