import { useEffect, useState, useRef } from "react";

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

  // Format number with dots for thousands
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-ES");
  };

  return (
    <div 
      ref={ref}
      className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm"
    >
      {/* Live indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <span className="text-xs font-semibold text-success uppercase tracking-wide">En vivo</span>
      </div>

      {/* Avatars */}
      <div className="flex -space-x-2">
        {[
          "👩🏻‍💼", "👨🏽‍💻", "👩🏾‍🔧", "👨🏼‍🍳", "👩🏻‍⚕️"
        ].map((emoji, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-sm"
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-gradient-primary tabular-nums">
          {formatNumber(count)}
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-primary">+</span>
      </div>

      {/* Label */}
      <span className="text-sm text-muted-foreground hidden sm:block">
        {label}
      </span>
    </div>
  );
};
