import { AsyncPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { CartItem, Dessert, DessertCategory } from '../../models/dessert.model';
import { LoggingService } from '../../services/logging.service';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../product-card/product-card';

type SortOption = { value: 'asc' | 'desc' | ''; label: string };
type DessertWithQuantity = { dessert: Dessert; quantity: number };

const SORT_OPTIONS: SortOption[] = [
  { value: '', label: 'Default' },
  { value: 'asc', label: 'Low to High' },
  { value: 'desc', label: 'High to Low' },
];

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard, AsyncPipe],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid implements OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly logger = inject(LoggingService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Completed in ngOnDestroy to unsubscribe the manual (non-async-pipe) subscriptions below via takeUntil.
  private readonly destroy$ = new Subject<void>();

  // A Subscription object, torn down explicitly in ngOnDestroy — the third cleanup style, alongside
  // takeUntil(destroy$) and the template's async pipe used elsewhere in this component.
  private readonly catalogueLoadedSubscription: Subscription;

  readonly cartItems = input<CartItem[]>([]);

  readonly add = output<Dessert>();
  readonly increment = output<string>();
  readonly decrement = output<string>();

  protected readonly categories = this.productService.categories;
  protected readonly activeCategory = signal<DessertCategory>('All');
  protected readonly sortDirection = signal<'asc' | 'desc' | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly minPrice = signal(0);
  protected readonly maxPrice = signal(15);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly sortOpen = signal(false);
  protected readonly sortLabel = computed(
    () => this.sortOptions.find((option) => option.value === (this.sortDirection() ?? ''))?.label ?? 'Default',
  );

  // Surfaced in the template as a dismissible-by-retry banner; cleared on the next successful fetch.
  protected readonly loadError = signal<string | null>(null);

  // Bonus: tracks the in-flight state of the simulated "refresh from API" call below, for a loading indicator.
  protected readonly refreshing = signal(false);

  // The most recent successfully loaded category list, used as the fallback when a fetch fails — so a
  // transient error degrades the grid to "possibly stale" rather than to "empty."
  private lastGoodCategoryProducts: Dessert[] = [];

  // Re-fetches (simulated) whenever the category changes; switchMap cancels a still-in-flight fetch for a
  // stale category the moment a newer one is selected, so an old response can never overwrite a new one.
  // catchError lives inside the switchMap projection so one failed fetch only affects that emission — the
  // outer stream stays alive and keeps reacting to further category changes instead of terminating.
  private readonly categoryProducts$: Observable<Dessert[]> = toObservable(this.activeCategory).pipe(
    switchMap((category) =>
      this.productService.fetchByCategory$(category).pipe(
        tap((products) => {
          this.lastGoodCategoryProducts = products;
          this.loadError.set(null);
        }),
        catchError((error: Error) => {
          this.logger.error('Failed to load desserts', { message: error.message });
          this.loadError.set(`${error.message} Showing the last loaded items instead.`);
          return of(this.lastGoodCategoryProducts);
        }),
      ),
    ),
  );

  // Waits for a pause in typing before filtering, and skips re-filtering when the value hasn't actually
  // changed (e.g. a keystroke that resolves to the same trimmed text, or focus/blur re-emitting the signal).
  private readonly debouncedSearch$: Observable<string> = toObservable(this.searchQuery).pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );

  // Combines the category-scoped fetch with the remaining (signal-backed) filter controls; any change to
  // any source re-runs the pipeline and pushes a new list to the template via the async pipe.
  protected readonly desserts$: Observable<Dessert[]> = combineLatest([
    this.categoryProducts$,
    this.debouncedSearch$,
    toObservable(this.sortDirection),
    toObservable(this.minPrice),
    toObservable(this.maxPrice),
  ]).pipe(
    filter(([, , , min, max]) => min <= max), // ignore a momentarily-inverted range instead of showing an empty grid
    map(([byCategory, query, direction, min, max]) => {
      const byPrice = this.productService.filterByPriceRange(byCategory, min, max);
      const bySearch = this.productService.searchByName(byPrice, query);
      return direction ? this.productService.sortByPrice(bySearch, direction) : bySearch;
    }),
  );

  // Synchronizes two independent sources — the filtered product list and the cart — into one view model,
  // so adding/removing/adjusting an item in the cart re-emits here and the grid's quantity badges update
  // automatically, with no manual change-detection call.
  protected readonly dessertsWithQuantity$: Observable<DessertWithQuantity[]> = combineLatest([
    this.desserts$,
    toObservable(this.cartItems),
  ]).pipe(
    map(([desserts, cartItems]) => {
      const quantityById = new Map(cartItems.map((item) => [item.dessert.id, item.quantity]));
      return desserts.map((dessert) => ({ dessert, quantity: quantityById.get(dessert.id) ?? 0 }));
    }),
  );

  constructor() {
    // take(1): log the catalogue exactly once on load, even though products$ is a long-lived BehaviorSubject
    // that could keep emitting — the subscription completes itself after the first value. Still stored and
    // unsubscribed explicitly in ngOnDestroy, so cleanup never depends on the source completing on its own.
    this.catalogueLoadedSubscription = this.productService.products$.pipe(take(1)).subscribe((products) =>
      this.logger.info('Catalogue loaded', { count: products.length }),
    );

    // A manual subscription (not an async pipe) for a pure side effect — takeUntil(destroy$) is what stops
    // it from outliving the component.
    toObservable(this.activeCategory)
      .pipe(
        tap((category) => this.logger.info('Category selected', { category })),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.catalogueLoadedSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSimulateFailureChange(shouldFail: boolean): void {
    this.productService.setSimulateFailure(shouldFail);
  }

  // Bonus: triggers the simulated API call. Its own retry/catchError already guarantee it never errors out
  // to this subscriber, so a single next-callback is enough to know the (possibly-retried, possibly-fallen-
  // back) result has landed and _products$ has been updated.
  protected refreshCatalogue(): void {
    this.refreshing.set(true);
    this.productService.refreshFromApi$().subscribe(() => this.refreshing.set(false));
  }

  protected onMinPriceChange(value: number): void {
    this.minPrice.set(Number.isFinite(value) ? value : 0);
  }

  protected onMaxPriceChange(value: number): void {
    this.maxPrice.set(Number.isFinite(value) ? value : 0);
  }

  protected selectCategory(category: DessertCategory): void {
    this.activeCategory.set(category);
  }

  protected toggleSort(): void {
    this.sortOpen.update((open) => !open);
  }

  protected selectSort(value: SortOption['value']): void {
    this.sortDirection.set(value === 'asc' || value === 'desc' ? value : null);
    this.sortOpen.set(false);
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.sortOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.sortOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.sortOpen.set(false);
  }
}
