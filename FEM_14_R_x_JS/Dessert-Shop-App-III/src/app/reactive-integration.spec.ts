import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';

function textOf(el: Element): string {
  return el.textContent?.trim() ?? '';
}

function findByText(elements: Element[], text: string): HTMLElement {
  const match = elements.find((el) => textOf(el) === text);
  if (!match) {
    throw new Error(`No element found with text "${text}"`);
  }
  return match as HTMLElement;
}

function setInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('Task 9: reactive behavior validation', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    localStorage.clear();
    consoleErrorSpy = vi.spyOn(console, 'error');
    consoleWarnSpy = vi.spyOn(console, 'warn');
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('the product list reacts to category, search, and price-range changes, and settles correctly', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(App);
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      const cardCount = () => fixture.nativeElement.querySelectorAll('app-product-card').length;
      const filterButtons = () => Array.from(fixture.nativeElement.querySelectorAll('.filter')) as HTMLElement[];

      const totalCount = cardCount();
      expect(totalCount).toBeGreaterThan(0);

      // category filter narrows the grid
      findByText(filterButtons(), 'Cookies').click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();
      const cookiesCount = cardCount();
      expect(cookiesCount).toBeGreaterThan(0);
      expect(cookiesCount).toBeLessThan(totalCount);

      // debounced search narrows further, and settles on the exact match once typing pauses
      const searchInput = fixture.nativeElement.querySelector('#search-input') as HTMLInputElement;
      setInputValue(searchInput, 'chocolate chip');
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();
      expect(cardCount()).toBe(1);

      // clearing search and switching back to "All" restores the full catalogue
      setInputValue(searchInput, '');
      findByText(filterButtons(), 'All').click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();
      expect(cardCount()).toBe(totalCount);

      // price range narrows the grid too, and an inverted range is safely ignored rather than emptying it
      const minInput = fixture.nativeElement.querySelector('#min-price') as HTMLInputElement;
      const maxInput = fixture.nativeElement.querySelector('#max-price') as HTMLInputElement;
      setInputValue(minInput, '0');
      setInputValue(maxInput, '4');
      fixture.detectChanges();
      const priceFilteredCount = cardCount();
      expect(priceFilteredCount).toBeGreaterThan(0);
      expect(priceFilteredCount).toBeLessThan(totalCount);

      setInputValue(minInput, '100'); // now min > max — an invalid range
      fixture.detectChanges();
      expect(cardCount()).toBe(priceFilteredCount); // grid stays on the last valid result, doesn't go blank
    } finally {
      vi.useRealTimers();
    }
  });

  it('the cart count and totals update immediately on add/remove/clear, with no manual refresh', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const cart = TestBed.inject(CartService);
    const productService = TestBed.inject(ProductService);
    const products = await new Promise<any[]>((resolve) => {
      const sub = productService.products$.subscribe(resolve);
      sub.unsubscribe();
    });
    const [first, second] = products;

    expect(fixture.nativeElement.querySelector('.badge')).toBeFalsy();

    cart.add(first);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(textOf(fixture.nativeElement.querySelector('.badge'))).toBe('1');

    cart.add(second);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(textOf(fixture.nativeElement.querySelector('.badge'))).toBe('2');

    cart.remove(first.id);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(textOf(fixture.nativeElement.querySelector('.badge'))).toBe('1');

    cart.startNewOrder();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.badge')).toBeFalsy();
  });

  it('combined streams (products + cart) stay synchronized while a category filter is active', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(App);
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      const cart = TestBed.inject(CartService);
      const productService = TestBed.inject(ProductService);
      const products = await new Promise<any[]>((resolve) => {
        const sub = productService.products$.subscribe(resolve);
        sub.unsubscribe();
      });
      const cookie = products.find((p) => p.category === 'Cookies');

      cart.add(cookie);
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();

      // filter down to the very category the cart item belongs to — the combined stream must still show it in-cart
      const cookiesBtn = Array.from(fixture.nativeElement.querySelectorAll('.filter')).find(
        (el: any) => textOf(el) === 'Cookies',
      ) as HTMLElement;
      cookiesBtn.click();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);
      fixture.detectChanges();

      const card = Array.from(fixture.nativeElement.querySelectorAll('app-product-card')).find((el: any) =>
        el.textContent.includes(cookie.name),
      );
      expect(card).toBeTruthy();
      // the header badge (from cart) and the grid (from products+filters) both reflect the same one item
      expect(textOf(fixture.nativeElement.querySelector('.badge'))).toBe('1');
    } finally {
      vi.useRealTimers();
    }
  });

  it('normal operation produces no console errors or warnings', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const cart = TestBed.inject(CartService);
    const productService = TestBed.inject(ProductService);
    const products = await new Promise<any[]>((resolve) => {
      const sub = productService.products$.subscribe(resolve);
      sub.unsubscribe();
    });

    cart.add(products[0]);
    cart.increment(products[0].id);
    cart.decrement(products[0].id);
    cart.remove(products[0].id);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.destroy(); // exercises all ngOnDestroy cleanup paths

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
