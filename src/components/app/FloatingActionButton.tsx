import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "accent";
  size?: "sm" | "md" | "lg";
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, children, loading, variant = "primary", size = "md", disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-14 h-14",
      lg: "w-16 h-16",
    };

    const variantClasses = {
      primary: "gradient-primary hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.5)]",
      accent: "gradient-accent hover:shadow-[0_0_40px_-5px_hsl(var(--accent)/0.5)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "rounded-full flex items-center justify-center",
          "shadow-lg shadow-primary/20",
          "transition-all duration-300",
          "hover:scale-110 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
        ) : (
          <span className="text-primary-foreground">{children}</span>
        )}
      </button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";
