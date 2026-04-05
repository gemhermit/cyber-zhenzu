import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { PAPER_OFFERING_LABELS } from '../../data/demo';
import type { PaperOffering } from '../../types';

const PAPER_TYPES: PaperOffering['type'][] = [
  'gold_ingot', 'silver_ingot', 'spirit_money', 'spirit_clothes', 'spirit_house',
];

const PAPER_EMOJIS: Record<PaperOffering['type'], string> = {
  gold_ingot: '🏆',
  silver_ingot: '🥈',
  spirit_money: '💰',
  spirit_clothes: '👘',
  spirit_house: '🏠',
};

export default function PaperOfferingsView() {
  const { paperOfferings, addPaperOffering, burnPaperOffering } = useStore();
  const [showBurning, setShowBurning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fire canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;

    let animId: number;
    let particles: FireParticle[] = [];

    class FireParticle {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number;
      hue: number;

      constructor(canvas: HTMLCanvasElement, x: number) {
        this.x = x + (Math.random() - 0.5) * 60;
        this.y = canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -2 - Math.random() * 3;
        this.life = 1;
        this.maxLife = 0.5 + Math.random() * 0.5;
        this.size = 8 + Math.random() * 16;
        this.hue = 20 + Math.random() * 30;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy *= 0.99;
        this.life -= 0.02 / this.maxLife;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * this.life);
        grad.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.life * 0.8})`);
        grad.addColorStop(0.5, `hsla(${this.hue - 10}, 100%, 50%, ${this.life * 0.4})`);
        grad.addColorStop(1, `hsla(${this.hue - 20}, 100%, 30%, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    const burningItems = paperOfferings.filter((p) => p.burning);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background glow
      if (showBurning) {
        const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height, 0, canvas.width / 2, canvas.height, canvas.width / 2);
        bgGrad.addColorStop(0, 'rgba(230,57,70,0.15)');
        bgGrad.addColorStop(1, 'rgba(230,57,70,0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Spawn fire particles
      if (showBurning && Math.random() < 0.4) {
        particles.push(new FireParticle(canvas, canvas.width / 2));
        particles.push(new FireParticle(canvas, canvas.width / 2 - 30));
        particles.push(new FireParticle(canvas, canvas.width / 2 + 30));
      }

      // Ember particles
      if (showBurning && Math.random() < 0.15) {
        const ep = new FireParticle(canvas, canvas.width / 2 + (Math.random() - 0.5) * 80);
        ep.vy = -4 - Math.random() * 2;
        ep.size = 3;
        ep.hue = 45;
        particles.push(ep);
      }

      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => { p.update(); p.draw(ctx); });

      if (particles.length > 0 || showBurning) {
        animId = requestAnimationFrame(render);
      }
    };

    if (showBurning || burningItems.length > 0) {
      render();
    }

    return () => cancelAnimationFrame(animId);
  }, [showBurning, paperOfferings.length]);

  const handleAdd = (type: PaperOffering['type']) => {
    addPaperOffering(type);
  };

  const handleBurnAll = () => {
    setShowBurning(true);
    paperOfferings.forEach((p) => {
      if (!p.burning) {
        burnPaperOffering(p.id);
      }
    });
    setTimeout(() => setShowBurning(false), 4000);
  };

  const unburnedItems = paperOfferings.filter((p) => !p.burnedAt);
  const burningItems = paperOfferings.filter((p) => p.burning && !p.burnedAt);

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">化纸钱</h1>
        <p className="text-c-muted text-xs font-mono">BURN PAPER OFFERINGS FOR THE SPIRIT WORLD</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Selector */}
        <div
          className="rounded-lg p-5"
          style={{
            background: 'rgba(17,17,24,0.8)',
            border: '1px solid #2a2a35',
            minWidth: '280px',
          }}
        >
          <h3 className="font-zhu text-c-text text-sm mb-4 text-center" style={{ letterSpacing: '0.1em' }}>
            纸钱供品
          </h3>
          <div className="flex flex-col gap-2">
            {PAPER_TYPES.map((type) => {
              const label = PAPER_OFFERING_LABELS[type];
              const count = unburnedItems.filter((p) => p.type === type).length;
              return (
                <div key={type} className="flex items-center gap-3">
                  <button
                    onClick={() => handleAdd(type)}
                    className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer"
                    style={{
                      background: 'rgba(26,26,37,0.6)',
                      border: '1px solid #2a2a35',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,168,37,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#2a2a35';
                    }}
                  >
                    <span className="text-xl">{PAPER_EMOJIS[type]}</span>
                    <div>
                      <div className="font-zhu text-c-text text-sm">{label.zh}</div>
                      <div className="text-c-muted text-[10px] font-mono">{label.en}</div>
                    </div>
                  </button>
                  <span className="text-c-gold font-mono text-sm w-6 text-center">{count > 0 ? `×${count}` : ''}</span>
                </div>
              );
            })}
          </div>

          {unburnedItems.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBurnAll}
              className="mt-4 w-full py-3 rounded-lg font-zhu text-sm transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, rgba(230,57,70,0.2), rgba(230,57,70,0.1))',
                border: '1px solid rgba(230,57,70,0.5)',
                color: '#e63946',
                boxShadow: '0 0 15px rgba(230,57,70,0.2)',
              }}
            >
              🕯️ 焚烧全部
            </motion.button>
          )}
        </div>

        {/* Burning zone */}
        <div className="flex flex-col items-center">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              width: '400px',
              height: '200px',
              background: showBurning
                ? 'linear-gradient(180deg, #0a0808 0%, #1a0a0a 100%)'
                : 'linear-gradient(180deg, #111118 0%, #0a0a0f 100%)',
              border: `1px solid ${showBurning ? 'rgba(230,57,70,0.4)' : '#2a2a35'}`,
              boxShadow: showBurning
                ? '0 0 40px rgba(230,57,70,0.3), inset 0 0 30px rgba(230,57,70,0.1)'
                : 'none',
              transition: 'all 0.5s ease',
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            {/* Burning items */}
            <div className="absolute inset-0 flex items-end justify-center pb-6 gap-2">
              <AnimatePresence>
                {burningItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -20, opacity: 0.3 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="text-2xl"
                  >
                    {PAPER_EMOJIS[item.type]}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Items waiting to burn */}
            <div className="absolute inset-0 flex items-end justify-center pb-8 gap-2">
              {unburnedItems.slice(0, 8).map((item) => (
                <div key={item.id} className="text-xl opacity-40">
                  {PAPER_EMOJIS[item.type]}
                </div>
              ))}
            </div>

            {!showBurning && unburnedItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-c-muted">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-xs font-mono">焚化区</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div
            className="mt-3 px-4 py-2 rounded-lg text-center"
            style={{
              background: 'rgba(17,17,24,0.8)',
              border: '1px solid #2a2a35',
              minWidth: '200px',
            }}
          >
            <span className="text-c-gold text-xs font-mono">
              待焚化: {unburnedItems.length} · 焚烧中: {burningItems.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
