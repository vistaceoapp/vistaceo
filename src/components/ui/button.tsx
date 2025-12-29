import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - VISTACEO Gradient
        default: "gradient-primary text-white hover:opacity-90 shadow-sm hover:shadow-md",
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Outline - Subtle border
        outline: "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-primary/40",
        // Secondary - Surface background
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Ghost
        ghost: "hover:bg-secondary hover:text-foreground",
        // Link
        link: "text-primary underline-offset-4 hover:underline",
        // VISTACEO Premium variants
        hero: "gradient-primary text-white hover:opacity-90 shadow-md hover:shadow-lg font-semibold",
        heroOutline: "border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/5 hover:border-primary/50 font-semibold",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md",
        glass: "bg-card/60 backdrop-blur-md border border-border/50 text-foreground hover:bg-card/80 hover:border-primary/30",
        // Tertiary - Minimal
        tertiary: "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
