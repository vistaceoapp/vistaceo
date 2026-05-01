import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buildSignupHref } from "@/lib/promo/utm";
import { getActiveCTA } from "@/lib/promo/variants";

interface Props {
  onClick?: () => void;
}

export const PromoStickyCTA = ({ onClick }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-3 mb-2 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e8ebf2] shadow-[0_-8px_30px_-8px_rgba(38,40,80,0.2)] p-3">
        <Link
          to={buildSignupHref()}
          onClick={onClick}
          className="w-full inline-flex items-center justify-center h-12 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #2692DC 0%, #746CE6 100%)" }}
        >
          {getActiveCTA()}
        </Link>
        <p className="text-center text-[11.5px] text-[#6b7283] mt-1.5">
          Gratis · Sin tarjeta
        </p>
      </div>
    </div>
  );
};
