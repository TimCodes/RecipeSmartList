import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { recipes, shoppingLists, shoppingListRecipes } from "@db/schema";
import { sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
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

  // New route for recipe suggestions
  app.get("/api/shopping-lists/:id/suggestions", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);

      // Get current shopping list with its items
      const list = await db.query.shoppingLists.findFirst({
        where: eq(shoppingLists.id, listId)
      });

      if (!list) {
        return res.status(404).json({ message: "Shopping list not found" });
      }

      // Get ingredient names from the current shopping list
      const currentIngredients = new Set(list.items.map(item => item.name.toLowerCase()));

      // Get all recipes
      const allRecipes = await db.query.recipes.findMany();

      // Calculate similarity scores for each recipe
      const suggestedRecipes = allRecipes
        .map(recipe => {
          const recipeIngredients = new Set(
            recipe.ingredients.map(ing => ing.name.toLowerCase())
          );

          // Count matching ingredients
          const matchingIngredients = [...recipeIngredients]
            .filter(ing => currentIngredients.has(ing));

          const similarity = matchingIngredients.length / recipeIngredients.size;

          return {
            recipe,
            similarity,
            matchingIngredients
          };
        })
        // Filter out recipes with no matching ingredients
        .filter(({ similarity }) => similarity > 0)
        // Sort by similarity score descending
        .sort((a, b) => b.similarity - a.similarity)
        // Take top 5 suggestions
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