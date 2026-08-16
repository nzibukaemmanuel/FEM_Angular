import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSummary } from './components/cart-summary/cart-summary';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { OrderModal } from './components/order-modal/order-modal';
import { ProductGrid } from './components/product-grid/product-grid';
import { Toast } from './components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Hero, ProductGrid, CartSummary, OrderModal, Footer, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
