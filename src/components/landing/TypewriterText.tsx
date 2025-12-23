import { useEffect, useState } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
}

export const TypewriterText = ({ texts, className }: TypewriterTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentIndex];
    const timeout = isDeleting ? 50 : 100;

    if (!isDeleting && currentText === text) {
      // Pause before deleting
      const pauseTimeout = setTimeout(() => setIsDeleting(true), 2000);
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
    }, timeout);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, texts]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
};
