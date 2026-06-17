import React, { useRef, useState, MouseEvent } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "cyan" | "default";
  customSize?: boolean;
  intensity?: "low" | "medium" | "high";
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  customSize = true,
  intensity = "medium",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Map color to radial gradient color stop
  const getGlowColor = () => {
    switch (glowColor) {
      case "blue":
        return "rgba(0, 240, 255, 0.08)";
      case "purple":
        return "rgba(183, 0, 255, 0.08)";
      case "cyan":
        return "rgba(0, 255, 255, 0.08)";
      default:
        return "rgba(255, 255, 255, 0.05)";
    }
  };

  const glowStyle = isFocused
    ? ({
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`,
        "--glow-color": getGlowColor(),
      } as React.CSSProperties)
    : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      style={glowStyle}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/20 hover:scale-[1.01] ${
        customSize ? "w-full max-w-[500px] h-[300px]" : ""
      } ${className}`}
    >
      {/* Subtle spotlight glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 80%)`,
          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* Subtle reflection effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.03), transparent 60%)`,
          opacity: isFocused ? 1 : 0,
        }}
      />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
