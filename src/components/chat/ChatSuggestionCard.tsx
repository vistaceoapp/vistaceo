import { cn } from "@/lib/utils";

interface ChatSuggestionCardProps {
  icon: string;
  title: string;
  category: string;
  onClick: () => void;
  index: number;
  disabled?: boolean;
}

export const ChatSuggestionCard = ({
  icon,
  title,
  category,
  onClick,
  disabled,
}: ChatSuggestionCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full text-left",
        "rounded-xl p-4",
        "bg-card border border-border",
        "hover:border-primary/30 hover:shadow-md hover:bg-secondary/30",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:pointer-events-none",
        "animate-fade-in"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {title}
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">
            {category}
          </span>
        </div>
      </div>
    </button>
  );
};
