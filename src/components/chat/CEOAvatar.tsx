import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";

interface CEOAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  isThinking?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 36, logoSize: 20 },
  md: { container: 48, logoSize: 28 },
  lg: { container: 64, logoSize: 36 },
  xl: { container: 80, logoSize: 44 },
};

export const CEOAvatar = ({
  size = "md",
  isThinking = false,
  isSpeaking = false,
  className,
}: CEOAvatarProps) => {
  const dimensions = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex-shrink-0 rounded-2xl gradient-primary flex items-center justify-center",
        isSpeaking && "animate-pulse",
        isThinking && "opacity-80",
        className
      )}
      style={{
        width: dimensions.container,
        height: dimensions.container,
        boxShadow: isSpeaking 
          ? "0 0 24px hsl(204 79% 50% / 0.4)" 
          : "0 4px 16px -4px hsl(204 79% 50% / 0.3)",
      }}
    >
      <VistaceoLogo size={dimensions.logoSize} variant="icon" />
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
