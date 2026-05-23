import React, { useRef, useState, useEffect } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  onClick?: () => void;
  strength?: number; // pull multiplier (0 to 1)
  activationRadius?: number; // in pixels
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  id,
  className = "",
  onClick,
  strength = 0.45,
  activationRadius = 70
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      // Center coordinates
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from cursor to button center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < activationRadius) {
        setIsHovered(true);
        // Magnetic pull physics
        setPosition({
          x: deltaX * strength,
          y: deltaY * strength
        });
      } else {
        if (isHovered) {
          // Snap back instantly on exit
          setPosition({ x: 0, y: 0 });
          setIsHovered(false);
        }
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
      setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    buttonRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      buttonRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isHovered, activationRadius, strength]);

  return (
    <div
      ref={buttonRef}
      id={id}
      onClick={onClick}
      className={`relative inline-block cursor-pointer transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        willChange: "transform"
      }}
    >
      {/* Visual background capsule & light reflection */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-400 to-white opacity-10 blur-md transition-opacity duration-300 group-hover:opacity-25" />
      {children}
    </div>
  );
};
