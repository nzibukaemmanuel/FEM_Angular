import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Dessert } from '../../models/dessert.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  private readonly cart = inject(CartService);

  readonly dessert = input.required<Dessert>();

  protected readonly quantity = computed(() => this.cart.quantityOf(this.dessert().id));

  protected add(): void {
    this.cart.add(this.dessert());
  }

  protected increment(): void {
    this.cart.increment(this.dessert().id);
  }

  protected decrement(): void {
    this.cart.decrement(this.dessert().id);
  }
}
