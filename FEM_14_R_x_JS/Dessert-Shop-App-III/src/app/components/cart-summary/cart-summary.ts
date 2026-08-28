import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { CartItem } from '../../models/dessert.model';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummary {
  protected readonly utility = inject(UtilityService);

  readonly items = input<CartItem[]>([]);
  readonly subtotal = input(0);

  readonly remove = output<string>();
  readonly confirmOrder = output<void>();

  protected readonly totalQuantity = computed(() => this.utility.totalQuantity(this.items()));

  protected onRemove(dessertId: string): void {
    this.remove.emit(dessertId);
  }

  protected onConfirm(): void {
    this.confirmOrder.emit();
  }
}
