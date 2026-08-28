import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, map } from 'rxjs';
import { CartItem, Dessert, DessertCategory } from '../../models/dessert.model';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../product-card/product-card';

type SortOption = { value: 'asc' | 'desc' | ''; label: string };

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
export class ProductGrid {
  private readonly productService = inject(ProductService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly cartItems = input<CartItem[]>([]);

  readonly add = output<Dessert>();
  readonly increment = output<string>();
  readonly decrement = output<string>();

  protected readonly categories = this.productService.categories;
  protected readonly activeCategory = signal<DessertCategory>('All');
  protected readonly sortDirection = signal<'asc' | 'desc' | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly sortOpen = signal(false);
  protected readonly sortLabel = computed(
    () => this.sortOptions.find((option) => option.value === (this.sortDirection() ?? ''))?.label ?? 'Default',
  );

  // Combines the (Observable) product catalogue with the (signal-backed) filter controls into one stream;
  // any change to any of the four sources re-runs the pipeline and pushes a new list to the template.
  protected readonly desserts$: Observable<Dessert[]> = combineLatest([
    this.productService.products$,
    toObservable(this.activeCategory),
    toObservable(this.searchQuery),
    toObservable(this.sortDirection),
  ]).pipe(
    map(([products, category, query, direction]) => {
      const byCategory = this.productService.filterByCategory(products, category);
      const bySearch = this.productService.searchByName(byCategory, query);
      return direction ? this.productService.sortByPrice(bySearch, direction) : bySearch;
    }),
  );

  private readonly quantities = computed(() => {
    const quantityMap = new Map<string, number>();
    for (const item of this.cartItems()) {
      quantityMap.set(item.dessert.id, item.quantity);
    }
    return quantityMap;
  });

  protected quantityOf(dessertId: string): number {
    return this.quantities().get(dessertId) ?? 0;
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
