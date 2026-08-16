export type DessertCategory = 'All' | 'Cakes' | 'Pastries' | 'Tarts' | 'Cookies';

export interface Dessert {
  id: string;
  name: string;
  category: Exclude<DessertCategory, 'All'>;
  description: string;
  price: number;
  gradient: [string, string];
  image?: string;
  imagePosition?: string;
}

export interface CartItem {
  dessert: Dessert;
  quantity: number;
}
