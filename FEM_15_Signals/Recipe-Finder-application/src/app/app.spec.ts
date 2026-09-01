import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  function openFilters(fixture: ReturnType<typeof setup>) {
    fixture.nativeElement.querySelector('.menu-button').click();
    fixture.detectChanges();
  }

  it('should create the app', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show a carousel of top picks and a short list by default', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('.carousel-scroller app-recipe-card').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(3);
  });

  it('should keep the filters panel hidden until the menu button is clicked', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#cook-time')).toBeFalsy();

    openFilters(fixture);

    expect(fixture.nativeElement.querySelector('#cook-time')).toBeTruthy();
  });

  it('should reveal every matching recipe in the list when "See all" is clicked', () => {
    const fixture = setup();
    const app = fixture.componentInstance as any;
    const total = app.filteredRecipes().length;

    fixture.nativeElement.querySelector('#all-recipes .see-all-link').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(total);
  });

  it('should filter recipes by search query', () => {
    const fixture = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search');
    input.value = 'salmon';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carousel-scroller app-recipe-card').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Grilled Salmon');
  });

  it('should match recipes by ingredient as well as name', () => {
    const fixture = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search');
    input.value = 'parmesan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const app = fixture.componentInstance as any;
    expect(app.filteredRecipes().length).toBeGreaterThan(1);
  });

  it('should show an empty state when no recipes match', () => {
    const fixture = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search');
    input.value = 'nonexistent-ingredient-xyz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-recipe-card')).toBeFalsy();
  });

  it('should filter out recipes above the max cook time', () => {
    const fixture = setup();
    openFilters(fixture);

    const range: HTMLInputElement = fixture.nativeElement.querySelector('#cook-time');
    range.value = '10';
    range.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const app = fixture.componentInstance as any;
    const cookTimes = app.filteredRecipes().map((recipe: { cookTime: number }) => recipe.cookTime);
    expect(cookTimes.length).toBeGreaterThan(0);
    expect(cookTimes.every((time: number) => time <= 10)).toBe(true);
  });

  it('should sort by shortest cook time when the sort toggle is checked', () => {
    const fixture = setup();
    openFilters(fixture);

    const sortToggle: HTMLInputElement = fixture.nativeElement.querySelectorAll(
      '.toggle-control input[type="checkbox"]',
    )[1];
    sortToggle.checked = true;
    sortToggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const app = fixture.componentInstance as any;
    const cookTimes = app.filteredRecipes().map((recipe: { cookTime: number }) => recipe.cookTime);
    const sorted = [...cookTimes].sort((a, b) => a - b);
    expect(cookTimes).toEqual(sorted);
  });

  it('should show only favorited recipes when favorites-only is enabled', () => {
    const fixture = setup();
    const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
    favoriteButton.click();
    fixture.detectChanges();

    openFilters(fixture);
    const favoritesOnlyToggle: HTMLInputElement = fixture.nativeElement.querySelectorAll(
      '.toggle-control input[type="checkbox"]',
    )[0];
    favoritesOnlyToggle.checked = true;
    favoritesOnlyToggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(1);
  });

  it('should toggle favorites-only from the bottom nav heart icon', () => {
    const fixture = setup();
    const app = fixture.componentInstance as any;

    fixture.nativeElement.querySelectorAll('.nav-icon')[1].click();
    fixture.detectChanges();

    expect(app.favoritesOnly()).toBe(true);
  });

  it('should toggle dark mode from the promo banner button', () => {
    const fixture = setup();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fixture.nativeElement.querySelector('.promo-button').click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(fixture.nativeElement.querySelector('.promo-button').textContent).toContain('Switch to light');
  });

  it('should toggle the theme attribute from the bottom nav floating button', () => {
    const fixture = setup();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fixture.nativeElement.querySelector('.nav-fab').click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
