import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

interface VistaceoLogoProps {
  className?: string;
  size?: number;
  variant?: "auto" | "full" | "compact" | "icon";
}

/**
 * SVG-based logo matching vistaceo.com/minimalista style.
 * Checkmark icon + "VISTACEO" wordmark in tracking-wide uppercase.
 * Uses currentColor so it adapts to light/dark themes.
 */
export const VistaceoLogo = React.forwardRef<SVGSVGElement, VistaceoLogoProps>(
  ({ className = "", size = 32, variant = "auto" }, ref) => {
    const isMobile = useIsMobile();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const isIcon = variant === "icon" || (variant === "auto" && isMobile);
    const textColor = isDark ? "#FFFFFF" : "#111111";
    const accentColor = "hsl(204, 72%, 50%)"; // --primary blue

    // Icon only — checkmark in a rounded shape
    if (isIcon) {
      return (
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="VistaCEO"
        >
          <rect width="40" height="40" rx="10" fill={accentColor} />
          <path
            d="M12 20.5L17.5 26L28 15"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    // Full wordmark — checkmark + "VISTACEO"
    const wordmarkWidth = Math.round(size * 5.5);

    return (
      <svg
        ref={ref}
        width={wordmarkWidth}
        height={size}
        viewBox="0 0 220 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="VistaCEO"
        style={{ height: size, width: "auto" }}
      >
        {/* Checkmark icon */}
        <rect width="32" height="32" x="0" y="4" rx="7" fill={accentColor} />
        <path
          d="M10 20L15 25L23 14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* VISTACEO text */}
        <text
          x="42"
          y="26"
          fill={textColor}
          fontFamily="'Codec Pro', 'Inter', system-ui, sans-serif"
          fontWeight="600"
          fontSize="18"
          letterSpacing="3"
        >
          VISTACEO
        </text>
      </svg>
    );
  }
);

VistaceoLogo.displayName = "VistaceoLogo";
