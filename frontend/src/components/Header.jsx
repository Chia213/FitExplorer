import { Button } from "./ui/button";
import { Menu, X, Search, Dumbbell, Wrench, HelpCircle, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme() || { theme: 'dark', toggleTheme: () => {} };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center border-2 border-primary/20">
              <span className="text-white font-bold text-sm">FE</span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#workouts" className="flex items-center gap-2 text-foreground">
              <Dumbbell className="w-4 h-4" />
              <span>Workouts</span>
            </a>
            <a href="#tools" className="flex items-center gap-2 text-foreground">
              <Wrench className="w-4 h-4" />
              <span>Tools</span>
            </a>
            <a href="#help" className="flex items-center gap-2 text-foreground">
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <a 
              href="#workouts" 
              className="flex items-center gap-2 text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Workouts</span>
            </a>
            <a 
              href="#tools" 
              className="flex items-center gap-2 text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              <Wrench className="w-4 h-4" />
              <span>Tools</span>
            </a>
            <a 
              href="#help" 
              className="flex items-center gap-2 text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-foreground py-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button variant="hero" size="sm">
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
