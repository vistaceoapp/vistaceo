import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/route-prefetch";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, onMouseEnter, onFocus, onTouchStart, ...props }, ref) => {
    // Precarga el chunk de la ruta apenas hay intención de navegar (hover/focus/touch).
    const warm = useCallback(() => {
      if (typeof to === "string") prefetchRoute(to);
    }, [to]);

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onMouseEnter={(e) => { warm(); onMouseEnter?.(e); }}
        onFocus={(e) => { warm(); onFocus?.(e); }}
        onTouchStart={(e) => { warm(); onTouchStart?.(e); }}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);


NavLink.displayName = "NavLink";

export { NavLink };
