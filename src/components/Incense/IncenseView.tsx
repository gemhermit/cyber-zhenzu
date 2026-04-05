import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { INCENSE_LABELS } from '@/data/demo';

const BURN_DURATION = 60000;

export default function IncenseView() {
  return (
    <div className="relative flex flex-col items-center px-3 sm:px-4 py-4 gap-6" data-page-capture>
      <div className="text-center mb-2">
        <h1 className="font-zhu text-3xl sm:text-4xl text-c-gold text-glow-gold mb-1">香火缭绕</h1>
        <p className="text-c-muted text-[10px] sm:text-xs font-mono">SELECT AND LIGHT VIRTUAL INCENSE</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start w-full max-w-5xl">

        {/* Incense selector */}
        <IncenseSelector />

        {/* Burner + stats */}
        <div className="flex flex-col items-center gap-4 w-full">
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
      className="rounded-xl p-4 w-full"
      style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid #2a2a35', maxWidth: '360px' }}
    >
      <h3 className="font-zhu text-c-text text-sm mb-3 text-center" style={{ letterSpacing: '0.1em' }}>
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
              className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-left transition-all cursor-pointer"
              style={{
                background: isSelected ? `${label.color}18` : 'transparent',
                border: `1px solid ${isSelected ? label.color + '60' : '#2a2a35'}`,
                boxShadow: isSelected ? `0 0 15px ${label.color}30` : 'none',
              }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ background: label.color, boxShadow: `0 0 8px ${label.color}` }}
              />
              <div>
                <div className="font-zhu text-c-text text-sm">{label.zh}</div>
                <div className="text-c-muted text-[10px] sm:text-xs font-mono">{label.en}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Light buttons */}
      <div className="grid grid-cols-3 gap-2">
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
            className="py-2.5 rounded-lg text-center font-zhu text-sm cursor-pointer transition-colors active:bg-red-900"
            style={{
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.3)',
              color: '#e63946',
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
  const [now, setNow] = useState(() => Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store stick world positions so smoke can match them
  const stickPositionsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
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

  // Compute flame tip positions — must match CSS layout exactly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    // CSS layout:
    //   holder: bottom:20% + height:13% → top = H*(1-0.20-0.13) = H*0.67
    //   sticks: bottom:20% (same as holder bottom), flex-col items-end → sit at holder top
    //   flame: at top of stick column (flex-col, no justify)
    //   smoke: at flame tip = holderTop - flameH
    const holderBottomPct = 0.20;
    const holderHeightPct = 0.13;
    const stickBaseY = H * (1 - holderBottomPct - holderHeightPct); // = H*0.62
    const flameH = 20; // flame element height (h-5)

    // Centering: same formula as CSS left: calc(50% + startX - 7px)
    // maxWidth 560px, element width ~28px, container uses left: calc(50% + N px)
    const count = litIncense.length;
    const spacing = 28;
    const totalW = count * spacing;
    // Center the group: first stick at W/2 + offset, spacing between sticks
    // CSS: left: calc(50% + (50 - totalW/2 + spacing/2 - 7px))
    // Canvas: startX from W/2
    const startX = W / 2 - totalW / 2 + spacing / 2;

    stickPositionsRef.current = litIncense.map((inc, idx) => {
      const remaining = Math.max(0, inc.duration - (now - inc.litAt));
      const progress = remaining / inc.duration;
      const stickH = 50 + progress * 20;
      return {
        x: startX + idx * spacing,
        y: stickBaseY - stickH - flameH, // smoke at flame tip
      };
    });
  }, [litIncense, now]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Draw smoke from actual stick positions
      stickPositionsRef.current.forEach((pos) => {
        if (Math.random() < 0.4) {
          smokeRef.current.push({
            x: pos.x + (Math.random() - 0.5) * 10,
            y: pos.y - 20, // start just above the stick tip
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.6 - Math.random() * 0.6,
            life: 1,
            size: 5 + Math.random() * 10,
            opacity: 0.55,
          });
        }
      });

      smokeRef.current = smokeRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.size *= 1.012;
        s.opacity *= 0.978;
        s.life -= 0.007;
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

      if (smokeRef.current.length > 300) {
        smokeRef.current = smokeRef.current.slice(-300);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [litIncense]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const holderBottom = '20%';

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          maxWidth: '560px',
          aspectRatio: '4 / 3',
          background: 'radial-gradient(ellipse at 50% 100%, #1e1410 0%, #0a0a0f 65%)',
          border: '1px solid rgba(244,168,37,0.15)',
          boxShadow: '0 0 60px rgba(230,57,70,0.1), inset 0 0 80px rgba(0,0,0,0.6)',
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Bottom glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 0,
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(230,57,70,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Incense holder */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-end justify-center pb-2 gap-1 rounded-t-full"
          style={{
            bottom: holderBottom,
            width: '50%',
            height: '13%',
            background: 'linear-gradient(180deg, #3a3a45, #1a1a25)',
            border: '1px solid #4a4a55',
          }}
        />

        {/* Incense sticks + flames */}
        {litIncense.map((inc, idx) => {
          const remaining = Math.max(0, inc.duration - (now - inc.litAt));
          const progress = remaining / inc.duration;
          const color = INCENSE_LABELS[inc.type].color;
          const stickH = 50 + progress * 20;
          const count = litIncense.length;
          const spacing = 28;
          const totalW = count * spacing;
          // Center group: each stick at 50% - totalW/2 + idx*spacing
          const groupLeft = -totalW / 2;

          return (
            <div
              key={inc.id}
              className="absolute flex flex-col items-center"
              style={{
                bottom: holderBottom,
                left: `calc(50% + ${groupLeft + idx * spacing}px)`,
                transform: 'translateY(-100%)',
              }}
            >
              {/* Flame */}
              <div
                className="w-3 h-5 rounded-t-full"
                style={{
                  background: `radial-gradient(ellipse at 50% 100%, #fff 0%, ${color} 45%, transparent 100%)`,
                  animation: 'flame-flicker 0.25s ease-in-out infinite',
                  filter: `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 5px rgba(255,255,255,0.6))`,
                }}
              />
              {/* Stick */}
              <div
                className="w-1.5 rounded-t"
                style={{
                  height: `${stickH}px`,
                  background: progress > 0.7
                    ? `linear-gradient(180deg, ${color}cc, #3a2a15)`
                    : `linear-gradient(180deg, #3a2a15 ${(1 - progress) * 100}%, #1a100a 100%)`,
                }}
              />
            </div>
          );
        })}

        {/* Decorative corner marks */}
        <div className="absolute top-2 left-3 text-c-gold opacity-20 font-mono text-[9px]">CYBER ZHEN ZU</div>
        <div className="absolute top-2 right-3 text-c-muted opacity-30 font-mono text-[9px]">
          {litIncense.length > 0 ? `${litIncense.length}炷` : ''}
        </div>
      </div>

      <div className="mt-3 text-c-muted text-xs font-mono text-center">
        {litIncense.length > 0
          ? `${litIncense.length} 炷香燃中 · 已燃 ${Math.ceil((now - litIncense[0].litAt) / 1000)} 秒`
          : '选择香品，点燃香火'}
      </div>
    </div>
  );
}

// Shared smoke state — module-level so it persists across renders
const smokeRef = { current: [] as { x: number; y: number; vx: number; vy: number; life: number; size: number; opacity: number }[] };

function IncenseStats() {
  const { totalIncenseBurned } = useStore();
  return (
    <div
      className="px-6 py-4 rounded-xl text-center"
      style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid #2a2a35', maxWidth: '560px', width: '100%' }}
    >
      <div className="text-c-gold font-zhu text-sm mb-1">功德累计</div>
      <div className="text-3xl font-mono text-c-text" style={{ textShadow: '0 0 15px rgba(244,168,37,0.5)' }}>
        {totalIncenseBurned}
      </div>
      <div className="text-c-muted text-[10px] font-mono mt-1">已燃香炷</div>
    </div>
  );
}
