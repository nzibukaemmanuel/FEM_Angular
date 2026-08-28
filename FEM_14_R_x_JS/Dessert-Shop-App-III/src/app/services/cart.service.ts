import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, withLatestFrom } from 'rxjs';
import { CartItem, Dessert } from '../models/dessert.model';
import { LoggingService } from './logging.service';
import { ProductService } from './product.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';

const CART_STORAGE_KEY = 'dessert-shop:cart';

@Injectable({ providedIn: 'root' })//create exactly one instance of this service for the whole app and inject it into any component that needs it.
export class CartService {
  private readonly logger = inject(LoggingService);
  private readonly storage = inject(StorageService);
  private readonly utility = inject(UtilityService);
  private readonly products = inject(ProductService);

  // BehaviorSubjects are the cart's single source of truth: every subscriber — new or existing — always sees
  // the current state immediately (no waiting for the next add/remove), and every mutation below calls
  // `.next()` on one of these, which is what makes the header badge, cart panel, and totals update in lockstep.
  private readonly _items$ = new BehaviorSubject<CartItem[]>(this.storage.get<CartItem[]>(CART_STORAGE_KEY, []));
  private readonly _orderConfirmed$ = new BehaviorSubject(false);
  private readonly _toast$ = new BehaviorSubject<string | null>(null);
  private readonly _addRequests$ = new Subject<Dessert>();
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly items$: Observable<CartItem[]> = this._items$.asObservable();
  readonly orderConfirmed$: Observable<boolean> = this._orderConfirmed$.asObservable();
  readonly toast$: Observable<string | null> = this._toast$.asObservable();

  // Derived directly from items$, so the displayed count and price stay in sync with the cart with no
  // extra bookkeeping — any add/remove/clear that updates _items$ automatically recomputes both.
  readonly totalQuantity$: Observable<number> = this.items$.pipe(map((items) => this.utility.totalQuantity(items)));
  readonly subtotal$: Observable<number> = this.items$.pipe(map((items) => this.utility.subtotal(items)));

  constructor() {
    // Keep the cart in localStorage in sync with every change, so a refresh doesn't lose it.
    // BehaviorSubject.subscribe() replays the current value immediately, so this also does the initial write.
    this._items$.subscribe((items) => this.storage.set(CART_STORAGE_KEY, items));

    // withLatestFrom pairs each add request with the catalogue's current value at that moment, so the cart
    // always stores the canonical product record (e.g. an up-to-date price) rather than a stale reference
    // the calling component happened to be holding onto.
    this._addRequests$
      .pipe(withLatestFrom(this.products.products$))
      .subscribe(([dessert, products]) => this.performAdd(products.find((p) => p.id === dessert.id) ?? dessert));
  }

  quantityOf(dessertId: string): number {
    return this._items$.value.find((item) => item.dessert.id === dessertId)?.quantity ?? 0;
  }

  add(dessert: Dessert): void {
    this._addRequests$.next(dessert);
  }

  private performAdd(dessert: Dessert): void {
    this.updateItems((items) => {
      const existing = items.find((item) => item.dessert.id === dessert.id);
      if (existing) {
        return items.map((item) =>
          item.dessert.id === dessert.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...items, { dessert, quantity: 1 }];
    });
    this.logger.info('Item added to cart', { dessertId: dessert.id });
    this.showToast(`${dessert.name} added to cart`);
  }

  private showToast(message: string): void {
    clearTimeout(this.toastTimer);
    this._toast$.next(message);
    this.toastTimer = setTimeout(() => this._toast$.next(null), 2500);
  }

  increment(dessertId: string): void {
    this.updateItems((items) =>
      items.map((item) =>
        item.dessert.id === dessertId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  decrement(dessertId: string): void {
    this.updateItems((items) =>
      items
        .map((item) =>
          item.dessert.id === dessertId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  remove(dessertId: string): void {
    this.updateItems((items) => items.filter((item) => item.dessert.id !== dessertId));
    this.logger.info('Item removed from cart', { dessertId });
  }

  confirmOrder(): void {
    const items = this._items$.value;
    if (items.length === 0) {
      this.logger.warn('Attempted to confirm an empty order');
      return;
    }
    this._orderConfirmed$.next(true);
    this.logger.info('Order confirmed', {
      itemCount: this.utility.totalQuantity(items),
      subtotal: this.utility.subtotal(items),
    });
  }

  startNewOrder(): void {
    this._items$.next([]);
    this._orderConfirmed$.next(false);
    this.storage.remove(CART_STORAGE_KEY);
    this.logger.info('Cart cleared for new order');
  }

  private updateItems(updater: (items: CartItem[]) => CartItem[]): void {
    this._items$.next(updater(this._items$.value));
  }
}
