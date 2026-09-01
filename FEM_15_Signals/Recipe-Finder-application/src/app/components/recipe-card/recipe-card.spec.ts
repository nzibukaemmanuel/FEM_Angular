import { TestBed } from '@angular/core/testing';
import { RecipeCard } from './recipe-card';
import { Recipe } from '../../models/recipe';

describe('RecipeCard', () => {
  const recipe: Recipe = {
    id: 'test-recipe',
    name: 'Test Recipe',
    ingredients: ['flour', 'sugar'],
    cookTime: 12,
    image: '🍽️',
  };

  it('should render the recipe details', () => {
    const fixture = TestBed.createComponent(RecipeCard);
    fixture.componentRef.setInput('recipe', recipe);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Test Recipe');
    expect(text).toContain('12 min');
    expect(text).toContain('flour, sugar');
  });

  it('should show a filled heart when marked as a favorite', () => {
    const fixture = TestBed.createComponent(RecipeCard);
    fixture.componentRef.setInput('recipe', recipe);
    fixture.componentRef.setInput('isFavorite', true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.favorite-button');
    expect(button.classList.contains('is-active')).toBe(true);
    expect(button.textContent?.trim()).toBe('♥');
  });

  it('should emit favoriteToggled with the recipe id when clicked', () => {
    const fixture = TestBed.createComponent(RecipeCard);
    fixture.componentRef.setInput('recipe', recipe);
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.favoriteToggled.subscribe((id) => emitted.push(id));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.favorite-button');
    button.click();

    expect(emitted).toEqual(['test-recipe']);
  });
});
