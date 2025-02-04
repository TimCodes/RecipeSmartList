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
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    vitamins: {
      a?: number;
      c?: number;
      d?: number;
      e?: number;
      k?: number;
      b1?: number;
      b2?: number;
      b3?: number;
      b6?: number;
      b12?: number;
    };
    minerals: {
      calcium?: number;
      iron?: number;
      magnesium?: number;
      potassium?: number;
      zinc?: number;
    };
  };
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
  nutrition?: Recipe['nutrition'];
}