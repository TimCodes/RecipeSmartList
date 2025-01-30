import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { Link } from "wouter";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: number) => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              <Link href={`/recipes/${recipe.id}`} className="hover:underline">
                {recipe.name}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {recipe.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          {recipe.prepTime && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{recipe.prepTime + (recipe.cookTime || 0)} mins</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      {onDelete && (
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => onDelete(recipe.id)}
            className="w-full"
          >
            Delete Recipe
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
