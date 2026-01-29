import { memo } from "react";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      {/* Ultra minimal - just 3 pulsing dots */}
      <div className="flex items-center gap-1.5">
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: '150ms' }}
        />
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
export default LoadingScreen;
