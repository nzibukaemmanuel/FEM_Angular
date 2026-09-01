import { TestBed } from '@angular/core/testing';
import { RecipeCard } from './recipe-card';
import { Recipe } from '../../models/recipe';

describe('RecipeCard', () => {
  const recipe: Recipe = {
    id: 'test-recipe',
    name: 'Test Recipe',
    ingredients: ['flour', 'sugar'],
    cookTime: 12,
    image: '/recipes/test-recipe.jpg',
    subtitle: 'Flour & sugar',
    rating: 4.5,
  };

  describe('row variant (default)', () => {
    it('should render the recipe details', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.detectChanges();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Test Recipe');
      expect(text).toContain('12 min');

      const img: HTMLImageElement = fixture.nativeElement.querySelector('.row-thumb img');
      expect(img.src).toContain('/recipes/test-recipe.jpg');
      expect(img.alt).toBe('Test Recipe');
    });

    it('should show a filled heart when marked as a favorite', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.componentRef.setInput('isFavorite', true);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
      expect(button.classList.contains('is-active')).toBe(true);
      expect(button.textContent?.trim()).toBe('♥');
    });

    it('should emit favoriteToggled with the recipe id when clicked', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.detectChanges();

      const emitted: string[] = [];
      fixture.componentInstance.favoriteToggled.subscribe((id) => emitted.push(id));

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('.row-favorite-button');
      button.click();

      expect(emitted).toEqual(['test-recipe']);
    });

    it('should disable the favorite button when locked', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.componentRef.setInput('locked', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.row-favorite-button').disabled).toBe(true);
    });
  });

  describe('carousel variant', () => {
    it('should render the photo, rating, and subtitle', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.componentRef.setInput('variant', 'carousel');
      fixture.detectChanges();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Test Recipe');
      expect(text).toContain('Flour & sugar');
      expect(text).toContain('4.5');

      const img: HTMLImageElement = fixture.nativeElement.querySelector('.carousel-photo img');
      expect(img.src).toContain('/recipes/test-recipe.jpg');
    });

    it('should emit favoriteToggled when the carousel heart is clicked', () => {
      const fixture = TestBed.createComponent(RecipeCard);
      fixture.componentRef.setInput('recipe', recipe);
      fixture.componentRef.setInput('variant', 'carousel');
      fixture.detectChanges();

      const emitted: string[] = [];
      fixture.componentInstance.favoriteToggled.subscribe((id) => emitted.push(id));

      fixture.nativeElement.querySelector('.carousel-favorite-button').click();

      expect(emitted).toEqual(['test-recipe']);
    });
  });
});
