import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glow" | "accent";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          // Base styles
          "bg-card/80 backdrop-blur-xl border border-border/50",
          // Variants
          variant === "elevated" && "bg-card border-border shadow-lg shadow-background/50",
          variant === "glow" && "border-primary/30 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]",
          variant === "accent" && "border-accent/30 shadow-[0_0_30px_-10px_hsl(var(--accent)/0.3)]",
          // Interactive
          interactive && [
            "cursor-pointer",
            "hover:border-primary/40 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)]",
            "hover:translate-y-[-2px]",
            "active:translate-y-0 active:scale-[0.99]",
          ],
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
