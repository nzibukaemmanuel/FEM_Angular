import { Component, input } from '@angular/core';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-featured-recipe-card',
  imports: [],
  templateUrl: './featured-recipe-card.html',
  styleUrl: './featured-recipe-card.css',
})
export class FeaturedRecipeCard {
  readonly recipe = input.required<Recipe>();
}
