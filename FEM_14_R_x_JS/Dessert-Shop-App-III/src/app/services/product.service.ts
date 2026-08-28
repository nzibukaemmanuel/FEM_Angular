import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, delay, map, of, retry, tap, timer } from 'rxjs';
import { DESSERTS } from '../data/desserts';
import { Dessert, DessertCategory } from '../models/dessert.model';

const CATEGORIES: DessertCategory[] = ['All', 'Cakes', 'Pastries', 'Tarts', 'Cookies'];
const SIMULATED_FETCH_DELAY_MS = 200;
const SIMULATED_API_DELAY_MS = 500;

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

  // Lets a component deliberately trigger the failure branch of fetchByCategory$ below — a real network flake
  // can't be scheduled on demand, so this stands in for one to demo/verify error handling.
  private readonly _simulateFailure$ = new BehaviorSubject(false);
  readonly simulateFailure$: Observable<boolean> = this._simulateFailure$.asObservable();

  setSimulateFailure(shouldFail: boolean): void {
    this._simulateFailure$.next(shouldFail);
  }

  // Simulates a category-scoped catalogue request (e.g. a filtered/paginated API call) with network latency,
  // so callers can switchMap on it and see a stale in-flight "fetch" get cancelled by a newer category selection.
  // Errors like a real failed request would (map's project function throwing turns into an error notification),
  // rather than resolving to an empty/invalid value — so callers must handle it explicitly (see catchError usage).
  fetchByCategory$(category: DessertCategory): Observable<Dessert[]> {
    return timer(SIMULATED_FETCH_DELAY_MS).pipe(
      map(() => {
        if (this._simulateFailure$.value) {
          throw new Error(`Failed to load "${category}" desserts. Please check your connection and try again.`);
        }
        return this.filterByCategory(this._products$.value, category);
      }),
    );
  }

  // Bonus: models fetching the catalogue from a remote API — of() stands in for the response payload and
  // delay() for network latency. Shares the same simulateFailure flag as fetchByCategory$ above, so "the
  // network is down" consistently affects every simulated call; retry(1) gives it one automatic second
  // attempt before catchError falls back to whatever the app already has, rather than losing the catalogue.
  refreshFromApi$(): Observable<Dessert[]> {
    return of(DESSERTS).pipe(
      delay(SIMULATED_API_DELAY_MS),
      map((products) => {
        if (this._simulateFailure$.value) {
          throw new Error('Failed to refresh the menu from the server.');
        }
        return products;
      }),
      retry(1),
      catchError(() => of(this._products$.value)),
      tap((products) => this._products$.next(products)),
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
