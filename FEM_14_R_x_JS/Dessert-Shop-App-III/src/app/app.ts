import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSummary } from './components/cart-summary/cart-summary';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { OrderModal } from './components/order-modal/order-modal';
import { ProductGrid } from './components/product-grid/product-grid';
import { Toast } from './components/toast/toast';
import { Dessert } from './models/dessert.model';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Hero, ProductGrid, CartSummary, OrderModal, Footer, Toast, AsyncPipe],
  templateUrl: './app.html',
})
export class App {
  private readonly cart = inject(CartService);

  // Consumed via the async pipe in the template, rather than read as signals, to demonstrate
  // components reacting to Observable streams exposed by CartService.
  protected readonly items$ = this.cart.items$;
  protected readonly totalQuantity$ = this.cart.totalQuantity$;
  protected readonly subtotal$ = this.cart.subtotal$;
  protected readonly orderConfirmed = this.cart.orderConfirmed;
  protected readonly toastMessage = this.cart.toast;

  protected addToCart(dessert: Dessert): void {
    this.cart.add(dessert);
  }

  protected incrementItem(dessertId: string): void {
    this.cart.increment(dessertId);
  }

  protected decrementItem(dessertId: string): void {
    this.cart.decrement(dessertId);
  }

  protected removeItem(dessertId: string): void {
    this.cart.remove(dessertId);
  }

  protected confirmOrder(): void {
    this.cart.confirmOrder();
  }

  protected startNewOrder(): void {
    this.cart.startNewOrder();
  }
}
