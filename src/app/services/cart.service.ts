import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Dessert } from '../models/dessert.model';

@Injectable({ providedIn: 'root' })//create exactly one instance of this service for the whole app and inject it into any component that needs it.
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  private readonly _orderConfirmed = signal(false);
  private readonly _toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly items = this._items.asReadonly();
  readonly orderConfirmed = this._orderConfirmed.asReadonly();
  readonly toast = this._toast.asReadonly();

  readonly totalQuantity = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity * item.dessert.price, 0),
  );

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
  }

  confirmOrder(): void {
    if (this._items().length === 0) {
      return;
    }
    this._orderConfirmed.set(true);
  }

  startNewOrder(): void {
    this._items.set([]);
    this._orderConfirmed.set(false);
  }
}
