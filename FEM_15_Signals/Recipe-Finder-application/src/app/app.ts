import { Component, computed, effect, signal } from '@angular/core';
import { Login } from './components/login/login';
import { RecipeCard } from './components/recipe-card/recipe-card';
import { Toast, ToastMessage, ToastType } from './components/toast/toast';
import { RECIPES } from './data/recipes';
import { Recipe } from './models/recipe';

type SortOrder = 'default' | 'cookTime';

interface PersistedState {
  searchQuery: string;
  maxCookTime: number;
  favoritesOnly: boolean;
  sortOrder: SortOrder;
  favoriteIds: string[];
  username: string | null;
}

const STORAGE_KEY = 'recipe-finder-state';
const MAX_COOK_TIME = 60;
const TOP_PICKS_COUNT = 3;
const CAROUSEL_COUNT = 4;
const TOAST_DURATION_MS = 4000;

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

@Component({
  selector: 'app-root',
  imports: [RecipeCard, Login, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly persisted = loadPersistedState();

  protected readonly title = signal('Recipe Finder');
  protected readonly maxCookTimeLimit = MAX_COOK_TIME;

  private readonly recipes = signal<Recipe[]>(RECIPES);

  protected readonly searchQuery = signal(this.persisted.searchQuery ?? '');
  protected readonly maxCookTime = signal(this.persisted.maxCookTime ?? MAX_COOK_TIME);
  protected readonly favoritesOnly = signal(this.persisted.favoritesOnly ?? false);
  protected readonly sortOrder = signal<SortOrder>(this.persisted.sortOrder ?? 'default');
  protected readonly favoriteIds = signal<Set<string>>(new Set(this.persisted.favoriteIds ?? []));

  protected readonly filteredRecipes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const maxTime = this.maxCookTime();
    const onlyFavorites = this.favoritesOnly();
    const favorites = this.favoriteIds();

    const matches = this.recipes().filter((recipe) => {
      const matchesQuery =
        query.length === 0 ||
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query));
      const matchesCookTime = recipe.cookTime <= maxTime;
      const matchesFavorite = !onlyFavorites || favorites.has(recipe.id);
      return matchesQuery && matchesCookTime && matchesFavorite;
    });

    return this.sortOrder() === 'cookTime'
      ? [...matches].sort((a, b) => a.cookTime - b.cookTime)
      : matches;
  });

  protected readonly resultCount = computed(() => this.filteredRecipes().length);
  protected readonly hasResults = computed(() => this.resultCount() > 0);
  protected readonly heroRecipe = computed(() => this.recipes().find((recipe) => recipe.featured));

  protected readonly showAllRecipes = signal(false);
  protected readonly hasMoreRecipes = computed(() => this.resultCount() > TOP_PICKS_COUNT);
  protected readonly topPicks = computed(() =>
    this.showAllRecipes() ? this.filteredRecipes() : this.filteredRecipes().slice(0, TOP_PICKS_COUNT),
  );
  protected readonly carouselRecipes = computed(() => this.filteredRecipes().slice(0, CAROUSEL_COUNT));

  protected readonly showMenu = signal(false);
  protected readonly showAccount = signal(false);
  protected readonly username = signal<string | null>(this.persisted.username ?? null);

  protected readonly toast = signal<ToastMessage | null>(null);
  private toastTimeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      console.log('[Recipe Finder] filters changed', {
        searchQuery: this.searchQuery(),
        maxCookTime: this.maxCookTime(),
        favoritesOnly: this.favoritesOnly(),
        sortOrder: this.sortOrder(),
      });
    });

    effect(() => {
      const state: PersistedState = {
        searchQuery: this.searchQuery(),
        maxCookTime: this.maxCookTime(),
        favoritesOnly: this.favoritesOnly(),
        sortOrder: this.sortOrder(),
        favoriteIds: [...this.favoriteIds()],
        username: this.username(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected onMaxCookTimeChange(value: number): void {
    this.maxCookTime.set(value);
  }

  protected toggleFavoritesOnly(): void {
    this.favoritesOnly.update((value) => !value);
  }

  protected toggleSortByCookTime(): void {
    this.sortOrder.update((order) => (order === 'cookTime' ? 'default' : 'cookTime'));
  }

  protected isFavorite(id: string): boolean {
    return this.favoriteIds().has(id);
  }

  protected toggleFavorite(id: string): void {
    this.favoriteIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected toggleShowAll(): void {
    this.showAllRecipes.update((value) => !value);
    if (this.showAllRecipes()) {
      setTimeout(() => {
        document.getElementById('all-recipes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  protected viewFavorites(): void {
    this.favoritesOnly.set(true);
    this.showAllRecipes.set(true);
    setTimeout(() => {
      document.getElementById('all-recipes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  protected scrollToRecipe(id: string): void {
    this.showAllRecipes.set(true);
    setTimeout(() => {
      document.getElementById(`recipe-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  protected toggleMenu(): void {
    this.showMenu.update((value) => !value);
  }

  protected closeMenu(): void {
    this.showMenu.set(false);
  }

  protected goHome(): void {
    this.showMenu.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openFavoritesFromMenu(): void {
    this.showMenu.set(false);
    this.viewFavorites();
  }

  protected openAccountFromMenu(): void {
    this.showMenu.set(false);
    this.showAccount.set(true);
  }

  protected openAccount(): void {
    this.showAccount.set(true);
  }

  protected closeAccount(): void {
    this.showAccount.set(false);
  }

  protected login(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    this.username.set(trimmed);
    this.showAccount.set(false);
    this.showToast(`Welcome, ${trimmed}! You're logged in.`, 'success');
  }

  protected logout(): void {
    this.username.set(null);
  }

  protected showToast(text: string, type: ToastType = 'error'): void {
    clearTimeout(this.toastTimeoutId);
    this.toast.set({ text, type });
    this.toastTimeoutId = setTimeout(() => this.toast.set(null), TOAST_DURATION_MS);
  }

  protected dismissToast(): void {
    clearTimeout(this.toastTimeoutId);
    this.toast.set(null);
  }
}
