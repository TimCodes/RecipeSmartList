import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { recipes, shoppingLists, shoppingListRecipes, ingredients } from "@db/schema";

// Helper function to calculate nutritional balance score
function calculateNutritionalScore(recipe: any, targetNutrition: any = null) {
  if (!recipe.nutrition) return 0;

  // Default balanced nutrition targets (percentages of daily values)
  const defaultTargets = {
    protein: 20, // 20% of calories from protein
    carbohydrates: 50, // 50% of calories from carbs
    fat: 30, // 30% of calories from fat
    fiber: 25, // 25g per day
  };

  const targets = targetNutrition || defaultTargets;

  // Calculate macro balance score
  const macroScore = (1 - Math.abs(recipe.nutrition.protein / recipe.nutrition.calories * 100 - targets.protein) / 100) +
                    (1 - Math.abs(recipe.nutrition.carbohydrates / recipe.nutrition.calories * 100 - targets.carbohydrates) / 100) +
                    (1 - Math.abs(recipe.nutrition.fat / recipe.nutrition.calories * 100 - targets.fat) / 100);

  // Calculate micronutrient diversity score
  const vitamins = recipe.nutrition.vitamins || {};
  const minerals = recipe.nutrition.minerals || {};
  const micronutrientCount = Object.keys(vitamins).length + Object.keys(minerals).length;
  const microScore = micronutrientCount / 15; // Normalize by maximum possible micronutrients

  // Combine scores (70% macro balance, 30% micronutrient diversity)
  return (macroScore * 0.7 + microScore * 0.3);
}

export function registerRoutes(app: Express): Server {
  // Ingredient routes
  app.get("/api/ingredients", async (_req, res) => {
    const allIngredients = await db.query.ingredients.findMany({
      orderBy: (ingredients, { asc }) => [asc(ingredients.name)]
    });
    res.json(allIngredients);
  });

  app.post("/api/ingredients", async (req, res) => {
    const ingredient = req.body;
    const newIngredient = await db.insert(ingredients).values(ingredient).returning();
    res.json(newIngredient[0]);
  });

  app.get("/api/ingredients/:id", async (req, res) => {
    const ingredient = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, parseInt(req.params.id))
    });

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json(ingredient);
  });

  app.put("/api/ingredients/:id", async (req, res) => {
    const ingredient = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, parseInt(req.params.id))
    });

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    const updatedIngredient = await db
      .update(ingredients)
      .set(req.body)
      .where(eq(ingredients.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedIngredient[0]);
  });

  app.delete("/api/ingredients/:id", async (req, res) => {
    await db.delete(ingredients).where(eq(ingredients.id, parseInt(req.params.id)));
    res.status(204).end();
  });

  // Recipe routes
  app.get("/api/recipes", async (_req, res) => {
    const allRecipes = await db.query.recipes.findMany();
    res.json(allRecipes);
  });

  app.post("/api/recipes", async (req, res) => {
    const recipe = req.body;
    const newRecipe = await db.insert(recipes).values(recipe).returning();
    res.json(newRecipe[0]);
  });

  app.get("/api/recipes/:id", async (req, res) => {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id))
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  });

  app.put("/api/recipes/:id", async (req, res) => {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, parseInt(req.params.id))
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const updatedRecipe = await db
      .update(recipes)
      .set(req.body)
      .where(eq(recipes.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedRecipe[0]);
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    await db.delete(recipes).where(eq(recipes.id, parseInt(req.params.id)));
    res.status(204).end();
  });

  // Shopping list routes
  app.get("/api/shopping-lists", async (_req, res) => {
    const lists = await db.query.shoppingLists.findMany();
    res.json(lists);
  });

  app.post("/api/shopping-lists", async (req, res) => {
    const { recipes: recipeIds, ...list } = req.body;

    const newList = await db.insert(shoppingLists).values(list).returning();
    const listId = newList[0].id;

    if (recipeIds?.length) {
      await db.insert(shoppingListRecipes).values(
        recipeIds.map((r: {id: number, servings: number}) => ({
          shoppingListId: listId,
          recipeId: r.id,
          servings: r.servings
        }))
      );
    }

    res.json(newList[0]);
  });

  app.put("/api/shopping-lists/:id", async (req, res) => {
    const list = await db.query.shoppingLists.findFirst({
      where: eq(shoppingLists.id, parseInt(req.params.id))
    });

    if (!list) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    const updatedList = await db
      .update(shoppingLists)
      .set(req.body)
      .where(eq(shoppingLists.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedList[0]);
  });

  app.delete("/api/shopping-lists/:id", async (req, res) => {
    await db.delete(shoppingLists).where(eq(shoppingLists.id, parseInt(req.params.id)));
    res.status(204).end();
  });

  // Recipe suggestions route
  app.get("/api/shopping-lists/:id/suggestions", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);

      const list = await db.query.shoppingLists.findFirst({
        where: eq(shoppingLists.id, listId)
      });

      if (!list) {
        return res.status(404).json({ message: "Shopping list not found" });
      }

      const items = list.items || [];
      const currentIngredients = new Set(items.map(item => item.name.toLowerCase()));

      const allRecipes = await db.query.recipes.findMany();

      const suggestedRecipes = allRecipes
        .map(recipe => {
          const ingredients = recipe.ingredients || [];
          const recipeIngredients = new Set(
            ingredients.map(ing => ing.name.toLowerCase())
          );

          const matchingIngredients = Array.from(recipeIngredients)
            .filter(ing => currentIngredients.has(ing));

          // Calculate ingredient similarity
          const ingredientSimilarity = matchingIngredients.length / recipeIngredients.size;

          // Calculate nutritional balance score
          const nutritionalScore = calculateNutritionalScore(recipe);

          // Combined score: 60% ingredient similarity, 40% nutritional balance
          const combinedScore = (ingredientSimilarity * 0.6) + (nutritionalScore * 0.4);

          return {
            recipe,
            similarity: combinedScore,
            matchingIngredients,
            nutritionalBalance: nutritionalScore
          };
        })
        .filter(({ similarity }) => similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      res.json(suggestedRecipes);
    } catch (error) {
      console.error("Error getting recipe suggestions:", error);
      res.status(500).json({ message: "Error getting recipe suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}