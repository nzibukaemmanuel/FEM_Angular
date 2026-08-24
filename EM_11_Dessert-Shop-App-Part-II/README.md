# Maison Sucrée — Dessert Shop App (Part II: Services & DI)

A boutique bakery storefront built with Angular, extended in **Part II** to introduce Angular services and Dependency Injection. Browse desserts by category, add them to a cart, adjust quantities, and confirm an order — all driven by Angular signals, standalone components, modern control-flow directives, and a set of injectable services that own the app's shared logic and state.

## Features

- **Product catalogue** — dessert cards with name, description, price, and image, served through `ProductService` from a static data set (`src/app/data/desserts.ts`).
- **Category filtering** — `@for`/`@if` control flow renders the menu, with an empty-state message when a category has no items.
- **Cart management** — add, increment/decrement, or remove items; the running subtotal and item count update live everywhere they're shown (header badge, cart panel, order confirmation).
- **Cart persistence** — the cart is saved to `localStorage` on every change and restored on load; starting a new order clears the stored cart too.
- **Order confirmation modal** — reviews the order and lets the shopper start a new one, clearing the cart.
- **"Added to cart" toast** — a brief confirmation appears whenever an item is added.
- **In-cart highlighting** — product cards outline themselves while they have a quantity in the cart.
- **Currency formatting** — prices are rendered with Angular's `CurrencyPipe`; totals are calculated by `UtilityService`.
- **Activity logging** — cart actions (add, remove, confirm, empty-order attempts) are recorded through `LoggingService`.
- **Responsive layout** — the storefront adapts down to mobile widths.

## Architecture

| Component | Responsibility |
|---|---|
| `Header` | Site nav and cart-quantity badge |
| `Hero` | Landing banner |
| `ProductGrid` | Category filters + dessert list (`@for` / `@empty`), backed by `ProductService` |
| `ProductCard` | Single dessert: details, add/stepper controls |
| `CartSummary` | Live cart contents, subtotal, remove/confirm actions |
| `OrderModal` | Post-confirmation summary + "start new order" |
| `Toast` | Transient "item added" notification |
| `Footer` | Site footer |

### Services & Dependency Injection

| Service | Responsibility | Scope |
|---|---|---|
| `CartService` | Owns cart state (items, order-confirmed flag, toast message) as signals; add/increment/decrement/remove/confirm/reset | `providedIn: 'root'` — one instance app-wide |
| `ProductService` | Reads the dessert catalogue; filter by category, look up by id, sort by price | `providedIn: 'root'` |
| `UtilityService` | Stateless helpers: line totals, cart subtotal/quantity, currency formatting | `providedIn: 'root'` |
| `LoggingService` | Timestamped `info`/`warn`/`error` logging for cart activity | `providedIn: 'root'` |
| `StorageService` | Thin, failure-safe `localStorage` wrapper (`get`/`set`/`remove`) used by `CartService` for cart persistence | `providedIn: 'root'` |

All five services use `@Injectable({ providedIn: 'root' })`, so Angular's root `EnvironmentInjector` lazily creates a single shared instance the first time any component or service injects them, and every subsequent `inject()` call anywhere in the tree returns that same instance — a singleton. Angular also supports providing a service at the component level (in a `@Component({ providers: [...] })` array), which creates a **new instance per component instance** instead of a shared one; none of these services need that here since cart/product/logging state is meant to be shared, not duplicated per component.

`CartService` composes the other services rather than each component reaching for them separately: it injects `UtilityService` for its `totalQuantity`/`subtotal` computed signals, `StorageService` to persist and restore cart items, and `LoggingService` to record actions. Components inject only what they directly need — `ProductGrid` injects `ProductService`, `CartSummary`/`OrderModal` inject `UtilityService` for per-line totals, and the root `App` component injects `CartService` and passes its state down to every child via `@Input` (`items`, `subtotal`, `totalQuantity`, `orderConfirmed`, `quantity`, `cartItems`). User actions bubble back up the same tree via `@Output` (`add`, `increment`, `decrement`, `remove`, `confirmOrder`, `startNewOrder`), and `App` applies them to `CartService`. So `ProductCard` emits `add` → `ProductGrid` re-emits it → `App` calls `cart.add()` → the update flows back down through `items`/`cartItems` to `CartSummary`, `Header`, and every `ProductCard` at once.

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
