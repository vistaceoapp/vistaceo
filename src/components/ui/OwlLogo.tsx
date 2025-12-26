import logoRound from "@/assets/logo-round.png";
import logoFull from "@/assets/logo-full.png";
import logoWhite from "@/assets/logo-white.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

interface OwlLogoProps {
  className?: string;
  size?: number;
  variant?: "auto" | "round" | "full";
}

export const OwlLogo = ({ className = "", size = 32, variant = "auto" }: OwlLogoProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Determine which logo to show
  const showRound = variant === "round" || (variant === "auto" && isMobile);
  
  if (showRound) {
    return (
      <img
        src={logoRound}
        alt="Logo"
        width={size}
        height={size}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }

  // Full logo - use white version for dark mode
  const logoSrc = isDark ? logoWhite : logoFull;
  
  return (
    <img
      src={logoSrc}
      alt="Logo"
      height={size}
      className={className}
      style={{ height: size, width: 'auto', objectFit: 'contain' }}
    />
  );
};
