import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, Subject, withLatestFrom } from 'rxjs';
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

  private readonly _items = signal<CartItem[]>(this.storage.get<CartItem[]>(CART_STORAGE_KEY, []));
  private readonly _orderConfirmed = signal(false);
  private readonly _toast = signal<string | null>(null);
  private readonly _addRequests$ = new Subject<Dessert>();
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly items = this._items.asReadonly();
  readonly orderConfirmed = this._orderConfirmed.asReadonly();
  readonly toast = this._toast.asReadonly();

  readonly totalQuantity = computed(() => this.utility.totalQuantity(this._items()));

  readonly subtotal = computed(() => this.utility.subtotal(this._items()));

  // Observable views of the same state, for components that consume streams (async pipe) rather than signals.
  readonly items$: Observable<CartItem[]> = toObservable(this.items);
  readonly totalQuantity$: Observable<number> = toObservable(this.totalQuantity);
  readonly subtotal$: Observable<number> = toObservable(this.subtotal);

  constructor() {
    // Keep the cart in localStorage in sync with every change, so a refresh doesn't lose it.
    effect(() => this.storage.set(CART_STORAGE_KEY, this._items()));

    // withLatestFrom pairs each add request with the catalogue's current value at that moment, so the cart
    // always stores the canonical product record (e.g. an up-to-date price) rather than a stale reference
    // the calling component happened to be holding onto.
    this._addRequests$
      .pipe(withLatestFrom(this.products.products$))
      .subscribe(([dessert, products]) => this.performAdd(products.find((p) => p.id === dessert.id) ?? dessert));
  }

  quantityOf(dessertId: string): number {
    return this._items().find((item) => item.dessert.id === dessertId)?.quantity ?? 0;
  }

  add(dessert: Dessert): void {
    this._addRequests$.next(dessert);
  }

  private performAdd(dessert: Dessert): void {
    this._items.update((items) => {
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
    this._toast.set(message);
    this.toastTimer = setTimeout(() => this._toast.set(null), 2500);
  }

  increment(dessertId: string): void {
    this._items.update((items) =>
      items.map((item) =>
        item.dessert.id === dessertId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  decrement(dessertId: string): void {
    this._items.update((items) =>
      items
        .map((item) =>
          item.dessert.id === dessertId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  remove(dessertId: string): void {
    this._items.update((items) => items.filter((item) => item.dessert.id !== dessertId));
    this.logger.info('Item removed from cart', { dessertId });
  }

  confirmOrder(): void {
    if (this._items().length === 0) {
      this.logger.warn('Attempted to confirm an empty order');
      return;
    }
    this._orderConfirmed.set(true);
    this.logger.info('Order confirmed', {
      itemCount: this.totalQuantity(),
      subtotal: this.subtotal(),
    });
  }

  startNewOrder(): void {
    this._items.set([]);
    this._orderConfirmed.set(false);
    this.storage.remove(CART_STORAGE_KEY);
    this.logger.info('Cart cleared for new order');
  }
}
