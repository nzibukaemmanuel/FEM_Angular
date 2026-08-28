import { Injectable } from '@angular/core';
import { CartItem } from '../models/dessert.model';

// General-purpose helpers with no state of their own — safe to share as a root singleton.
@Injectable({ providedIn: 'root' })
export class UtilityService {
  lineTotal(item: CartItem): number {
    return item.quantity * item.dessert.price;
  }

  totalQuantity(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  subtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + this.lineTotal(item), 0);
  }

  formatCurrency(value: number, currencyCode = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
  }
}
