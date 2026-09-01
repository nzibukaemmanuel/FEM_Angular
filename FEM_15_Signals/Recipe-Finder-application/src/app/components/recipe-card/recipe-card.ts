import { Component, HostBinding, input, output, signal } from '@angular/core';
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

  protected readonly photoFailed = signal(false);

  @HostBinding('id')
  protected get hostId(): string {
    return `recipe-${this.recipe().id}`;
  }

  protected onToggleFavorite(): void {
    this.favoriteToggled.emit(this.recipe().id);
  }
}
