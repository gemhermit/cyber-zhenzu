import { useEffect, useRef } from 'react';

const GLYPHS = ['祖', '考', '妣', '祀', '魂', '魄', '祥', '瑞', '福', '禄', '寿', '祈', '祀', '祖', '德', '福', '善', '和', '安', '宁'];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      glyph: string;
      speed: number;
      opacity: number;
      size: number;
      drift: number;
      driftSpeed: number;
      time: number;

      constructor(canvas: HTMLCanvasElement) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        this.speed = 0.2 + Math.random() * 0.4;
        this.opacity = 0.02 + Math.random() * 0.04;
        this.size = 14 + Math.random() * 20;
        this.drift = (Math.random() - 0.5) * 0.3;
        this.driftSpeed = Math.random() * 0.002;
        this.time = Math.random() * Math.PI * 2;
      }

      update(canvas: HTMLCanvasElement) {
        this.y -= this.speed;
        this.time += this.driftSpeed;
        this.x += Math.sin(this.time) * this.drift;
        if (this.y < -this.size) {
          this.y = canvas.height + this.size;
          this.x = Math.random() * canvas.width;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.font = `${this.size}px "ZCOOL XiaoWei", serif`;
        ctx.fillStyle = `rgba(230, 57, 70, ${this.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.glyph, this.x, this.y);
        ctx.restore();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 30 }, () => new Particle(canvas));
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(canvas);
        p.draw(ctx);
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
