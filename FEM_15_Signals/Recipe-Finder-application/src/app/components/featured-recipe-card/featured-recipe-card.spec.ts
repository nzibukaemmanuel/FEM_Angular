import { TestBed } from '@angular/core/testing';
import { FeaturedRecipeCard } from './featured-recipe-card';

describe('FeaturedRecipeCard', () => {
  it('should render the given image and alt text', () => {
    const fixture = TestBed.createComponent(FeaturedRecipeCard);
    fixture.componentRef.setInput('image', '/recipes/Keto Salad (1).png');
    fixture.componentRef.setInput('alt', 'Keto Salad card');
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('/recipes/Keto%20Salad%20(1).png');
    expect(img.alt).toBe('Keto Salad card');
  });
});
