import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CartItem, Dessert } from '../models/dessert.model';
import { LoggingService } from './logging.service';
import { StorageService } from './storage.service';
import { UtilityService } from './utility.service';

const CART_STORAGE_KEY = 'dessert-shop:cart';

@Injectable({ providedIn: 'root' })//create exactly one instance of this service for the whole app and inject it into any component that needs it.
export class CartService {
  private readonly logger = inject(LoggingService);
  private readonly storage = inject(StorageService);
  private readonly utility = inject(UtilityService);

  private readonly _items = signal<CartItem[]>(this.storage.get<CartItem[]>(CART_STORAGE_KEY, []));
  private readonly _orderConfirmed = signal(false);
  private readonly _toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly items = this._items.asReadonly();
  readonly orderConfirmed = this._orderConfirmed.asReadonly();
  readonly toast = this._toast.asReadonly();

  readonly totalQuantity = computed(() => this.utility.totalQuantity(this._items()));

  readonly subtotal = computed(() => this.utility.subtotal(this._items()));

  constructor() {
    // Keep the cart in localStorage in sync with every change, so a refresh doesn't lose it.
    effect(() => this.storage.set(CART_STORAGE_KEY, this._items()));
  }

  quantityOf(dessertId: string): number {
    return this._items().find((item) => item.dessert.id === dessertId)?.quantity ?? 0;
  }

  add(dessert: Dessert): void {
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
