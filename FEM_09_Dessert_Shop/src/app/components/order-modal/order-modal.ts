import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CartItem } from '../../models/dessert.model';

@Component({
  selector: 'app-order-modal',
  imports: [CurrencyPipe],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.css',
})
export class OrderModal {
  readonly orderConfirmed = input(false);
  readonly items = input<CartItem[]>([]);
  readonly subtotal = input(0);

  readonly startNewOrder = output<void>();

  protected onStartNewOrder(): void {
    this.startNewOrder.emit();
  }
}
