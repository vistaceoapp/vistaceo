import { memo } from "react";
import logoIcon from "@/assets/brand/logo-icon.png";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with pulse animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="relative w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <img 
              src={logoIcon} 
              alt="VistaCEO" 
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
        
        {/* Brand name */}
        <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
          VistaCEO
        </h1>
        
        {/* Loading text */}
        <p className="text-sm text-muted-foreground mb-6">
          Preparando tu experiencia...
        </p>
        
        {/* Progress bar */}
        <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-primary rounded-full animate-loading-progress" />
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
export default LoadingScreen;
