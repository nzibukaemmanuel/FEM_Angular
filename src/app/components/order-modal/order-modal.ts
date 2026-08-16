import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-order-modal',
  imports: [CurrencyPipe],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.css',
})
export class OrderModal {
  protected readonly cart = inject(CartService);

  protected startNewOrder(): void {
    this.cart.startNewOrder();
  }
}
