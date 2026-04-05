import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { INCENSE_LABELS } from '@/data/demo';

const BURN_DURATION = 60000; // 60 seconds

export default function IncenseView() {
  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">香火缭绕</h1>
        <p className="text-c-muted text-xs font-mono">SELECT AND LIGHT VIRTUAL INCENSE</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Incense selector */}
        <div className="flex flex-col gap-4">
          <IncenseSelector />
        </div>

        {/* Burner display */}
        <div className="flex flex-col items-center">
          <IncenseBurnerDisplay />
          <IncenseStats />
        </div>
      </div>
    </div>
  );
}

function IncenseSelector() {
  const { lightIncense } = useStore();
  const [selectedType, setSelectedType] = useState<'sandalwood' | 'agarwood' | 'mugwort'>('sandalwood');

  const types = ['sandalwood', 'agarwood', 'mugwort'] as const;

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'rgba(17,17,24,0.8)',
        border: '1px solid #2a2a35',
        minWidth: '280px',
      }}
    >
      <h3 className="font-zhu text-c-text text-sm mb-4 text-center" style={{ letterSpacing: '0.1em' }}>
        选择香品
      </h3>
      <div className="flex flex-col gap-2 mb-4">
        {types.map((type) => {
          const label = INCENSE_LABELS[type];
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer"
              style={{
                background: isSelected ? `${label.color}18` : 'transparent',
                border: `1px solid ${isSelected ? label.color + '60' : '#2a2a35'}`,
                boxShadow: isSelected ? `0 0 15px ${label.color}30` : 'none',
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: label.color, boxShadow: `0 0 8px ${label.color}` }}
              />
              <div>
                <div className="font-zhu text-c-text text-sm">{label.zh}</div>
                <div className="text-c-muted text-xs font-mono">{label.en}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Light buttons */}
      <div className="flex gap-2">
        {[1, 3, 9].map((count) => (
          <button
            key={count}
            onClick={() => {
              for (let i = 0; i < count; i++) {
                setTimeout(() => {
                  lightIncense({ type: selectedType, duration: BURN_DURATION });
                }, i * 300);
              }
            }}
            className="flex-1 py-2 rounded text-center font-zhu text-sm transition-all cursor-pointer"
            style={{
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.3)',
              color: '#e63946',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(230,57,70,0.2)';
              (e.target as HTMLElement).style.boxShadow = '0 0 15px rgba(230,57,70,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(230,57,70,0.1)';
              (e.target as HTMLElement).style.boxShadow = 'none';
            }}
          >
            燃{count}炷
          </button>
        ))}
      </div>
    </div>
  );
}

function IncenseBurnerDisplay() {
  const { litIncense, extinguishIncense } = useStore();
  const [now, setNow] = useState(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smokeRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number; opacity: number }[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    litIncense.forEach((inc) => {
      const elapsed = now - inc.litAt;
      if (elapsed >= inc.duration) {
        extinguishIncense(inc.id);
      }
    });
  }, [now, litIncense, extinguishIncense]);

  // Smoke canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 250;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn smoke from burning incense
      litIncense.forEach((_, idx) => {
        const baseX = 90 + idx * 40;
        const baseY = 80;
        if (Math.random() < 0.3) {
          smokeRef.current.push({
            x: baseX + (Math.random() - 0.5) * 8,
            y: baseY,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 0.5,
            life: 1,
            size: 4 + Math.random() * 6,
            opacity: 0.5,
          });
        }
      });

      // Update and draw smoke
      smokeRef.current = smokeRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.size *= 1.01;
        s.opacity *= 0.98;
        s.life -= 0.008;

        if (s.life <= 0) return false;

        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        grad.addColorStop(0, `rgba(180,160,140,${s.opacity})`);
        grad.addColorStop(1, `rgba(180,160,140,0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        return true;
      });

      // Cap smoke particles
      if (smokeRef.current.length > 120) {
        smokeRef.current = smokeRef.current.slice(-120);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [litIncense.length]);

  return (
    <div className="flex flex-col items-center">
      {/* Incense burner container */}
      <div
        className="relative w-[300px] h-[250px] rounded-lg overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom, #1a1510 0%, #0a0a0f 80%)',
          border: '1px solid #2a2a35',
        }}
      >
        {/* Smoke canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

        {/* Ember glow at bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-t-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(230,57,70,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Incense holder */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-8 rounded-t-full flex items-end justify-center pb-1 gap-1"
          style={{
            background: 'linear-gradient(180deg, #2a2a35, #1a1a25)',
            border: '1px solid #3a3a45',
          }}
        >
          {litIncense.length === 0 && (
            <span className="text-c-muted text-[10px] font-mono">空</span>
          )}
        </div>

        {/* Sticks */}
        {litIncense.map((inc, idx) => {
          const remaining = Math.max(0, inc.duration - (now - inc.litAt));
          const progress = remaining / inc.duration;
          const stickHeight = 40 + progress * 20;
          const color = INCENSE_LABELS[inc.type].color;

          return (
            <div
              key={inc.id}
              className="absolute bottom-[70px] flex flex-col items-center"
              style={{ left: `calc(50% - ${(litIncense.length - 1) * 20 / 2}px + ${idx * 20}px - 15px)` }}
            >
              {/* Flame */}
              <div
                className="w-3 h-4 rounded-t-full relative"
                style={{
                  background: `radial-gradient(ellipse at bottom, #fff 0%, ${color} 50%, transparent 100%)`,
                  animation: 'flame-flicker 0.25s ease-in-out infinite',
                  filter: `drop-shadow(0 0 8px ${color})`,
                  marginBottom: '-2px',
                }}
              />
              {/* Stick */}
              <div
                className="w-1.5 rounded-t"
                style={{
                  height: `${stickHeight}px`,
                  background: progress > 0.7
                    ? `linear-gradient(180deg, ${color}cc, #3a2a15)`
                    : `linear-gradient(180deg, #3a2a15 ${(1 - progress) * 100}%, #1a100a 100%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Lit count */}
      <div className="mt-2 text-c-muted text-xs font-mono">
        {litIncense.length} 炷香燃中 · {litIncense.length > 0 ? `${Math.ceil((now - litIncense[0].litAt) / 1000)}秒` : ''}
      </div>
    </div>
  );
}

function IncenseStats() {
  const { totalIncenseBurned } = useStore();

  return (
    <div
      className="mt-4 px-4 py-3 rounded-lg text-center"
      style={{
        background: 'rgba(17,17,24,0.8)',
        border: '1px solid #2a2a35',
        minWidth: '200px',
      }}
    >
      <div className="text-c-gold font-zhu text-sm mb-1">功德累计</div>
      <div
        className="text-3xl font-mono text-c-text"
        style={{ textShadow: '0 0 15px rgba(244,168,37,0.5)' }}
      >
        {totalIncenseBurned}
      </div>
      <div className="text-c-muted text-[10px] font-mono mt-1">已燃香炷</div>
    </div>
  );
}
