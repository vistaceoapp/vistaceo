import { useEffect, useRef } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
}

export const TypewriterText = ({ texts, className }: TypewriterTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef({ idx: 0, pos: 0, deleting: false, paused: false });

  useEffect(() => {
    const s = stateRef.current;
    let raf: number;
    let last = 0;

    const step = (ts: number) => {
      const speed = s.paused ? 5000 : s.deleting ? 80 : 120;
      if (ts - last < speed) { raf = requestAnimationFrame(step); return; }
      last = ts;

      const text = texts[s.idx];
      if (s.paused) { s.paused = false; s.deleting = true; }
      else if (!s.deleting) {
        if (s.pos < text.length) { s.pos++; }
        else { s.paused = true; }
      } else {
        if (s.pos > 0) { s.pos--; }
        else { s.deleting = false; s.idx = (s.idx + 1) % texts.length; }
      }
      if (textRef.current) textRef.current.textContent = texts[s.idx].slice(0, s.pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [texts]);

  return (
    <span
      className={`${className} relative inline-block whitespace-pre align-baseline`}
      style={{
        fontKerning: "normal",
        textRendering: "optimizeLegibility",
        lineHeight: 1.15,
        paddingBottom: "0.14em",
        minHeight: "1.15em",
        overflow: "visible",
      }}
    >
      <span ref={textRef} className="inline-block overflow-visible pr-[0.6ch]" />
      <span className="pointer-events-none absolute right-0 bottom-[0.14em] animate-pulse text-primary">|</span>
    </span>
  );
};
