import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildSignupHref } from "@/lib/promo/utm";
import { getActiveCTA } from "@/lib/promo/variants";

interface PromoHeaderProps {
  onCtaClick?: () => void;
}

export const PromoHeader = ({ onCtaClick }: PromoHeaderProps) => {
  const ctaLabel = getActiveCTA();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 w-full transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,10,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo wordmark in white */}
        <Link to="/promo" className="flex items-center gap-2" aria-label="VISTACEO">
          <span
            className="text-white font-bold tracking-[0.18em] text-[15px] sm:text-[16px]"
            style={{ fontFamily: "'Codec Pro', 'Inter', system-ui, sans-serif" }}
          >
            VISTACEO
          </span>
        </Link>

        {/* Center trust badge */}
        <div className="hidden md:flex items-center gap-2 text-[12px] text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C4B4]" />
            Gratis · Sin tarjeta · En minutos
          </span>
        </div>

        {/* Right: ONLY signup CTA — no "Ingresar" link */}
        <Link
          to={buildSignupHref()}
          onClick={onCtaClick}
          className="inline-flex items-center justify-center px-4 sm:px-5 rounded-lg text-[13px] sm:text-[13.5px] font-semibold text-white whitespace-nowrap transition-all hover:brightness-110"
          style={{
            height: 38,
            background: "linear-gradient(135deg, #6C63FF 0%, #00C4B4 100%)",
            boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
          }}
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
};
