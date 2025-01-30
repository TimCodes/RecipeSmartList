import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Trash2 } from "lucide-react";
import type { ShoppingList } from "@/lib/types";

interface ShoppingListCardProps {
  list: ShoppingList;
  onUpdate: (list: ShoppingList) => void;
  onDelete: (id: number) => void;
}

export default function ShoppingListCard({ list, onUpdate, onDelete }: ShoppingListCardProps) {
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
