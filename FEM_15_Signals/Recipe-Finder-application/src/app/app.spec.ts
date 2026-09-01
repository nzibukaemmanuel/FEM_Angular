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

  it('should create the app', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show only the top 3 picks by default', () => {
    const fixture = setup();
    const cards = fixture.nativeElement.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(3);
  });

  it('should reveal the full grid when "See all" is clicked', () => {
    const fixture = setup();
    const app = fixture.componentInstance as any;
    const total = app.filteredRecipes().length;

    const seeAllButton: HTMLButtonElement = fixture.nativeElement.querySelector('.see-all-button');
    seeAllButton.click();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(total);
    expect(fixture.nativeElement.querySelector('.recipe-grid')).toBeTruthy();
  });

  it('should filter recipes by search query', () => {
    const fixture = setup();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#search');
    input.value = 'salmon';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(1);
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
    fixture.nativeElement.querySelector('.see-all-button').click();
    fixture.detectChanges();

    const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('.favorite-button');
    favoriteButton.click();
    fixture.detectChanges();

    const favoritesOnlyToggle: HTMLInputElement = fixture.nativeElement.querySelectorAll(
      '.toggle-control input[type="checkbox"]',
    )[0];
    favoritesOnlyToggle.checked = true;
    favoritesOnlyToggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-recipe-card');
    expect(cards.length).toBe(1);
  });

  it('should toggle the theme attribute on the document element', () => {
    const fixture = setup();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const themeToggle: HTMLButtonElement = fixture.nativeElement.querySelector('.theme-toggle');
    themeToggle.click();
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
