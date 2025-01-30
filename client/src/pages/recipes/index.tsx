import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/recipe-card";
import { queryClient } from "@/lib/queryClient";
import type { Recipe } from "@/lib/types";

export default function RecipeList() {
  const [search, setSearch] = useState("");
  
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/recipes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <Link href="/recipes/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>

      <Input
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this recipe?")) {
                deleteMutation.mutate(id);
              }
            }}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found</p>
        </div>
      )}
    </div>
  );
}
