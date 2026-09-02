import { TestBed } from '@angular/core/testing';
import { FeaturedRecipeCard } from './featured-recipe-card';
import { Recipe } from '../../models/recipe';

describe('FeaturedRecipeCard', () => {
  const recipe: Recipe = {
    id: 'keto-salad',
    name: 'Keto Salad',
    ingredients: ['green beans', 'avocado'],
    cookTime: 15,
    image: '/recipes/keto-salad.png',
    subtitle: 'Beans & fruits',
    rating: 4.9,
  };

  it('should render the recipe photo, name, subtitle and rating', () => {
    const fixture = TestBed.createComponent(FeaturedRecipeCard);
    fixture.componentRef.setInput('recipe', recipe);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('/recipes/keto-salad.png');
    expect(img.alt).toBe('Keto Salad');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Keto Salad');
    expect(text).toContain('Beans & fruits');
    expect(text).toContain('4.9');
  });
});
