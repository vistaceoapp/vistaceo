import { useEffect, useState } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
}

export const TypewriterText = ({ texts, className }: TypewriterTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const text = texts[currentIndex];
    // Much slower typing speeds
    const typingSpeed = isDeleting ? 80 : 120;

    if (!isDeleting && currentText === text) {
      // Long pause before deleting (5 seconds)
      setIsPaused(true);
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 5000);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentText((prev) =>
        isDeleting ? prev.slice(0, -1) : text.slice(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, texts, isPaused]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
};
