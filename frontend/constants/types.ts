export type OutfitCategory = 'Alle' | 'Casual' | 'Business' | 'Sport';

export interface Outfit {
  id: string;
  name: string;
  category: Exclude<OutfitCategory, 'Alle'>;
  imageUri?: string;
  createdAt: number;
}

export type ClothingCategory = 'Oberteil' | 'Unterteil';

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  'Oberteil',
  'Unterteil',
];

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageUri: string;
  bgRemoved?: boolean;
  createdAt: number;
}
