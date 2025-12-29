import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export const ThemeToggle = React.forwardRef<
  HTMLButtonElement,
  { className?: string }
>(({ className }, ref) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative w-9 h-9 rounded-lg",
        "hover:bg-secondary",
        className
      )}
    >
      <Sun className={cn(
        "h-4 w-4 transition-all duration-300",
        theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "absolute h-4 w-4 transition-all duration-300",
        theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
      )} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
