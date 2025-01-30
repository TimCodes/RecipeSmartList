import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ShoppingListCard from "@/components/shopping-list-card";
import type { Recipe, ShoppingList } from "@/lib/types";

export default function ShoppingLists() {
  const [search, setSearch] = useState("");
  const [selectedRecipes, setSelectedRecipes] = useState<{id: number, servings: number}[]>([]);
  const { toast } = useToast();

  const { data: lists = [] } = useQuery<ShoppingList[]>({
    queryKey: ["/api/shopping-lists"],
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const items = selectedRecipes.flatMap(({ id, servings }) => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return [];

        return recipe.ingredients.map(ingredient => ({
          name: ingredient.name,
          quantity: ingredient.quantity * (servings / (recipe.servings || 1)),
          unit: ingredient.unit,
          bought: false
        }));
      });

      const combinedItems = Object.values(
        items.reduce((acc, item) => {
          const key = `${item.name}-${item.unit}`;
          if (!acc[key]) {
            acc[key] = item;
          } else {
            acc[key] = {
              ...acc[key],
              quantity: acc[key].quantity + item.quantity
            };
          }
          return acc;
        }, {} as Record<string, typeof items[number]>)
      );

      const res = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          items: combinedItems,
          recipes: selectedRecipes
        }),
      });

      if (!res.ok) throw new Error("Failed to create shopping list");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      setSelectedRecipes([]);
      toast({
        title: "Success",
        description: "Shopping list created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/shopping-lists/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      toast({
        title: "Success",
        description: "Shopping list deleted successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (list: ShoppingList) =>
      fetch(`/api/shopping-lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
    },
  });

  const filteredLists = lists.filter(list => 
    list.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateList = async (name: string) => {
    if (!selectedRecipes.length) {
      toast({
        title: "Error",
        description: "Please select at least one recipe",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(name);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shopping Lists</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shopping List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="List name"
                onChange={(e) => {
                  if (e.target.value) {
                    handleCreateList(e.target.value);
                  }
                }}
              />
              <div className="space-y-2">
                <h3 className="font-medium">Select Recipes</h3>
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center gap-2">
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
                    <span>{recipe.name}</span>
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
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search lists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLists.map((list) => (
          <ShoppingListCard
            key={list.id}
            list={list}
            onUpdate={(updatedList: ShoppingList) => updateMutation.mutate(updatedList)}
            onDelete={(id: number) => {
              if (confirm("Are you sure you want to delete this shopping list?")) {
                deleteMutation.mutate(id);
              }
            }}
          />
        ))}
      </div>

      {filteredLists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No shopping lists found</p>
        </div>
      )}
    </div>
  );
}