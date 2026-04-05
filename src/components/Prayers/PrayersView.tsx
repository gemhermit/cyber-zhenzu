import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Prayer } from '../../types';

const LANTERN_GLYPHS = ['福', '禄', '寿', '喜', '祥', '和', '安', '宁', '善', '德'];

export default function PrayersView() {
  const { prayers, addPrayer, lightPrayer, removePrayer } = useStore();
  const [text, setText] = useState('');
  const [type, setType] = useState<'family' | 'personal'>('personal');
  const [filter, setFilter] = useState<'all' | 'family' | 'personal'>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lanterns = useRef<{ id: number; x: number; y: number; vx: number; glyph: string; opacity: number; hue: number }[]>([]);

  const filtered = prayers.filter((p) => filter === 'all' || p.type === filter);
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addPrayer({ text: text.trim(), type, author: undefined });
    setText('');
  };

  // Lantern canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn lanterns from prayers
      const litPrayers = prayers.filter((p) => p.lit && p.timestamp > Date.now() - 20000);
      litPrayers.forEach((p) => {
        if (!lanterns.current.find((l) => l.id === p.timestamp)) {
          lanterns.current.push({
            id: p.timestamp,
            x: Math.random() * canvas.width,
            y: canvas.height - 20,
            vx: (Math.random() - 0.5) * 0.5,
            glyph: LANTERN_GLYPHS[Math.floor(Math.random() * LANTERN_GLYPHS.length)],
            opacity: 0.8,
            hue: Math.random() * 30 + 15,
          });
        }
      });

      lanterns.current = lanterns.current.filter((l) => {
        l.y -= 0.4;
        l.x += l.vx + Math.sin(l.y * 0.01) * 0.3;
        l.opacity -= 0.002;

        if (l.y < -40 || l.opacity <= 0) return false;

        const size = 28;
        // Lantern glow
        const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, size);
        grad.addColorStop(0, `hsla(${l.hue}, 80%, 60%, ${l.opacity * 0.3})`);
        grad.addColorStop(1, `hsla(${l.hue}, 80%, 60%, 0)`);
        ctx.beginPath();
        ctx.arc(l.x, l.y, size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Lantern body
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.fillStyle = `hsla(${l.hue}, 70%, 45%, ${l.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsla(${l.hue + 20}, 80%, 70%, ${l.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glyph
        ctx.font = '12px "ZCOOL XiaoWei", serif';
        ctx.fillStyle = `rgba(255,255,255,${l.opacity * 0.9})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(l.glyph, 0, 0);

        // String
        ctx.strokeStyle = `rgba(200,180,150,${l.opacity * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(0, -20);
        ctx.stroke();
        ctx.restore();

        return true;
      });

      if (lanterns.current.length > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    if (lanterns.current.length > 0) {
      render();
    }

    return () => cancelAnimationFrame(animId);
  }, [prayers]);

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">祈福牌</h1>
        <p className="text-c-muted text-xs font-mono">WRITE PRAYERS FOR YOUR ANCESTORS</p>
      </div>

      {/* Lantern canvas background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ opacity: 0.5 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
        {/* Input */}
        <div
          className="rounded-lg p-5"
          style={{
            background: 'rgba(17,17,24,0.8)',
            border: '1px solid #2a2a35',
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            placeholder="写下你的祈福...（200字以内）"
            rows={3}
            className="w-full rounded p-3 text-sm resize-none"
            style={{
              background: 'rgba(26,26,37,0.6)',
              border: '1px solid #2a2a35',
              color: '#f0ece3',
              fontFamily: 'ZCOOL XiaoWei, serif',
              fontSize: '14px',
            }}
            onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(244,168,37,0.5)'; }}
            onBlur={(e) => { (e.target as HTMLElement).style.borderColor = '#2a2a35'; }}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {(['personal', 'family'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-all"
                  style={{
                    background: type === t ? 'rgba(244,168,37,0.15)' : 'transparent',
                    border: `1px solid ${type === t ? 'rgba(244,168,37,0.5)' : '#2a2a35'}`,
                    color: type === t ? '#f4a825' : '#7a7570',
                  }}
                >
                  {t === 'personal' ? '私' : '家'}
                </button>
              ))}
            </div>
            <span className="text-c-muted text-xs font-mono">{text.length}/200</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded text-xs font-zhu cursor-pointer transition-all disabled:opacity-30"
              style={{
                background: 'rgba(230,57,70,0.15)',
                border: '1px solid rgba(230,57,70,0.4)',
                color: '#e63946',
              }}
            >
              提交祈福
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'family', 'personal'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-all"
              style={{
                background: filter === f ? 'rgba(244,168,37,0.1)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(244,168,37,0.3)' : '#2a2a35'}`,
                color: filter === f ? '#f4a825' : '#7a7570',
              }}
            >
              {f === 'all' ? '全部' : f === 'family' ? '家祭' : '私'}
            </button>
          ))}
        </div>

        {/* Prayer board */}
        <div className="relative rounded-lg p-4" style={{
          background: 'rgba(17,17,24,0.6)',
          border: '1px solid #2a2a35',
          minHeight: '200px',
        }}>
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {sorted.map((prayer) => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onLight={() => lightPrayer(prayer.id)}
                  onRemove={() => removePrayer(prayer.id)}
                />
              ))}
            </AnimatePresence>
          </div>
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-c-muted">
              <span className="text-3xl mb-2">🎋</span>
              <span className="text-xs font-mono">祈福板空空如也</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrayerCard({
  prayer,
  onLight,
  onRemove,
}: {
  prayer: Prayer;
  onLight: () => void;
  onRemove: () => void;
}) {
  const timeAgo = Math.floor((Date.now() - prayer.timestamp) / 60000);
  const glyph = LANTERN_GLYPHS[prayer.timestamp % LANTERN_GLYPHS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-lg p-4"
      style={{
        background: prayer.lit
          ? 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(244,168,37,0.05))'
          : 'rgba(26,26,37,0.4)',
        border: `1px solid ${prayer.lit ? 'rgba(244,168,37,0.3)' : '#2a2a35'}`,
        boxShadow: prayer.lit ? '0 0 15px rgba(244,168,37,0.1)' : 'none',
      }}
    >
      <div className="flex gap-3">
        {/* Lantern icon */}
        <div
          className="flex-shrink-0 w-8 h-10 flex flex-col items-center justify-center rounded"
          style={{
            background: prayer.lit
              ? 'linear-gradient(180deg, rgba(230,57,70,0.2), rgba(244,168,37,0.15))'
              : 'rgba(26,26,37,0.6)',
            border: `1px solid ${prayer.lit ? 'rgba(230,57,70,0.3)' : '#2a2a35'}`,
          }}
        >
          <span
            className="font-zhu text-sm"
            style={{ color: prayer.lit ? '#e63946' : '#3a3a45', textShadow: prayer.lit ? '0 0 8px #e63946' : 'none' }}
          >
            {glyph}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-zhu text-sm text-c-text leading-relaxed"
            style={{ wordBreak: 'break-word' }}
          >
            {prayer.text}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-c-muted text-[9px] font-mono">
              {timeAgo < 1 ? '刚刚' : `${timeAgo}分钟前`}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-mono"
              style={{
                background: prayer.type === 'family' ? 'rgba(244,168,37,0.1)' : 'rgba(0,229,255,0.1)',
                color: prayer.type === 'family' ? '#f4a825' : '#00e5ff',
              }}
            >
              {prayer.type === 'family' ? '家祭' : '私'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          {!prayer.lit ? (
            <button
              onClick={onLight}
              className="px-2 py-1 rounded text-[9px] font-mono cursor-pointer transition-all"
              style={{
                background: 'rgba(230,57,70,0.1)',
                border: '1px solid rgba(230,57,70,0.3)',
                color: '#e63946',
              }}
            >
              点灯
            </button>
          ) : (
            <span className="text-c-gold text-xs">✨</span>
          )}
          <button
            onClick={onRemove}
            className="text-c-muted hover:text-c-red text-[9px] cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
}
