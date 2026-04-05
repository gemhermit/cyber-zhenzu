import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { OFFERING_LABELS } from '@/data/demo';
import type { Offering } from '@/types';

// ============ 写实器皿 ============

function RealisticDish({ type, placed, hovered }: { type: string; placed: boolean; hovered: boolean }) {
  const op = placed ? 1 : 0.25;
  const hov = hovered ? 1.05 : 1;
  const base: React.CSSProperties = {
    opacity: op, transform: `scale(${hov})`, transition: 'all 0.2s ease',
    filter: placed ? 'none' : 'grayscale(0.5)',
  };

  if (type === 'rice') return (
    <div title="米饭" style={base}>
      <div className="relative w-12 h-10 flex flex-col items-center">
        <div className="w-12 h-8 rounded-t-full relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f5f5f0 0%, #e8e0d0 60%, #d4c8b0 100%)', border: '1px solid rgba(200,180,140,0.5)', boxShadow: placed ? '0 4px 12px rgba(0,0,0,0.4)' : 'none' }}>
          {[0,1,2].map(i => <div key={i} className="absolute w-full h-2 rounded-full" style={{ background: 'rgba(240,230,210,0.7)', top: `${20 + i * 18}%`, borderTop: '1px solid rgba(200,190,160,0.5)' }} />)}
        </div>
        <div className="w-14 h-1 rounded-b" style={{ background: 'linear-gradient(180deg, #d4c8b0, #b8a890)', marginTop: -2 }} />
      </div>
    </div>
  );

  if (type === 'tea') return (
    <div title="清茶" style={base}>
      <div className="relative w-10 h-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-b-lg rounded-t-sm relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #e8e0d0 0%, #d4c8b0 100%)', border: '1px solid rgba(200,180,140,0.5)', boxShadow: placed ? '0 3px 10px rgba(0,0,0,0.3)' : 'none' }}>
          <div className="absolute inset-x-1 top-1 bottom-0 rounded-b" style={{ background: 'rgba(140,180,120,0.6)' }} />
        </div>
        <div className="w-8 h-1 rounded-b" style={{ background: '#c8b8a0', marginTop: -1 }} />
        {placed && (
          <motion.div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            {[0,1,2].map(i => <div key={i} className="w-1 h-3 rounded-full" style={{ background: 'rgba(200,220,200,0.5)' }} />)}
          </motion.div>
        )}
      </div>
    </div>
  );

  if (type === 'wine') return (
    <div title="清酒" style={base}>
      <div className="relative w-8 h-12 flex flex-col items-center">
        <div className="w-6 h-8 rounded-t-full rounded-b relative" style={{ background: 'linear-gradient(180deg, #2a4a3a 0%, #1a3020 100%)', border: '1px solid rgba(100,180,120,0.3)', boxShadow: placed ? '0 3px 10px rgba(0,0,0,0.4)' : 'none' }}>
          <div className="absolute inset-x-1 top-1 bottom-0 rounded-b" style={{ background: 'rgba(200,220,160,0.5)' }} />
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: '#1a3020' }} />
        <div className="w-6 h-1 rounded-b mt-0.5" style={{ background: '#1a3020' }} />
      </div>
    </div>
  );

  if (type === 'fruit') return (
    <div title="水果" style={base}>
      <div className="relative w-14 h-8 flex items-end justify-center">
        <div className="absolute bottom-0 w-14 h-4 rounded-t-full" style={{ background: 'linear-gradient(180deg, #e8e0d0 0%, #d4c8b0 100%)', border: '1px solid rgba(200,180,140,0.5)', boxShadow: placed ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }} />
        <div className="absolute bottom-2 left-1 w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #e63946, #a01c2a)', bottom: '8px', left: '4px' }} />
        <div className="absolute bottom-2 right-1 w-6 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #f4e825, #e8c815)', transform: 'rotate(-20deg)', right: '2px', bottom: '10px' }} />
        <div className="absolute top-0 right-1 w-3 h-2 rounded-full" style={{ background: '#5a8a32', transform: 'rotate(30deg)' }} />
      </div>
    </div>
  );

  if (type === 'flower') return (
    <div title="鲜花" style={base}>
      <div className="relative w-10 h-14 flex flex-col items-center">
        <div className="w-6 h-8 rounded-b-full rounded-t relative" style={{ background: 'linear-gradient(180deg, #3a6a9a 0%, #1a3a5a 100%)', border: '1px solid rgba(100,150,200,0.3)', boxShadow: placed ? '0 4px 12px rgba(0,0,0,0.4)' : 'none' }}>
          <div className="absolute top-1 left-1 w-1 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div className="absolute -top-4 flex gap-0.5">
          {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full" style={{ background: i === 1 ? '#f4a825' : '#e63946', border: '1px solid rgba(200,150,100,0.3)' }} />)}
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-4" style={{ background: '#5a8a32' }} />
      </div>
    </div>
  );

  if (type === 'zongzi') return (
    <div title="粽子" style={base}>
      <div className="relative w-12 h-8 flex items-center justify-center">
        <div className="w-10 h-6 rounded-lg relative" style={{ background: 'linear-gradient(135deg, #c8a020 0%, #8a6010 100%)', border: '1px solid rgba(180,140,40,0.5)', boxShadow: placed ? '0 3px 10px rgba(0,0,0,0.4)' : 'none' }}>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px" style={{ background: 'rgba(100,80,20,0.6)', transform: 'rotate(-20deg)' }} /></div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px" style={{ background: 'rgba(100,80,20,0.6)', transform: 'rotate(20deg)' }} /></div>
        </div>
      </div>
    </div>
  );

  if (type === 'tangyuan') return (
    <div title="汤圆" style={base}>
      <div className="relative w-12 h-10 flex flex-col items-center">
        <div className="w-12 h-7 rounded-t-full" style={{ background: 'linear-gradient(180deg, #f5f0e8 0%, #e8e0d0 100%)', border: '1px solid rgba(200,180,140,0.5)', boxShadow: placed ? '0 3px 10px rgba(0,0,0,0.3)' : 'none' }} />
        <div className="absolute bottom-1 flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #fff, #e8d8c8)', border: '1px solid rgba(200,180,140,0.3)' }} />)}
        </div>
      </div>
    </div>
  );

  if (type === 'sweet') return (
    <div title="糕点" style={base}>
      <div className="relative w-12 h-8 flex items-end justify-center gap-1">
        <div className="w-5 h-4 rounded-t-lg rounded-b" style={{ background: 'linear-gradient(180deg, #f4c080 0%, #d48020 100%)', border: '1px solid rgba(200,140,40,0.4)', boxShadow: placed ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }} />
        <div className="w-4 h-3 rounded-full" style={{ background: 'linear-gradient(180deg, #f080c0 0%, #c03090 100%)', border: '1px solid rgba(180,80,160,0.4)', boxShadow: placed ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }} />
      </div>
    </div>
  );

  if (type === 'chicken') return (
    <div title="烧鸡" style={base}>
      <div className="relative w-14 h-8 flex items-center justify-center">
        <div className="w-12 h-6 rounded-lg relative" style={{ background: 'linear-gradient(180deg, #c87820 0%, #8a4010 100%)', border: '1px solid rgba(180,100,40,0.4)', boxShadow: placed ? '0 4px 12px rgba(0,0,0,0.4)' : 'none' }}>
          {[0,1].map(i => <div key={i} className="absolute w-full h-px" style={{ background: 'rgba(80,40,10,0.3)', top: `${30 + i * 35}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (type === 'tangerine') return (
    <div title="柑橘" style={base}>
      <div className="relative w-10 h-8 flex items-center justify-center">
        <div className="w-8 h-7 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #f4a825 0%, #c87810 100%)', border: '1px solid rgba(200,140,40,0.4)', boxShadow: placed ? '0 3px 10px rgba(0,0,0,0.3)' : 'none' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: '#5a8a32' }} />
        </div>
      </div>
    </div>
  );

  if (type === 'candy') return (
    <div title="糖果" style={base}>
      <div className="relative w-10 h-8 flex items-center justify-center gap-0.5">
        <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #f4a825, #e63946)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #00e5ff, #0080ff)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #7cb342, #4a8020)' }} />
      </div>
    </div>
  );

  if (type === 'cigarette') return (
    <div title="香烟" style={base}>
      <div className="relative w-12 h-8 flex flex-col items-center">
        <div className="flex gap-1 mb-0.5"><div className="w-6 h-1.5 rounded-full" style={{ background: '#f0ece0', border: '1px solid rgba(200,180,140,0.3)' }} /></div>
        <div className="w-5 h-4 rounded-sm" style={{ background: 'linear-gradient(180deg, #d42020, #a01010)', border: '1px solid rgba(180,40,40,0.4)' }} />
        {placed && (
          <motion.div className="absolute -top-2 left-2 w-1 h-3 rounded-full opacity-50"
            animate={{ opacity: [0.2, 0.6, 0.2], y: [-4, -8, -4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ background: 'rgba(180,180,180,0.4)' }}
          />
        )}
      </div>
    </div>
  );

  const label = OFFERING_LABELS[type];
  return <div className="w-12 h-8 flex items-center justify-center" style={base}><span className="text-xl">{label?.emoji || '🍽'}</span></div>;
}

// ============ 写实供桌 ============

function RealisticOfferingTable({
  placedOfferings,
  onPlace,
  onRemove,
}: {
  placedOfferings: Offering[];
  onPlace: (type: Offering['type']) => void;
  onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const leftItems: Offering['type'][] = ['fruit', 'tangerine', 'chicken'];
  const centerItems: Offering['type'][] = ['rice', 'zongzi', 'tangyuan'];
  const rightItems: Offering['type'][] = ['tea', 'wine', 'sweet'];
  const frontItems: Offering['type'][] = ['flower', 'candy', 'cigarette'];

  const renderSlot = (type: Offering['type']) => {
    const placed = placedOfferings.find((o) => o.type === type);
    const label = OFFERING_LABELS[type];
    const isHovered = hovered === type;

    return (
      <div
        key={type}
        className="relative flex flex-col items-center cursor-pointer group"
        onMouseEnter={() => setHovered(type)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => placed ? onRemove(placed.id) : onPlace(type)}
      >
        <RealisticDish type={type} placed={!!placed} hovered={isHovered} />
        <span className="font-zhu mt-1 text-center" style={{ fontSize: '9px', color: placed ? '#f4a825' : '#4a4540' }}>
          {label.zh}
        </span>
        <div className="absolute -bottom-6 px-2 py-0.5 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3' }}>
          {placed ? '点击撤供' : '点击上供'}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between gap-4">
        <div className="flex flex-col items-center gap-3">{leftItems.map(renderSlot)}</div>
        <div className="flex flex-col items-center gap-3">{centerItems.map(renderSlot)}</div>
        <div className="flex flex-col items-center gap-3">{rightItems.map(renderSlot)}</div>
      </div>
      <div className="flex justify-center gap-6">{frontItems.map(renderSlot)}</div>
    </div>
  );
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
    <div className="relative flex flex-col items-center px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="font-zhu text-4xl text-c-gold text-glow-gold mb-2"
          style={{ letterSpacing: '0.1em' }}
        >
          祖宗牌位
        </h1>
        <p className="text-c-muted text-xs font-mono">CYBER ZHEN ZU · DIGITAL ALTAR</p>
      </div>

      {/* Main altar structure */}
      <div className="relative flex flex-col items-center">
        {/* Lanterns row */}
        <div className="flex justify-between w-full max-w-2xl mb-4">
          <Lantern side="left" />
          <Lantern side="right" />
        </div>

        {/* Tablet */}
        <AncestorTablet ancestor={activeAncestor} ancestors={ancestors} setActive={setActiveAncestor} />

        {/* Incense + Bell row */}
        <div className="flex items-end gap-12 mt-4 mb-4">
          <IncenseHolder />
          <Bell />
        </div>

        {/* Altar table */}
        <div
          className="relative w-full max-w-2xl rounded-lg p-5"
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

          <div className="text-center mb-3">
            <span className="font-zhu text-sm text-c-muted" style={{ letterSpacing: '0.2em' }}>
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
        <div className="flex gap-8 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-8 rounded-b"
              style={{
                background: 'linear-gradient(180deg, #1a1a25, #0d0d12)',
                border: '1px solid #2a2a35',
              }}
            />
          ))}
        </div>

        {/* Stone base */}
        <div
          className="w-full max-w-3xl h-2 rounded-b"
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

function Lantern({ side }: { side: 'left' | 'right' }) {
  return (
    <motion.div
      className="lantern-sway"
      animate={{ rotate: side === 'left' ? -2 : 2 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* String */}
        <div className="w-px h-6" style={{ background: 'linear-gradient(180deg, #2a2a35, #f4a825)' }} />
        {/* Lantern body */}
        <div
          className="w-14 h-16 rounded-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #e63946 0%, #a61c2a 100%)',
            boxShadow: '0 0 20px rgba(230,57,70,0.6), inset 0 0 15px rgba(244,168,37,0.3)',
            border: '1px solid rgba(230,57,70,0.4)',
          }}
        >
          {/* Glow */}
          <div
            className="absolute inset-2 rounded opacity-60"
            style={{
              background: 'radial-gradient(ellipse, rgba(244,168,37,0.5), transparent)',
              animation: 'flicker 3s ease-in-out infinite',
            }}
          />
          {/* Pattern lines */}
          <div className="absolute inset-0 flex flex-col justify-evenly py-2 px-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-px" style={{ background: 'rgba(244,168,37,0.3)' }} />
            ))}
          </div>
          <div className="absolute inset-0 flex justify-evenly py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-px" style={{ background: 'rgba(244,168,37,0.3)' }} />
            ))}
          </div>
          {/* 福 character */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-zhu text-c-gold opacity-60" style={{ fontSize: '14px', textShadow: '0 0 10px rgba(244,168,37,0.8)' }}>
              福
            </span>
          </div>
        </div>
        {/* Bottom */}
        <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, #f4a825, #7a7570)' }} />
        <div
          className="w-2 h-3 rounded-b"
          style={{
            background: 'linear-gradient(180deg, #f4a825, #a16e10)',
            boxShadow: '0 0 8px rgba(244,168,37,0.4)',
          }}
        />
      </div>
    </motion.div>
  );
}

function AncestorTablet({
  ancestor,
  ancestors,
  setActive,
}: {
  ancestor: any;
  ancestors: any[];
  setActive: (id: string | null) => void;
}) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="relative">
      {/* Main tablet */}
      <div
        className="relative px-10 py-6 text-center min-w-[400px]"
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
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
  }, [now, litIncense]);

  return (
    <div className="flex flex-col items-center">
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

function LitIncenseStick({ incense, now }: { incense: any; now: number }) {
  const remaining = Math.max(0, incense.duration - (now - incense.litAt));
  const progress = remaining / incense.duration;
  const height = 24 + progress * 10;

  return (
    <div className="relative flex flex-col items-center">
      {/* Flame */}
      <div
        className="absolute -top-3 w-2 h-3 rounded-t-full"
        style={{
          background: 'radial-gradient(ellipse at bottom, #fff 0%, #f4a825 40%, #e63946 80%, transparent 100%)',
          animation: 'flame-flicker 0.3s ease-in-out infinite',
          filter: 'blur(0.5px)',
        }}
      />
      {/* Stick */}
      <div
        className="w-1.5 rounded-t"
        style={{
          height: `${height}px`,
          background: `linear-gradient(180deg, #4a3520 ${(1 - progress) * 100}%, #2a1a10 100%)`,
        }}
      />
      {/* Ash tip */}
      {progress < 0.7 && (
        <div
          className="absolute w-1.5 h-1 rounded-full -top-0.5"
          style={{ background: '#8a7a6a' }}
        />
      )}
    </div>
  );
}

function Bell() {
  const { bellRinging, ringBell } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleRing = () => {
    ringBell();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkI2Ff3hwaGpye4SHgnh0cXBwdHqAgHt3dHR3eX+ChIN/d3Z3eX2BhISBd3Z4e32BhYWFd3Z4e32Bg4SEd3Z4e36BhIWFd3Z4e36Bg4SEd3Z4e36Bg4SFd3Z4e36Bg4SEd3Z4e36Bg4SEd3Z4e36Bg4SEd3Z4e36Bg4SE" />
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

