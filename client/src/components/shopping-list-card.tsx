import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Trash2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { ShoppingList, Recipe } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

interface ShoppingListCardProps {
  list: ShoppingList;
  onUpdate: (list: ShoppingList) => void;
  onDelete: (id: number) => void;
}

interface RecipeSuggestion {
  recipe: Recipe;
  similarity: number;
  matchingIngredients: string[];
  nutritionalBalance: number;
}

export default function ShoppingListCard({ list, onUpdate, onDelete }: ShoppingListCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<{id: number, servings: number}[]>([]);

  const { data: suggestions = [] } = useQuery<RecipeSuggestion[]>({
    queryKey: ["/api/shopping-lists", list.id, "suggestions"],
    queryFn: async () => {
      const res = await fetch(`/api/shopping-lists/${list.id}/suggestions`);
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json();
    },
    enabled: isDialogOpen,
  });

  const addRecipesMutation = useMutation({
    mutationFn: async () => {
      const items = selectedRecipes.flatMap(({ id, servings }) => {
        const recipe = suggestions.find(s => s.recipe.id === id)?.recipe;
        if (!recipe) return [];

        return recipe.ingredients.map(ingredient => ({
          name: ingredient.name,
          quantity: ingredient.quantity * (servings / (recipe.servings || 1)),
          unit: ingredient.unit,
          bought: false
        }));
      });

      const combinedItems = [...list.items];

      // Add new items, combining quantities for matching items
      items.forEach(newItem => {
        const existingItemIndex = combinedItems.findIndex(
          item => item.name === newItem.name && item.unit === newItem.unit
        );

        if (existingItemIndex >= 0) {
          combinedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          combinedItems.push(newItem);
        }
      });

      const updatedList = { ...list, items: combinedItems };
      await onUpdate(updatedList);
      return updatedList;
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setSelectedRecipes([]);
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
    },
  });

  const toggleItem = (index: number) => {
    const updatedItems = list.items.map((item, i) =>
      i === index ? { ...item, bought: !item.bought } : item
    );
    onUpdate({ ...list, items: updatedItems });
  };

  const clearBoughtItems = () => {
    const unboughtItems = list.items.filter(item => !item.bought);
    onUpdate({ ...list, items: unboughtItems });
  };

  const boughtCount = list.items.filter(item => item.bought).length;
  const progress = list.items.length ? (boughtCount / list.items.length) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{list.name}</h3>
            <p className="text-sm text-muted-foreground">
              {boughtCount} of {list.items.length} items bought
            </p>
          </div>
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {list.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  checked={item.bought}
                  onCheckedChange={() => toggleItem(index)}
                  id={`item-${index}`}
                />
                <label
                  htmlFor={`item-${index}`}
                  className={`flex-grow text-sm ${
                    item.bought ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.quantity} {item.unit} {item.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-grow"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Suggest Recipes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recipe Suggestions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map(({ recipe, similarity, matchingIngredients, nutritionalBalance }) => (
                    <div key={recipe.id} className="flex items-center gap-2 p-2 rounded border">
                      <input
                        type="checkbox"
                        checked={selectedRecipes.some(r => r.id === recipe.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipes([...selectedRecipes, { id: recipe.id, servings: recipe.servings || 1 }]);
                          } else {
                            setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipe.id));
                          }
                        }}
                      />
                      <div className="flex-grow">
                        <div className="font-medium">{recipe.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(similarity * 100)}% match ({matchingIngredients.length} shared ingredients)
                        </div>
                        {recipe.nutrition && (
                          <div className="text-sm text-muted-foreground">
                            Nutritional Balance: {Math.round(nutritionalBalance * 100)}%
                            <div className="text-xs">
                              {recipe.nutrition.calories} cal | 
                              P: {recipe.nutrition.protein}g | 
                              C: {recipe.nutrition.carbohydrates}g | 
                              F: {recipe.nutrition.fat}g
                            </div>
                          </div>
                        )}
                      </div>
                      <Input
                        type="number"
                        min="1"
                        className="w-20"
                        placeholder="Servings"
                        defaultValue={recipe.servings}
                        onChange={(e) => {
                          const servings = parseInt(e.target.value);
                          if (servings > 0) {
                            setSelectedRecipes(prev =>
                              prev.map(r =>
                                r.id === recipe.id ? { ...r, servings } : r
                              )
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    className="w-full"
                    onClick={() => addRecipesMutation.mutate()}
                    disabled={selectedRecipes.length === 0 || addRecipesMutation.isPending}
                  >
                    {addRecipesMutation.isPending ? "Adding..." : "Add Selected Recipes"}
                  </Button>
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No recipe suggestions found based on your current items
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="sm"
          className="flex-grow"
          onClick={clearBoughtItems}
          disabled={boughtCount === 0}
        >
          Clear Bought Items
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(list.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}