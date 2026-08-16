# Maison Sucrée — Dessert Shop App

A boutique bakery storefront built with Angular as part of the **Angular Fundamentals: Dessert Shop App** lab. Browse desserts by category, add them to a cart, adjust quantities, and confirm an order — all driven by Angular signals, standalone components, and modern control-flow directives.

## Features

- **Product catalogue** — dessert cards with name, description, price, and image rendered from a static data set (`src/app/data/desserts.ts`).
- **Category filtering** — `@for`/`@if` control flow renders the menu, with an empty-state message when a category has no items.
- **Cart management** — add, increment/decrement, or remove items; the running subtotal and item count update live everywhere they're shown (header badge, cart panel, order confirmation).
- **Order confirmation modal** — reviews the order and lets the shopper start a new one, clearing the cart.
- **"Added to cart" toast** — a brief confirmation appears whenever an item is added.
- **In-cart highlighting** — product cards outline themselves while they have a quantity in the cart.
- **Currency formatting** — prices are rendered with Angular's `CurrencyPipe`.
- **Responsive layout** — the storefront adapts down to mobile widths.

## Architecture

| Component | Responsibility |
|---|---|
| `Header` | Site nav and cart-quantity badge |
| `Hero` | Landing banner |
| `ProductGrid` | Category filters + dessert list (`@for` / `@empty`) |
| `ProductCard` | Single dessert: details, add/stepper controls |
| `CartSummary` | Live cart contents, subtotal, remove/confirm actions |
| `OrderModal` | Post-confirmation summary + "start new order" |
| `Toast` | Transient "item added" notification |
| `Footer` | Site footer |

Cart state lives in an injectable `CartService` (`src/app/services/cart.service.ts`), built on Angular signals — but only the root `App` component injects it. `App` is the single parent that owns the shared data and passes it down to every child via `@Input` (`items`, `subtotal`, `totalQuantity`, `orderConfirmed`, `quantity`, `cartItems`); children never read the service directly. User actions bubble back up the same tree via `@Output` (`add`, `increment`, `decrement`, `remove`, `confirmOrder`, `startNewOrder`), and `App` applies them to the service. So `ProductCard` emits `add` → `ProductGrid` re-emits it → `App` calls `cart.add()` → the update flows back down through `items`/`cartItems` to `CartSummary`, `Header`, and every `ProductCard` at once.

## Getting started

```bash
npm install
npm start
```

Then open `http://localhost:4200/`. The app reloads automatically on source changes.

## Testing

```bash
npm test
```

Runs the unit test suite with Vitest.

## Building for production

```bash
npm run build
```

Outputs a static production build to `dist/Dessert_Shop/browser`.

## Deployment

This is a plain client-rendered Angular app (no server-side rendering), so it deploys as a static site.

**Netlify** — `netlify.toml` is already configured (build command `npm run build`, publish directory `dist/Dessert_Shop/browser`, with an SPA fallback redirect). Connect the repo in Netlify and it picks this up automatically.

Live app: _add your deployed URL here once published_

## Tech stack

Angular 22 (standalone components, signals, `@for`/`@if` control flow), TypeScript, Vitest.
