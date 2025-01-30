import { Link } from "wouter";
import { BookOpen, ShoppingCart } from "lucide-react";

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
