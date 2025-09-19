import { Button } from "@/components/ui/button";
import { Menu, Search, User } from "lucide-react";

export function Navigation() {
  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FE</span>
            </div>
            <span className="text-xl font-bold hero-text">FitExplorer</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#workouts" className="text-muted-foreground hover:text-foreground transition-colors">Workouts</a>
            <a href="#tools" className="text-muted-foreground hover:text-foreground transition-colors">Tools</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>

          {/* Search */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
