import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function Logo({
  size = "md",
  className = "",
  onClick,
  clickable = false,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-10",
    md: "h-16",
    lg: "h-20",
    xl: "h-24",
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    } else if (clickable) {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        window.location.href = "/swipe";
      }
    }
  };

  return (
    <div
      className={`font-bold ${
        clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
      } ${className}`}
      onClick={handleClick}
    >
      <div className={`${sizeClasses[size]} w-32 relative overflow-hidden`}>
        <Image
          src="/logo.png"
          alt="ReUse Logo"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 200px, 300px"
        />
      </div>
    </div>
  );
}
