import { Info, HelpCircle, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string;
  title?: string;
  variant?: "info" | "tip" | "help";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export const HelpTooltip = ({ 
  content, 
  title,
  variant = "info", 
  side = "top",
  className 
}: HelpTooltipProps) => {
  const Icon = variant === "tip" ? Lightbulb : variant === "help" ? HelpCircle : Info;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            className={cn(
              "inline-flex items-center justify-center transition-colors",
              variant === "tip" && "text-warning hover:text-warning/80",
              variant === "help" && "text-primary hover:text-primary/80",
              variant === "info" && "text-muted-foreground hover:text-foreground",
              className
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[280px] p-3">
          {title && (
            <p className="font-semibold text-foreground mb-1 text-sm">{title}</p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Inline tip component for contextual help
export const InlineTip = ({ 
  children, 
  icon = "tip" 
}: { 
  children: React.ReactNode;
  icon?: "tip" | "info";
}) => {
  const Icon = icon === "tip" ? Lightbulb : Info;
  
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
};

// Empty state with helpful guidance
export const EmptyStateWithTip = ({
  icon: Icon,
  title,
  description,
  tip,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tip?: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-12 px-6">
    <div className="relative inline-block mb-4">
      <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
      <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-sm mx-auto mb-4">{description}</p>
    {tip && (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/5 border border-primary/10 mb-4">
        <Lightbulb className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-muted-foreground">{tip}</span>
      </div>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
