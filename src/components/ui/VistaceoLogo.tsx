import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

// Brand assets
import logoLightFull from "@/assets/brand/logo-light-full.png";
import logoLightCompact from "@/assets/brand/logo-light-compact.png";
import logoDarkFull from "@/assets/brand/logo-dark-full.png";
import iconLight from "@/assets/brand/icon-light.png";
import iconDark from "@/assets/brand/icon-dark.png";

interface VistaceoLogoProps {
  className?: string;
  size?: number;
  variant?: "auto" | "full" | "compact" | "icon";
}

export const VistaceoLogo = React.forwardRef<HTMLImageElement, VistaceoLogoProps>(
  ({ className = "", size = 32, variant = "auto" }, ref) => {
    const isMobile = useIsMobile();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Determine which logo to show based on variant and screen size
    const getLogoSrc = () => {
      // Icon variant - always use icon
      if (variant === "icon") {
        return isDark ? iconDark : iconLight;
      }

      // Auto variant - responsive based on screen size
      if (variant === "auto") {
        if (isMobile) {
          return isDark ? iconDark : iconLight;
        }
        return isDark ? logoDarkFull : logoLightFull;
      }

      // Full variant - full logo with text
      if (variant === "full") {
        return isDark ? logoDarkFull : logoLightFull;
      }

      // Compact variant - stacked logo
      if (variant === "compact") {
        return isDark ? logoDarkFull : logoLightCompact;
      }

      return isDark ? logoDarkFull : logoLightFull;
    };

    const logoSrc = getLogoSrc();
    const isIcon = variant === "icon" || (variant === "auto" && isMobile);

    if (isIcon) {
      return (
        <img
          ref={ref}
          src={logoSrc}
          alt="vistaceo"
          width={size}
          height={size}
          className={className}
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      );
    }

    return (
      <img
        ref={ref}
        src={logoSrc}
        alt="vistaceo"
        height={size}
        className={className}
        style={{ height: size, width: "auto", objectFit: "contain" }}
      />
    );
  }
);

VistaceoLogo.displayName = "VistaceoLogo";
