import { Crown, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProBadgeProps {
  variant?: "default" | "small" | "inline" | "locked";
  className?: string;
  showTooltip?: boolean;
}

export const ProBadge = ({ 
  variant = "default",
  className,
  showTooltip = true
}: ProBadgeProps) => {
  const isSmall = variant === "small";
  
  const content = (
    <>
      {variant === "locked" ? (
        <Badge 
          className={cn(
            "bg-warning/20",
            "border border-warning/30 text-warning",
            "font-semibold gap-1",
            className
          )}
        >
          <Lock className="w-3 h-3" />
          Pro
        </Badge>
      ) : variant === "inline" ? (
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
          "bg-gradient-to-r from-primary/20 to-accent/20",
          "text-primary border border-primary/20",
          className
        )}>
          <Sparkles className="w-2.5 h-2.5" />
          Pro
        </span>
      ) : (
        <Badge 
          className={cn(
            "bg-gradient-to-r from-primary to-accent text-primary-foreground",
            "font-semibold gap-1 border-0",
            isSmall && "text-[9px] px-1.5 py-0 h-4",
            className
          )}
        >
          <Crown className={cn("w-3 h-3", isSmall && "w-2.5 h-2.5")} />
          Pro
        </Badge>
      )}
    </>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>
            {variant === "locked" 
              ? "Función disponible con VistaCEO Pro" 
              : "Incluido en tu plan Pro"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
