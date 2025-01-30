export interface Recipe {
  id: number;
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ShoppingList {
  id: number;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem extends Ingredient {
  bought: boolean;
}

export interface RecipeFormData {
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
}
