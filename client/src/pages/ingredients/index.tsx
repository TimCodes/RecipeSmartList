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
import IngredientForm from "@/components/ingredient-form";
import IngredientCard from "@/components/ingredient-card";
import type { Ingredient } from "@/lib/types";

export default function Ingredients() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Ingredient, "id">) => {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create ingredient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Ingredient created successfully",
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
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ingredient");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });
    },
  });

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ingredients</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Ingredient</DialogTitle>
            </DialogHeader>
            <IngredientForm 
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search ingredients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIngredients.map((ingredient) => (
          <IngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            onDelete={() => {
              if (confirm("Are you sure you want to delete this ingredient?")) {
                deleteMutation.mutate(ingredient.id);
              }
            }}
          />
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ingredients found</p>
        </div>
      )}
    </div>
  );
}
