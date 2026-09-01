import { Component, HostBinding, input, output } from '@angular/core';
import { Recipe } from '../../models/recipe';

export type RecipeCardVariant = 'row' | 'carousel';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
})
export class RecipeCard {
  readonly recipe = input.required<Recipe>();
  readonly isFavorite = input(false);
  readonly variant = input<RecipeCardVariant>('row');
  readonly favoriteToggled = output<string>();

  @HostBinding('id')
  protected get hostId(): string {
    return `recipe-${this.recipe().id}`;
  }

  protected onToggleFavorite(): void {
    this.favoriteToggled.emit(this.recipe().id);
  }
}
