interface OwlLogoProps {
  className?: string;
  size?: number;
}

export const OwlLogo = ({ className = "", size = 32 }: OwlLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="owlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(271, 91%, 65%)" />
          <stop offset="100%" stopColor="hsl(280, 87%, 58%)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Circular background */}
      <rect 
        x="0" 
        y="0" 
        width="40" 
        height="40" 
        rx="12" 
        fill="url(#owlGradient)"
      />
      
      {/* U shape that forms owl body */}
      <path
        d="M12 12 L12 24 C12 29 16 32 20 32 C24 32 28 29 28 24 L28 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />
      
      {/* Left owl eye */}
      <circle
        cx="15.5"
        cy="17"
        r="3.5"
        fill="white"
      />
      <circle
        cx="16"
        cy="16.5"
        r="1.5"
        fill="hsl(271, 91%, 45%)"
      />
      
      {/* Right owl eye */}
      <circle
        cx="24.5"
        cy="17"
        r="3.5"
        fill="white"
      />
      <circle
        cx="25"
        cy="16.5"
        r="1.5"
        fill="hsl(271, 91%, 45%)"
      />
      
      {/* Small beak/triangle */}
      <path
        d="M20 21 L18.5 24 L21.5 24 Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Owl ear tufts */}
      <path
        d="M11 12 L13 8 L15 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M25 12 L27 8 L29 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
