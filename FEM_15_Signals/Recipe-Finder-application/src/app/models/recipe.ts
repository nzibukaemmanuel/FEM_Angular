export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: number;
  image: string;
  emoji: string;
  featured?: boolean;
  tagline?: string;
  heroImage?: string;
}
