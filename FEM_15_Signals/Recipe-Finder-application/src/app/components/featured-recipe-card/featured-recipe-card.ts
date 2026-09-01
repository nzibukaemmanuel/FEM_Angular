import { Component, input } from '@angular/core';

@Component({
  selector: 'app-featured-recipe-card',
  imports: [],
  templateUrl: './featured-recipe-card.html',
  styleUrl: './featured-recipe-card.css',
})
export class FeaturedRecipeCard {
  readonly image = input.required<string>();
  readonly alt = input.required<string>();
}
