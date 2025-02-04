import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Minus } from "lucide-react";
import type { RecipeFormData } from "@/lib/types";

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => void;
  isSubmitting?: boolean;
}

export default function RecipeForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting 
}: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    defaultValues: {
      name: "",
      description: "",
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      tags: [],
      ingredients: [{ name: "", quantity: 1, unit: "" }],
      instructions: [""],
      nutrition: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        vitamins: {},
        minerals: {}
      },
      ...defaultValues,
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({
      control: form.control,
      name: "ingredients",
    });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = 
    useFieldArray({
      control: form.control,
      name: "instructions",
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (mins)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="nutrition">
            <AccordionTrigger>Nutritional Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nutrition.calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition.protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition.carbohydrates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbohydrates (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition.fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nutrition.fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiber (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="vitamins">
                    <AccordionTrigger>Vitamins</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {['a', 'c', 'd', 'e', 'k', 'b1', 'b2', 'b3', 'b6', 'b12'].map((vitamin) => (
                          <FormField
                            key={vitamin}
                            control={form.control}
                            name={`nutrition.vitamins.${vitamin}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vitamin {vitamin.toUpperCase()} (mg)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="minerals">
                    <AccordionTrigger>Minerals</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {['calcium', 'iron', 'magnesium', 'potassium', 'zinc'].map((mineral) => (
                          <FormField
                            key={mineral}
                            control={form.control}
                            name={`nutrition.minerals.${mineral}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{mineral.charAt(0).toUpperCase() + mineral.slice(1)} (mg)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <h3 className="text-lg font-medium mb-4">Ingredients</h3>
          <div className="space-y-4">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex gap-4">
                <FormField
                  control={form.control}
                  name={`ingredients.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder="Ingredient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredients.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.1" 
                          placeholder="Qty"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`ingredients.${index}.unit`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input placeholder="Unit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient({ name: "", quantity: 1, unit: "" })}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Instructions</h3>
          <div className="space-y-4">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex gap-4">
                <FormField
                  control={form.control}
                  name={`instructions.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input 
                          placeholder={`Step ${index + 1}`}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendInstruction("")}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Recipe"}
        </Button>
      </form>
    </Form>
  );
}