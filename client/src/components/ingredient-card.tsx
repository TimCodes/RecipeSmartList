import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";
import type { Ingredient } from "@/lib/types";

interface IngredientCardProps {
  ingredient: Ingredient;
  onDelete: (id: number) => void;
}

export default function IngredientCard({ ingredient, onDelete }: IngredientCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              {ingredient.name}
            </h3>
            {ingredient.category && (
              <Badge variant="secondary" className="mt-1">
                {ingredient.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {ingredient.servingSize && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Scale className="w-4 h-4 mr-1" />
              <span>
                {ingredient.servingSize} {ingredient.servingUnit} per serving
              </span>
            </div>
          )}
          {ingredient.nutrition && (
            <div className="space-y-1 text-sm">
              <p>Calories: {ingredient.nutrition.calories}</p>
              <p>Protein: {ingredient.nutrition.protein}g</p>
              <p>Carbs: {ingredient.nutrition.carbohydrates}g</p>
              <p>Fat: {ingredient.nutrition.fat}g</p>
              <p>Fiber: {ingredient.nutrition.fiber}g</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={() => onDelete(ingredient.id)}
          className="w-full"
        >
          Delete Ingredient
        </Button>
      </CardFooter>
    </Card>
  );
}
