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

  it('should show a carousel of top picks and a short list by default', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('.carousel-scroller app-recipe-card').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(3);
  });

  it('should keep the filters panel visible without needing to be toggled', () => {
    const fixture = setup();
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
    const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
    favoriteButton.click();
    fixture.detectChanges();

    const favoritesOnlyToggle: HTMLInputElement = fixture.nativeElement.querySelectorAll(
      '.toggle-control input[type="checkbox"]',
    )[0];
    favoritesOnlyToggle.checked = true;
    favoritesOnlyToggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(1);
  });

  describe('login', () => {
    it('should show a Login button in the promo banner when logged out', () => {
      const fixture = setup();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('.promo-banner .promo-button');
      expect(button.textContent?.trim()).toBe('Login');
    });

    it('should log the user in from the promo banner and persist the name', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.promo-banner .promo-button').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('#login-username').value = 'Ama';
      fixture.nativeElement.querySelector('#login-password').value = 'secret123';
      fixture.nativeElement.querySelector('.login-submit').click();
      fixture.detectChanges();

      const app = fixture.componentInstance as any;
      expect(app.username()).toBe('Ama');
      expect(fixture.nativeElement.querySelector('.about-panel')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.promo-banner').textContent).toContain('Welcome back, Ama');

      const stored = JSON.parse(localStorage.getItem('recipe-finder-state') ?? '{}');
      expect(stored.username).toBe('Ama');
    });

    it('should ignore a blank name', () => {
      const fixture = setup();
      const app = fixture.componentInstance as any;
      app.login('   ');
      expect(app.username()).toBeNull();
    });

    it('should show a success toast after logging in', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.promo-banner .promo-button').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('#login-username').value = 'Ama';
      fixture.nativeElement.querySelector('#login-password').value = 'secret123';
      fixture.nativeElement.querySelector('.login-submit').click();
      fixture.detectChanges();

      const toastEl: HTMLElement = fixture.nativeElement.querySelector('.toast');
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-success')).toBe(true);
      expect(toastEl.textContent).toContain('Welcome, Ama');
    });

    it('should show an error toast when login validation fails', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.promo-banner .promo-button').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('#login-username').value = 'ab';
      fixture.nativeElement.querySelector('#login-password').value = '123';
      fixture.nativeElement.querySelector('.login-submit').click();
      fixture.detectChanges();

      const toastEl: HTMLElement = fixture.nativeElement.querySelector('.toast');
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-error')).toBe(true);

      const app = fixture.componentInstance as any;
      expect(app.username()).toBeNull();

      fixture.nativeElement.querySelector('.toast-close').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.toast')).toBeFalsy();
    });

    it('should log out from the promo banner', () => {
      const fixture = setup();
      const app = fixture.componentInstance as any;
      app.login('Ama');
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.promo-banner .promo-button').click();
      fixture.detectChanges();

      expect(app.username()).toBeNull();
      expect(fixture.nativeElement.querySelector('.promo-banner .promo-button').textContent?.trim()).toBe('Login');
    });
  });

  describe('menu', () => {
    it('should be closed by default and open when the menu button is clicked', () => {
      const fixture = setup();
      expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeFalsy();

      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeTruthy();
    });

    it('should close when the backdrop is clicked', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.menu-backdrop').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeFalsy();
    });

    it('should filter to favorites and close the menu when "Favourites" or "Saved" is clicked', () => {
      const fixture = setup();
      const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
      favoriteButton.click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();
      const [, favouritesItem, savedItem] = fixture.nativeElement.querySelectorAll('.menu-item');

      favouritesItem.click();
      fixture.detectChanges();

      const app = fixture.componentInstance as any;
      expect(app.favoritesOnly()).toBe(true);
      expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeFalsy();
      expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(1);

      app.favoritesOnly.set(false);
      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelectorAll('.menu-item')[2].click();
      fixture.detectChanges();
      expect(app.favoritesOnly()).toBe(true);
    });

    it('should open the account panel when "Users" is clicked, and close via the close button', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelectorAll('.menu-item')[3].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.about-panel')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('#login-username')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.menu-dropdown')).toBeFalsy();

      fixture.nativeElement.querySelector('.about-close').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.about-panel')).toBeFalsy();
    });

    it('should close the account panel when the backdrop is clicked', () => {
      const fixture = setup();
      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelectorAll('.menu-item')[3].click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.modal-backdrop').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.about-panel')).toBeFalsy();
    });

    it('should show a welcome message and log-out option when already logged in', () => {
      const fixture = setup();
      const app = fixture.componentInstance as any;
      app.login('Ama');
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.menu-button').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelectorAll('.menu-item')[3].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.about-panel').textContent).toContain('Welcome, Ama');
      expect(fixture.nativeElement.querySelector('#login-username')).toBeFalsy();
    });
  });

  describe('mobile nav', () => {
    it('should mirror the same four actions as the header menu', () => {
      const fixture = setup();
      const favoriteButton: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
      favoriteButton.click();
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.mobile-nav-item');
      expect(items.length).toBe(4);

      items[1].click(); // Favourites
      fixture.detectChanges();

      const app = fixture.componentInstance as any;
      expect(app.favoritesOnly()).toBe(true);
      expect(fixture.nativeElement.querySelectorAll('#all-recipes .recipe-list app-recipe-card').length).toBe(1);
    });

    it('should open the account panel from the mobile nav', () => {
      const fixture = setup();
      fixture.nativeElement.querySelectorAll('.mobile-nav-item')[3].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.about-panel')).toBeTruthy();
    });
  });
});
