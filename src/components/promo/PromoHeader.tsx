import { Link } from "react-router-dom";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { buildSignupHref, buildLoginHref } from "@/lib/promo/utm";
import { getActiveCTA } from "@/lib/promo/variants";

interface PromoHeaderProps {
  onCtaClick?: () => void;
}

export const PromoHeader = ({ onCtaClick }: PromoHeaderProps) => {
  const ctaLabel = getActiveCTA();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-[#eef0f4]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link to="/promo" className="flex items-center" aria-label="VISTACEO">
          <VistaceoLogo size={32} variant="full" />
        </Link>

        <div className="hidden md:flex items-center gap-2 text-[12.5px] text-[#5b6271]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Gratis · Sin tarjeta · En minutos
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={buildLoginHref()}
            className="text-[13px] sm:text-[13.5px] text-[#4a5160] hover:text-[#0a0a0a] transition-colors px-2 py-1"
          >
            Ingresar
          </Link>
          <Link
            to={buildSignupHref()}
            onClick={onCtaClick}
            className="inline-flex items-center justify-center h-9 sm:h-10 px-3.5 sm:px-5 rounded-full text-[13px] sm:text-[13.5px] font-semibold text-white shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #2692DC 0%, #746CE6 100%)",
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
};
