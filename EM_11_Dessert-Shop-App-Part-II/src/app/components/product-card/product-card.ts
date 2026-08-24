import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Dessert } from '../../models/dessert.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly dessert = input.required<Dessert>();
  readonly quantity = input(0);

  readonly add = output<Dessert>();
  readonly increment = output<string>();
  readonly decrement = output<string>();

  protected onAdd(): void {
    this.add.emit(this.dessert());
  }

  protected onIncrement(): void {
    this.increment.emit(this.dessert().id);
  }

  protected onDecrement(): void {
    this.decrement.emit(this.dessert().id);
  }
}
