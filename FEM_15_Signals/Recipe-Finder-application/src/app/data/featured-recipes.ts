export interface FeaturedRecipe {
  id: string;
  image: string;
  alt: string;
}

export const FEATURED_RECIPES: FeaturedRecipe[] = [
  { id: 'keto-salad', image: '/recipes/Keto Salad (1).png', alt: 'Keto Salad — Beans & fruits, rated 4.9' },
  { id: 'sewers-salad', image: '/recipes/Sewers salad (1).png', alt: 'Sewers Salad — Chicken & dal, rated 4.5' },
];
