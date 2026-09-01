export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: number;
  image: string;
  subtitle: string;
  rating: number;
  featured?: boolean;
  tagline?: string;
  heroImage?: string;
}
