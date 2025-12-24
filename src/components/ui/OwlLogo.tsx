import logoImage from "@/assets/logo.png";

interface OwlLogoProps {
  className?: string;
  size?: number;
}

export const OwlLogo = ({ className = "", size = 32 }: OwlLogoProps) => {
  return (
    <img
      src={logoImage}
      alt="UCEO Logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};
