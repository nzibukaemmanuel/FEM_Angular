export type DessertCategory = 'All' | 'Cakes' | 'Pastries' | 'Tarts' | 'Cookies';

export type DessertBadge = 'Best Seller' | 'Limited Edition';

export interface Dessert {
  id: string;
  name: string;
  category: Exclude<DessertCategory, 'All'>;
  description: string;
  price: number;
  emoji: string;
  gradient: [string, string];
  badge?: DessertBadge;
}

export interface CartItem {
  dessert: Dessert;
  quantity: number;
}
