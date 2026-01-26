import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface LiveCounterProps {
  targetNumber: number;
  label: string;
}

export const LiveCounter = ({ targetNumber, label }: LiveCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = targetNumber / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, targetNumber]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50"
    >
      {/* Live dot */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Live</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border/50" />

      {/* Mini avatars */}
      <div className="flex -space-x-1.5">
        {["👩🏻‍💼", "👨🏽‍💻", "👩🏾‍🔧", "👨🏼‍🍳"].map((emoji, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="w-6 h-6 rounded-full bg-secondary/80 border border-card flex items-center justify-center text-[10px]"
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Counter */}
      <span className="text-sm font-bold text-foreground tabular-nums">
        {count}+
      </span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {label}
      </span>
    </motion.div>
  );
};
