import { Component, input, output } from '@angular/core';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
})
export class RecipeCard {
  readonly recipe = input.required<Recipe>();
  readonly isFavorite = input(false);
  readonly favoriteToggled = output<string>();

  protected onToggleFavorite(): void {
    this.favoriteToggled.emit(this.recipe().id);
  }
}
