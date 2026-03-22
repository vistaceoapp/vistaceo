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
          "relative rounded-2xl transition-all duration-200",
          // Base styles — clean card, no heavy glass
          "bg-card border border-border/50 shadow-[var(--shadow-sm)]",
          // Variants
          variant === "elevated" && "shadow-[var(--shadow-md)] border-border",
          variant === "glow" && "border-primary/20 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.15)]",
          variant === "accent" && "border-accent/20 shadow-[0_0_24px_-8px_hsl(var(--accent)/0.15)]",
          // Interactive
          interactive && [
            "cursor-pointer",
            "hover:border-primary/30 hover:shadow-[var(--shadow-md)]",
            "hover:-translate-y-0.5",
            "active:translate-y-0 active:scale-[0.99]",
          ],
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
