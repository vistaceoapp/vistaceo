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
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        paddingTop: 10,
      }}
    >
      <div className="px-4">
        <Link
          to={buildSignupHref()}
          onClick={onClick}
          className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] font-bold text-white"
          style={{
            height: 48,
            fontSize: 15.5,
            background: "linear-gradient(135deg, #6C63FF 0%, #00C4B4 100%)",
            boxShadow: "0 6px 20px rgba(108,99,255,0.45)",
          }}
        >
          {getActiveCTA()} →
        </Link>
        <p className="text-center text-[11px] text-white/55 mt-1.5">
          Gratis · Sin tarjeta · Negocio, servicio o profesión
        </p>
      </div>
    </div>
  );
};
