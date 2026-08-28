import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, timer } from 'rxjs';
import { DESSERTS } from '../data/desserts';
import { Dessert, DessertCategory } from '../models/dessert.model';

const CATEGORIES: DessertCategory[] = ['All', 'Cakes', 'Pastries', 'Tarts', 'Cookies'];
const SIMULATED_FETCH_DELAY_MS = 200;

// Registered with providedIn: 'root', so Angular creates one shared instance for the whole app.
@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly categories = CATEGORIES;

  // BehaviorSubject seeds subscribers with the current catalogue immediately, then replays future updates —
  // stands in for a real backend stream (e.g. an HTTP-polled or websocket-fed catalogue) without changing callers.
  private readonly _products$ = new BehaviorSubject<Dessert[]>(DESSERTS);
  readonly products$: Observable<Dessert[]> = this._products$.asObservable();

  findById$(dessertId: string): Observable<Dessert | undefined> {
    return this.products$.pipe(map((products) => products.find((dessert) => dessert.id === dessertId)));
  }

  // Simulates a category-scoped catalogue request (e.g. a filtered/paginated API call) with network latency,
  // so callers can switchMap on it and see a stale in-flight "fetch" get cancelled by a newer category selection.
  fetchByCategory$(category: DessertCategory): Observable<Dessert[]> {
    return timer(SIMULATED_FETCH_DELAY_MS).pipe(
      map(() => this.filterByCategory(this._products$.value, category)),
    );
  }

  filterByCategory(desserts: Dessert[], category: DessertCategory): Dessert[] {
    return category === 'All' ? desserts : desserts.filter((dessert) => dessert.category === category);
  }

  filterByPriceRange(desserts: Dessert[], min: number, max: number): Dessert[] {
    return desserts.filter((dessert) => dessert.price >= min && dessert.price <= max);
  }

  searchByName(desserts: Dessert[], query: string): Dessert[] {
    const term = query.trim().toLowerCase();
    return term ? desserts.filter((dessert) => dessert.name.toLowerCase().includes(term)) : desserts;
  }

  sortByPrice(desserts: Dessert[], direction: 'asc' | 'desc' = 'asc'): Dessert[] {
    const sign = direction === 'asc' ? 1 : -1;
    return [...desserts].sort((a, b) => sign * (a.price - b.price));
  }
}
