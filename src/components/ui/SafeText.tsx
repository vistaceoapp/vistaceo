/**
 * SAFE TEXT RENDERER — P0 ZERO LEAKAGE
 * 
 * Capa 4: Todo texto visible pasa por este componente obligatorio.
 * Sanitiza patrones prohibidos, traduce inglés suelto,
 * y garantiza que nunca se muestre basura técnica al usuario.
 */

import React, { useMemo } from "react";
import { sanitizeForUI, humanLabel, isProhibitedContent, NEUTRAL_FALLBACKS } from "@/lib/presentationRegistry";

interface SafeTextProps {
  /** The text to render safely */
  children: string | null | undefined;
  /** If true, treat as an internal key and look up its human label */
  asLabel?: boolean;
  /** Fallback text if content is empty or prohibited */
  fallback?: string;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Additional className */
  className?: string;
  /** Additional HTML props */
  [key: string]: any;
}

/**
 * SafeText: Renders text safely, sanitizing internal codes and translating raw values.
 * 
 * Usage:
 *   <SafeText>{item.category}</SafeText>
 *   <SafeText asLabel>{item.status}</SafeText>
 *   <SafeText fallback="Sin datos">{item.description}</SafeText>
 */
export const SafeText: React.FC<SafeTextProps> = ({
  children,
  asLabel = false,
  fallback,
  as: Component = "span",
  className,
  ...props
}) => {
  const safeContent = useMemo(() => {
    if (children === null || children === undefined || children === "") {
      return fallback || "";
    }
    
    const text = String(children);
    
    // If treating as internal key, do full label lookup
    if (asLabel) {
      return humanLabel(text);
    }
    
    // If the entire text is a prohibited pattern, replace entirely
    if (isProhibitedContent(text) && text.length < 50) {
      return fallback || NEUTRAL_FALLBACKS.label;
    }
    
    // Otherwise sanitize inline
    return sanitizeForUI(text);
  }, [children, asLabel, fallback]);

  if (!safeContent) return null;

  // Remove custom props before passing to DOM
  const { asLabel: _, fallback: __, as: ___, ...domProps } = props;

  return React.createElement(
    Component,
    { className, ...domProps },
    safeContent
  );
};

/**
 * Hook for safe text rendering in complex scenarios.
 * Returns the sanitized string.
 */
export function useSafeText(text: string | null | undefined, options?: { asLabel?: boolean; fallback?: string }): string {
  return useMemo(() => {
    if (!text) return options?.fallback || "";
    if (options?.asLabel) return humanLabel(text);
    if (isProhibitedContent(text) && text.length < 50) return options?.fallback || NEUTRAL_FALLBACKS.label;
    return sanitizeForUI(text);
  }, [text, options?.asLabel, options?.fallback]);
}

export default SafeText;
