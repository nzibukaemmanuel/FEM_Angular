import { Component, computed, effect, signal } from '@angular/core';
import { RecipeCard } from './components/recipe-card/recipe-card';
import { RECIPES } from './data/recipes';
import { Recipe } from './models/recipe';

type SortOrder = 'default' | 'cookTime';
type Theme = 'light' | 'dark';

interface PersistedState {
  searchQuery: string;
  maxCookTime: number;
  favoritesOnly: boolean;
  sortOrder: SortOrder;
  favoriteIds: string[];
  theme: Theme;
}

const STORAGE_KEY = 'recipe-finder-state';
const MAX_COOK_TIME = 60;

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
  imports: [RecipeCard],
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
  protected readonly theme = signal<Theme>(this.persisted.theme ?? 'light');

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
      document.documentElement.setAttribute('data-theme', this.theme());
    });

    effect(() => {
      const state: PersistedState = {
        searchQuery: this.searchQuery(),
        maxCookTime: this.maxCookTime(),
        favoritesOnly: this.favoritesOnly(),
        sortOrder: this.sortOrder(),
        favoriteIds: [...this.favoriteIds()],
        theme: this.theme(),
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

  protected toggleTheme(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
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
}
