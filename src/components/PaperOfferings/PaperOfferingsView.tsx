import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { PAPER_OFFERING_LABELS } from '@/data/demo';
import type { PaperOffering } from '@/types';

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

const BURN_DURATION = 2800; // ms per item

export default function PaperOfferingsView() {
  const { paperOfferings, addPaperOffering, burnPaperOffering, completePaperBurn } = useStore();
  const [showFire, setShowFire] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burnTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fire canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    updateSize();

    let animId: number;
    const particles: FireParticle[] = [];

    class FireParticle {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number;
      hue: number;
      constructor(w: number, h: number, cx: number) {
        this.x = cx + (Math.random() - 0.5) * w * 0.3;
        this.y = h;
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
      draw(c: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * this.life);
        grad.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.life * 0.8})`);
        grad.addColorStop(0.5, `hsla(${this.hue - 10}, 100%, 50%, ${this.life * 0.4})`);
        grad.addColorStop(1, `hsla(${this.hue - 20}, 100%, 30%, 0)`);
        c.beginPath();
        c.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();
      }
    }

    const burningCount = paperOfferings.filter((p) => p.burning).length;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showFire && burningCount > 0) {
        const bgGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height, 0,
          canvas.width / 2, canvas.height, canvas.width / 2
        );
        bgGrad.addColorStop(0, 'rgba(230,57,70,0.2)');
        bgGrad.addColorStop(1, 'rgba(230,57,70,0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 3; i++) {
          if (Math.random() < 0.5) particles.push(new FireParticle(canvas.width, canvas.height, canvas.width / 2));
        }
        if (Math.random() < 0.2) {
          const ep = new FireParticle(canvas.width, canvas.height, canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4);
          ep.vy = -4 - Math.random() * 2;
          ep.size = 3;
          ep.hue = 45;
          particles.push(ep);
        }
      }

      particles.forEach((p) => { p.update(); p.draw(ctx); });
      particles.push(...particles.splice(0, particles.length).filter((p) => p.life > 0));

      if (particles.length > 0 || (showFire && burningCount > 0)) {
        animId = requestAnimationFrame(render);
      }
    };

    if (showFire && burningCount > 0) {
      render();
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showFire, paperOfferings]);

  const unburnedItems = paperOfferings.filter((p) => !p.burning && !p.burnedAt);
  const burningItems = paperOfferings.filter((p) => p.burning);
  const burnedItems = paperOfferings.filter((p) => !!p.burnedAt);

  const handleBurnAll = () => {
    if (unburnedItems.length === 0) return;
    setShowFire(true);

    // Start burning each item with staggered delay
    unburnedItems.forEach((item, idx) => {
      // Schedule the completion for each item
      const t = setTimeout(() => {
        completePaperBurn(item.id);
        burnTimeouts.current.delete(item.id);

        // When last item completes, stop fire after a moment
        const remaining = paperOfferings.filter(
          (p) => p.burning && p.id !== item.id
        ).length;
        if (remaining === 0) {
          setTimeout(() => setShowFire(false), 800);
        }
      }, BURN_DURATION + idx * 200);
      burnTimeouts.current.set(item.id, t);

      // Start burning immediately
      burnPaperOffering(item.id);
    });
  };

  return (
    <div className="relative flex flex-col items-center px-3 sm:px-4 py-4 gap-6">
      <div className="text-center mb-2">
        <h1 className="font-zhu text-3xl sm:text-4xl text-c-gold text-glow-gold mb-1">化纸钱</h1>
        <p className="text-c-muted text-[10px] sm:text-xs font-mono">BURN PAPER OFFERINGS FOR THE SPIRIT WORLD</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start w-full max-w-3xl">

        {/* Selector */}
        <div
          className="rounded-xl p-4 w-full sm:min-w-0"
          style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid #2a2a35', maxWidth: '340px' }}
        >
          <h3 className="font-zhu text-c-text text-sm mb-3 text-center" style={{ letterSpacing: '0.1em' }}>
            纸钱供品
          </h3>
          <div className="flex flex-col gap-2">
            {PAPER_TYPES.map((type) => {
              const label = PAPER_OFFERING_LABELS[type];
              const count = unburnedItems.filter((p) => p.type === type).length;
              return (
                <div key={type} className="flex items-center gap-2">
                  <button
                    onClick={() => addPaperOffering(type)}
                    className="flex-1 flex items-center gap-2 px-2 py-2.5 sm:px-3 sm:py-2.5 rounded-lg text-left cursor-pointer transition-colors active:bg-zinc-800"
                    style={{ background: 'rgba(26,26,37,0.6)', border: '1px solid #2a2a35' }}
                  >
                    <span className="text-xl sm:text-2xl flex-shrink-0">{PAPER_EMOJIS[type]}</span>
                    <div>
                      <div className="font-zhu text-c-text text-sm">{label.zh}</div>
                      <div className="text-c-muted text-[10px] font-mono">{label.en}</div>
                    </div>
                  </button>
                  {count > 0 && (
                    <span className="text-c-gold font-mono text-xs w-7 text-center flex-shrink-0">×{count}</span>
                  )}
                </div>
              );
            })}
          </div>

          {unburnedItems.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBurnAll}
              className="mt-4 w-full py-3 rounded-lg font-zhu text-sm cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, rgba(230,57,70,0.2), rgba(230,57,70,0.1))',
                border: '1px solid rgba(230,57,70,0.5)',
                color: '#e63946',
                boxShadow: '0 0 15px rgba(230,57,70,0.2)',
              }}
            >
              🕯️ 焚烧全部 ({unburnedItems.length})
            </motion.button>
          )}
        </div>

        {/* Burning zone */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className="relative rounded-xl overflow-hidden w-full"
            style={{
              aspectRatio: '2 / 1',
              maxWidth: '420px',
              background: showFire
                ? 'linear-gradient(180deg, #0a0808 0%, #1a0a0a 100%)'
                : 'linear-gradient(180deg, #111118 0%, #0a0a0f 100%)',
              border: `1px solid ${showFire ? 'rgba(230,57,70,0.5)' : '#2a2a35'}`,
              boxShadow: showFire
                ? '0 0 50px rgba(230,57,70,0.4), inset 0 0 40px rgba(230,57,70,0.15)'
                : 'none',
              transition: 'all 0.6s ease',
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Burning items — each with individual fade animation */}
            <div className="absolute inset-0 flex items-end justify-center gap-2 pb-3 overflow-hidden">
              <AnimatePresence>
                {burningItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 0, opacity: 1, scale: 1 }}
                    animate={{ y: -24, opacity: 0, scale: 0.6 }}
                    transition={{ duration: BURN_DURATION / 1000, ease: 'easeIn' }}
                    className="text-2xl sm:text-3xl"
                  >
                    {PAPER_EMOJIS[item.type]}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Waiting items at bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 flex-wrap justify-center max-w-full px-4">
              <AnimatePresence>
                {unburnedItems.slice(0, 8).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-lg sm:text-xl opacity-40"
                  >
                    {PAPER_EMOJIS[item.type]}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {!showFire && unburnedItems.length === 0 && burningItems.length === 0 && (
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
            className="px-4 py-2 rounded-xl text-center w-full max-w-[420px] flex items-center justify-center gap-3"
            style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid #2a2a35' }}
          >
            <span className="text-c-muted text-xs font-mono">待焚</span>
            <span className="text-c-gold font-mono text-sm">{unburnedItems.length}</span>
            <div className="w-px h-3" style={{ background: '#2a2a35' }} />
            <span className="text-c-muted text-xs font-mono">焚烧中</span>
            <span className="text-red-400 font-mono text-sm">{burningItems.length}</span>
            <div className="w-px h-3" style={{ background: '#2a2a35' }} />
            <span className="text-c-muted text-xs font-mono">已化</span>
            <span className="text-c-gold font-mono text-sm">{burnedItems.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
