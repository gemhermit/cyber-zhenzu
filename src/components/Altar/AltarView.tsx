import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { RealisticOfferingTable, Lantern, LitIncenseStick } from './AltarDecor';
import type { Ancestor } from '@/types';

function playBellSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.5);
  } catch {
    // Audio not available — silent fallback
  }
}


// ============ 主视图 ============

export default function AltarView() {
  const {
    ancestors,
    activeAncestorId,
    setActiveAncestor,
    placedOfferings,
    placeOffering,
    removeOffering,
  } = useStore();

  const activeAncestor = ancestors.find((a) => a.id === activeAncestorId) || ancestors[0] || {
    id: 'default', name: '陈氏先祖', generation: 'zǔ' as const,
    birthYear: undefined, photoUrl: undefined, relationship: undefined, bio: undefined,
  };

  return (
    <div className="relative flex flex-col items-center px-2 sm:px-4" data-altar-capture>
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <h1
          className="font-zhu text-2xl sm:text-4xl text-c-gold text-glow-gold mb-1 sm:mb-2"
          style={{ letterSpacing: '0.1em' }}
        >
          祖宗牌位
        </h1>
        <p className="text-c-muted text-[9px] sm:text-xs font-mono hidden sm:block">CYBER ZHEN ZU · DIGITAL ALTAR</p>
      </div>

      {/* Main altar structure */}
      <div className="relative flex flex-col items-center w-full">

        {/* Lanterns row */}
        <div className="flex justify-between w-full max-w-2xl mb-2 sm:mb-4">
          <Lantern side="left" />
          <Lantern side="right" />
        </div>

        {/* Tablet */}
        <AncestorTablet ancestor={activeAncestor} ancestors={ancestors} setActive={setActiveAncestor} />

        {/* Incense + Bell row */}
        <div className="flex items-end gap-6 sm:gap-12 mt-3 sm:mt-4 mb-3 sm:mb-4">
          <IncenseHolder />
          <Bell />
        </div>

        {/* Altar table */}
        <div
          className="relative w-full max-w-2xl rounded-lg p-3 sm:p-5"
          style={{
            background: 'linear-gradient(180deg, #1c1610 0%, #14100a 100%)',
            border: '1px solid rgba(244,168,37,0.25)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(244,168,37,0.08)',
          }}
        >
          {/* 红绸桌布边缘 */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t"
            style={{ background: 'linear-gradient(90deg, transparent, #e63946, transparent)', opacity: 0.6 }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
            style={{ background: 'linear-gradient(90deg, transparent, #e63946, transparent)', opacity: 0.6 }}
          />

          <div className="text-center mb-2 sm:mb-3">
            <span className="font-zhu text-xs sm:text-sm text-c-muted" style={{ letterSpacing: '0.2em' }}>
              — 供桌 —
            </span>
          </div>

          {/* 写实供桌布局 */}
          <RealisticOfferingTable
            placedOfferings={placedOfferings}
            onPlace={(type) => placeOffering({ id: `offering-${Date.now()}`, type, placedAt: Date.now() })}
            onRemove={(id) => removeOffering(id)}
          />
        </div>

        {/* Altar legs */}
        <div className="flex gap-4 sm:gap-8 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 sm:w-4 h-6 sm:h-8 rounded-b"
              style={{
                background: 'linear-gradient(180deg, #1a1a25, #0d0d12)',
                border: '1px solid #2a2a35',
              }}
            />
          ))}
        </div>

        {/* Stone base */}
        <div
          className="w-full max-w-3xl h-1 sm:h-2 rounded-b"
          style={{
            background: 'linear-gradient(180deg, #2a2a35, #1a1a25)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(230,57,70,0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}


function AncestorTablet({
  ancestor,
  ancestors,
  setActive,
}: {
  ancestor: Ancestor;
  ancestors: Ancestor[];
  setActive: (id: string | null) => void;
}) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="relative">
      {/* Main tablet */}
      <div
        className="relative px-4 sm:px-10 py-4 sm:py-6 text-center min-w-0 sm:min-w-[400px]"
        style={{
          background: 'linear-gradient(180deg, #111118 0%, #0a0a0f 100%)',
          border: '1px solid rgba(244,168,37,0.4)',
          boxShadow: '0 0 40px rgba(244,168,37,0.15), inset 0 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 rounded-b"
          style={{
            background: 'linear-gradient(180deg, #f4a825, transparent)',
            boxShadow: '0 0 15px rgba(244,168,37,0.5)',
          }}
        />

        {/* Ancestor selector */}
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="absolute top-2 right-2 text-c-muted hover:text-c-gold transition-colors cursor-pointer text-xs font-mono"
        >
          {ancestors.length > 1 ? '切换▼' : ''}
        </button>

        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-8 right-2 z-50 rounded-lg overflow-hidden"
              style={{
                background: '#111118',
                border: '1px solid #2a2a35',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              }}
            >
              {ancestors.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setActive(a.id); setShowSelector(false); }}
                  className="block w-full px-4 py-2 text-left text-xs hover:bg-c-panel transition-colors cursor-pointer"
                  style={{
                    color: a.id === ancestor.id ? '#e63946' : '#f0ece3',
                    fontFamily: 'ZCOOL XiaoWei, serif',
                  }}
                >
                  {a.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation label */}
        <div className="mb-2">
          <span
            className="text-xs font-mono px-3 py-0.5 rounded"
            style={{
              background: 'rgba(230,57,70,0.15)',
              border: '1px solid rgba(230,57,70,0.3)',
              color: '#e63946',
            }}
          >
            {ancestor.generation === 'zǔ' ? '祖' : ancestor.generation === 'kǎo' ? '考' : '妣'}
          </span>
        </div>

        {/* Photo */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full overflow-hidden relative"
            style={{
              border: '2px solid rgba(244,168,37,0.6)',
              boxShadow: '0 0 20px rgba(244,168,37,0.3)',
              background: 'linear-gradient(135deg, #1a1a25, #0a0a0f)',
            }}
          >
            {ancestor.photoUrl ? (
              <img src={ancestor.photoUrl} alt={ancestor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👤
              </div>
            )}
            {/* Animated ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(244,168,37,0.4)',
                animation: 'pulse-ring 3s ease-out infinite',
              }}
            />
          </div>
        </div>

        {/* Name */}
        <h2
          className="font-zhu text-2xl text-c-text mb-1 text-glow-gold"
          style={{ letterSpacing: '0.15em' }}
        >
          {ancestor.name.replace(/^(曾祖父|曾祖母|祖父|祖母|父|母)/, '')}
        </h2>

        {/* Years */}
        {(ancestor.birthYear || ancestor.deathYear) && (
          <div className="text-c-muted text-xs font-mono mb-2">
            {ancestor.birthYear || '?'} — {ancestor.deathYear || '?'}
          </div>
        )}

        {/* Divider */}
        <div
          className="w-32 h-px mx-auto mb-2"
          style={{ background: 'linear-gradient(90deg, transparent, #f4a825, transparent)' }}
        />

        {/* Bio */}
        {ancestor.bio && (
          <p className="text-c-muted text-xs font-zhu" style={{ fontSize: '12px' }}>
            {ancestor.bio}
          </p>
        )}

        {/* Relationship */}
        <div className="mt-2 text-c-muted text-xs font-mono">
          {ancestor.relationship}
        </div>
      </div>
    </div>
  );
}

function IncenseHolder() {
  const { litIncense, extinguishIncense } = useStore();
  const [now, setNow] = useState(() => Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smokeRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number; opacity: number; hue: number }[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Auto-extinguish
  useEffect(() => {
    litIncense.forEach((inc) => {
      const elapsed = now - inc.litAt;
      if (elapsed >= inc.duration) {
        extinguishIncense(inc.id);
      }
    });
  }, [now, litIncense, extinguishIncense]);

  // Smoke canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W;
    canvas.height = H;

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw smoke from each stick's flame tip
      litIncense.forEach((inc, idx) => {
        const remaining = Math.max(0, inc.duration - (now - inc.litAt));
        const progress = remaining / inc.duration;
        const stickH = 24 + progress * 10;
        const flameH = 12;
        // holder: w-24 h-12, centered in area, stick holes: flex gap-1
        const stickSpacing = 16;
        const groupW = 3 * stickSpacing;
        const startX = W / 2 - groupW / 2 + stickSpacing / 2;
        const stickX = startX + idx * stickSpacing;
        const holderTopY = H * 0.62; // holder top in canvas coords
        const flameTipY = holderTopY - stickH - flameH;

        if (Math.random() < 0.3) {
          smokeRef.current.push({
            x: stickX + (Math.random() - 0.5) * 6,
            y: flameTipY,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.5 - Math.random() * 0.5,
            life: 1,
            size: 4 + Math.random() * 6,
            opacity: 0.5,
            hue: inc.type === 'mugwort' ? 80 : inc.type === 'agarwood' ? 10 : 40,
          });
        }
      });

      smokeRef.current = smokeRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.size *= 1.01;
        s.opacity *= 0.98;
        s.life -= 0.008;
        if (s.life <= 0) return false;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        grad.addColorStop(0, `hsla(${s.hue}, 40%, 60%, ${s.opacity * 0.7})`);
        grad.addColorStop(1, `hsla(${s.hue}, 30%, 40%, 0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        return true;
      });

      if (smokeRef.current.length > 80) {
        smokeRef.current = smokeRef.current.slice(-80);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [litIncense, now]);

  return (
    <div className="flex flex-col items-center relative">
      {/* Smoke canvas */}
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{ width: '96px', height: '80px', top: '-60px', left: '50%', transform: 'translateX(-50%)' }}
      />
      {/* Holder base */}
      <div
        className="w-24 h-12 rounded-t-full flex items-end justify-center pb-2"
        style={{
          background: 'linear-gradient(180deg, #2a2a35, #1a1a25)',
          border: '1px solid #3a3a45',
          borderBottom: 'none',
        }}
      >
        {/* Stick holes */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative">
              {litIncense[i] ? (
                <LitIncenseStick incense={litIncense[i]} now={now} />
              ) : (
                <div
                  className="w-1.5 h-8 rounded-t"
                  style={{ background: '#3a3020', borderRadius: '1px 1px 0 0' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Count */}
      <div className="text-c-muted text-[9px] font-mono mt-1">{litIncense.length} 炷香燃</div>
    </div>
  );
}


function Bell() {
  const { bellRinging, ringBell } = useStore();

  const handleRing = useCallback(() => {
    ringBell();
    playBellSound();
  }, [ringBell]);

  return (
    <div className="flex flex-col items-center">
      {/* Bell body */}
      <motion.div
        animate={bellRinging ? { rotate: [-8, 6, -5, 4, -2, 0] } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative cursor-pointer"
        onClick={handleRing}
      >
        {/* Hook */}
        <div
          className="w-px h-4 mx-auto"
          style={{ background: 'linear-gradient(180deg, #f4a825, #8a6914)' }}
        />
        {/* Bell dome */}
        <div
          className="w-10 h-8 rounded-t-full rounded-b"
          style={{
            background: 'linear-gradient(180deg, #f4a825 0%, #c4860a 50%, #8a6010 100%)',
            boxShadow: bellRinging
              ? '0 0 20px rgba(244,168,37,0.8), 0 0 40px rgba(244,168,37,0.4)'
              : '0 0 10px rgba(244,168,37,0.2)',
            border: '1px solid rgba(244,168,37,0.4)',
          }}
        >
          {/* Bell clapper */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{
              background: '#7a6010',
              boxShadow: bellRinging ? '0 0 10px rgba(244,168,37,0.5)' : 'none',
            }}
          />
        </div>
      </motion.div>
      <button
        onClick={handleRing}
        className="text-c-muted hover:text-c-gold transition-colors cursor-pointer text-[9px] font-mono mt-1"
      >
        鸣钟
      </button>
    </div>
  );
}

