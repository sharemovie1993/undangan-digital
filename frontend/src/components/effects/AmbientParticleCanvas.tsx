import React, { useEffect, useRef } from 'react';
import { ParticleEffectId } from '../../types';

interface AmbientParticleCanvasProps {
  effect?: ParticleEffectId;
  primaryColor?: string;
  isDark?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

export const AmbientParticleCanvas: React.FC<AmbientParticleCanvasProps> = ({
  effect = 'none',
  primaryColor = '#c4a661',
  isDark = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!effect || effect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Number of particles based on effect
    const particleCount = effect === 'gold_dust' ? 35 : effect === 'bokeh_glow' ? 18 : 22;

    const createParticle = (): Particle => {
      const w = canvas.width;
      const h = canvas.height;

      let color = primaryColor;
      let size = Math.random() * 2.5 + 1;
      let speedY = -(Math.random() * 0.4 + 0.15); // Float upward for dust
      let speedX = (Math.random() - 0.5) * 0.2;

      if (effect === 'jasmine_petals') {
        color = isDark ? '#ffffff' : '#f0fdf4';
        size = Math.random() * 5 + 4;
        speedY = Math.random() * 0.5 + 0.3; // Fall downward for petals
        speedX = (Math.random() - 0.5) * 0.5;
      } else if (effect === 'rose_petals') {
        color = isDark ? '#e11d48' : '#be123c';
        size = Math.random() * 6 + 4;
        speedY = Math.random() * 0.6 + 0.35;
        speedX = (Math.random() - 0.5) * 0.6;
      } else if (effect === 'bokeh_glow') {
        color = primaryColor;
        size = Math.random() * 20 + 12;
        speedY = -(Math.random() * 0.15 + 0.05);
        speedX = (Math.random() - 0.5) * 0.1;
      }

      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size,
        speedX,
        speedY,
        opacity: Math.random() * 0.6 + 0.2,
        fadeSpeed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.75 || p.opacity < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Boundary wrap
        if (p.y < -20) p.y = canvas.height + 10;
        if (p.y > canvas.height + 20) p.y = -10;
        if (p.x < -20) p.x = canvas.width + 10;
        if (p.x > canvas.width + 20) p.x = -10;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (effect === 'gold_dust') {
          // Circular stardust with soft glow
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else if (effect === 'bokeh_glow') {
          // Soft radial bokeh orb
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          // Petal shape (Jasmine / Rose)
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.2, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 3;
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [effect, primaryColor, isDark]);

  if (!effect || effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
    />
  );
};
