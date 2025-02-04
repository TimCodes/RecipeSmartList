import { Link } from "wouter";
import { BookOpen, ShoppingCart, Apple } from "lucide-react";

export default function Nav() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">Recipe Book</span>
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Recipes
          </Link>
          <Link 
            href="/ingredients"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <div className="flex items-center space-x-1">
              <Apple className="h-4 w-4" />
              <span>Ingredients</span>
            </div>
          </Link>
          <Link 
            href="/shopping-lists"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Shopping Lists
          </Link>
        </div>
      </div>
    </nav>
  );
}