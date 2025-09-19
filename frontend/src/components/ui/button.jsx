import React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = (variant, size) => {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    // Fitness-themed variants
    hero: "gradient-primary text-white font-semibold shadow-glow hover:scale-105 transform transition-all duration-300 border-0",
    feature: "gradient-feature text-foreground border border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300",
    accent: "gradient-accent text-white font-medium hover:scale-105 transform transition-all duration-300",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    xl: "h-14 rounded-xl px-12 text-lg",
    icon: "h-10 w-10",
  };
  
  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default);
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? "div" : "button";
  return (
    <Comp 
      className={cn(buttonVariants(variant, size), className)} 
      ref={ref} 
      {...props}
    >
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button };