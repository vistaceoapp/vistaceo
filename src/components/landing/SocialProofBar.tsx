import { motion } from "framer-motion";
import { Users, TrendingUp, Globe2, Zap } from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "negocios activos" },
  { icon: TrendingUp, value: "+32%", label: "crecimiento promedio" },
  { icon: Globe2, value: "9", label: "países" },
  { icon: Zap, value: "24/7", label: "inteligencia activa" },
];

export const SocialProofBar = () => {
  return (
    <div className="w-full overflow-hidden bg-secondary/50 border-y border-border py-3">
      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {[...stats, ...stats, ...stats].map((stat, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{stat.value}</span>
            <span className="text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
