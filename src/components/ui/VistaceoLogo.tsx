import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

// Brand assets
import iconBrand from "@/assets/brand/icon-vistaceo-new.webp";

interface VistaceoLogoProps {
  className?: string;
  size?: number;
  variant?: "auto" | "full" | "compact" | "icon";
}

/**
 * VistaCEO logo — uses the official brand icon + "VISTACEO" wordmark.
 * Icon variant shows only the brand icon.
 * Full variant shows icon + text.
 */
export const VistaceoLogo = React.forwardRef<HTMLDivElement, VistaceoLogoProps>(
  ({ className = "", size = 32, variant = "auto" }, ref) => {
    const isMobile = useIsMobile();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const isIcon = variant === "icon" || (variant === "auto" && isMobile);
    const textColor = isDark ? "#FFFFFF" : "#111111";

    // Icon only
    if (isIcon) {
      return (
        <div ref={ref} className={className}>
          <img
            src={iconBrand}
            alt="VistaCEO"
            width={size}
            height={size}
            style={{ width: size, height: size, objectFit: "contain" }}
          />
        </div>
      );
    }

    // Full wordmark — icon + "VISTACEO" text
    return (
      <div
        ref={ref}
        className={className}
        style={{ display: "flex", alignItems: "center", gap: size * 0.25, height: size }}
      >
        <img
          src={iconBrand}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
        />
        <span
          style={{
            color: textColor,
            fontFamily: "'Codec Pro', 'Inter', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: size * 0.5,
            letterSpacing: size * 0.08,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          VISTACEO
        </span>
      </div>
    );
  }
);

VistaceoLogo.displayName = "VistaceoLogo";
