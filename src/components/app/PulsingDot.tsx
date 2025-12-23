import { cn } from "@/lib/utils";

interface PulsingDotProps {
  variant?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PulsingDot = ({
  variant = "primary",
  size = "md",
  className,
}: PulsingDotProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  return (
    <span className={cn("relative flex", sizeClasses[size], className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          colorClasses[variant]
        )}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full h-full w-full",
          colorClasses[variant]
        )}
      />
    </span>
  );
};
