import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { CartItem } from '../../models/dessert.model';

@Component({
  selector: 'app-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummary {
  readonly items = input<CartItem[]>([]);
  readonly subtotal = input(0);

  readonly remove = output<string>();
  readonly confirmOrder = output<void>();

  protected readonly totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  protected onRemove(dessertId: string): void {
    this.remove.emit(dessertId);
  }

  protected onConfirm(): void {
    this.confirmOrder.emit();
  }
}
