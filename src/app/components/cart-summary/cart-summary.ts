import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummary {
  protected readonly cart = inject(CartService);

  protected remove(dessertId: string): void {
    this.cart.remove(dessertId);
  }

  protected confirmOrder(): void {
    this.cart.confirmOrder();
  }
}
