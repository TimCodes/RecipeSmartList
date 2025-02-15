import { pgTable, text, serial, integer, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  servingSize: real("serving_size"),
  servingUnit: text("serving_unit"),
  nutrition: jsonb("nutrition").$type<{
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
  }>()
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  image: text("image"),
  tags: jsonb("tags").$type<string[]>().default([]),
  ingredients: jsonb("ingredients").$type<{
    name: string;
    quantity: number;
    unit: string;
  }[]>().default([]),
  instructions: jsonb("instructions").$type<string[]>().default([]),
  nutrition: jsonb("nutrition").$type<{
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
  }>()
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  items: jsonb("items").$type<{
    name: string;
    quantity: number;
    unit: string;
    bought: boolean;
  }[]>().default([])
});

export const shoppingListRecipes = pgTable("shopping_list_recipes", {
  id: serial("id").primaryKey(),
  shoppingListId: integer("shopping_list_id").notNull().references(() => shoppingLists.id, { onDelete: 'cascade' }),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  servings: integer("servings").notNull()
});

export const insertIngredientSchema = createInsertSchema(ingredients);
export const selectIngredientSchema = createSelectSchema(ingredients);
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export const insertShoppingListSchema = createInsertSchema(shoppingLists);
export const selectShoppingListSchema = createSelectSchema(shoppingLists);
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = typeof shoppingLists.$inferInsert;