import React, { useEffect, useRef } from "react";

export const DotMeshBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Grid configuration
    const spacing = 45; // Pixels between dots
    const neonColors = [
      { r: 0, g: 243, b: 255 },   // Cyan
      { r: 255, g: 0, b: 127 },   // Magenta
      { r: 0, g: 255, b: 102 },   // Neon Green
      { r: 255, g: 183, b: 0 },   // Electric Gold
      { r: 157, g: 0, b: 255 },   // Violet
      { r: 239, g: 68, b: 68 },   // Crimson Red
    ];

    let dots: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      r: number;
      g: number;
      b: number;
      phase: number;
      twinkleSpeed: number;
      maxOpacity: number;
      baseRadius: number;
    }> = [];

    const initDots = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots = [];

      for (let x = spacing / 2; x < width + spacing; x += spacing) {
        for (let y = spacing / 2; y < height + spacing; y += spacing) {
          const color = neonColors[Math.floor(Math.random() * neonColors.length)];
          dots.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            r: color.r,
            g: color.g,
            b: color.b,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            maxOpacity: 0.18 + Math.random() * 0.45,
            baseRadius: 1.0 + Math.random() * 0.8,
          });
        }
      }
    };

    initDots();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    };

    const handleResize = () => {
      initDots();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse coordinates for fluid tracking
      const mouse = mouseRef.current;
      if (mouse.targetX !== -9999) {
        if (mouse.x === -9999) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.15;
          mouse.y += (mouse.targetY - mouse.y) * 0.15;
        }
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      const repelRadius = 140; // Area of effect
      const repelForceMax = 45; // Maximum displacement distance

      // Render & update dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // 1. Calculate repulsion from mouse
        let forceX = 0;
        let forceY = 0;

        if (mouse.x !== -9999) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < repelRadius) {
            // Stronger force the closer the mouse is
            const influence = (repelRadius - dist) / repelRadius;
            const force = influence * repelForceMax;
            
            // Normalize direction vector
            const angle = Math.atan2(dy, dx);
            forceX = Math.cos(angle) * force;
            forceY = Math.sin(angle) * force;
          }
        }

        // 2. Physics solver (spring return to base)
        const springK = 0.08; // Spring tension
        const damping = 0.85;  // Friction coefficient

        // Force to pull back to home coordinates
        const springX = (dot.baseX - dot.x) * springK;
        const springY = (dot.baseY - dot.y) * springK;

        // Accelerations
        const ax = springX + forceX * 0.2;
        const ay = springY + forceY * 0.2;

        // Apply velocities
        dot.vx = (dot.vx + ax) * damping;
        dot.vy = (dot.vy + ay) * damping;

        // Apply step
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Apply custom repelling limits
        if (mouse.x !== -9999) {
          const dxBase = dot.baseX - mouse.x;
          const dyBase = dot.baseY - mouse.y;
          const distBase = Math.sqrt(dxBase * dxBase + dyBase * dyBase);
          if (distBase < repelRadius) {
            const ratio = (repelRadius - distBase) / repelRadius;
            const targetRepelX = dot.baseX + (dxBase / (distBase || 1)) * ratio * repelForceMax;
            const targetRepelY = dot.baseY + (dyBase / (distBase || 1)) * ratio * repelForceMax;
            
            // Gently blend inside the active area
            dot.x += (targetRepelX - dot.x) * 0.1;
            dot.y += (targetRepelY - dot.y) * 0.1;
          }
        }

        // Calculate periodic star twinkling factor
        dot.phase += dot.twinkleSpeed;
        const twinkleFactor = 0.2 + 0.8 * (Math.sin(dot.phase) + 1) / 2;
        let finalOpacity = dot.maxOpacity * twinkleFactor;
        let radius = dot.baseRadius;

        // Interactive mouse distance flare and scaling
        if (mouse.x !== -9999) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const ratio = (140 - dist) / 140;
            // Flare up the opacity and radius to look like an active stellar cloud
            finalOpacity = Math.min(1.0, finalOpacity + ratio * 0.7);
            radius = dot.baseRadius + ratio * 1.8;
          }
        }

        ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      id="dots-mesh-canvas"
    />
  );
};
