export type OutfitCategory = 'Alle' | 'Casual' | 'Business' | 'Sport';

export interface Outfit {
  id: string;
  name: string;
  category: Exclude<OutfitCategory, 'Alle'>;
  imageUri?: string;
  createdAt: number;
}
