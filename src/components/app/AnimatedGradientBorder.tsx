import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface AnimatedGradientBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  borderWidth?: number;
  speed?: "slow" | "normal" | "fast";
}

export const AnimatedGradientBorder = ({
  children,
  className,
  borderWidth = 2,
  speed = "normal",
  ...props
}: AnimatedGradientBorderProps) => {
  const speedClasses = {
    slow: "animate-[spin_8s_linear_infinite]",
    normal: "animate-[spin_4s_linear_infinite]",
    fast: "animate-[spin_2s_linear_infinite]",
  };

  return (
    <div className={cn("relative group", className)} {...props}>
      {/* Animated gradient border */}
      <div
        className={cn(
          "absolute -inset-px rounded-2xl opacity-75 blur-[2px] group-hover:opacity-100 transition-opacity duration-300",
          speedClasses[speed]
        )}
        style={{
          background: "conic-gradient(from 0deg, hsl(271, 91%, 65%), hsl(217, 91%, 60%), hsl(280, 87%, 58%), hsl(271, 91%, 65%))",
          padding: borderWidth,
        }}
      />
      
      {/* Inner content */}
      <div className="relative bg-card rounded-2xl">{children}</div>
    </div>
  );
};
