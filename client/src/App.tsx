import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/nav";
import NotFound from "@/pages/not-found";
import RecipeList from "@/pages/recipes/index";
import CreateRecipe from "@/pages/recipes/create";
import RecipeDetails from "@/pages/recipes/[id]";
import ShoppingLists from "@/pages/shopping-lists/index";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={RecipeList} />
          <Route path="/recipes/create" component={CreateRecipe} />
          <Route path="/recipes/:id" component={RecipeDetails} />
          <Route path="/shopping-lists" component={ShoppingLists} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
