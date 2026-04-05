import { useState } from 'react';
import { motion } from 'framer-motion';
import { OFFERING_LABELS } from '@/data/demo';
import type { Offering } from '@/types';

// ============ 写实器皿 ============

export function RealisticDish({ type, placed, hovered }: { type: string; placed: boolean; hovered: boolean }) {
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

export function RealisticOfferingTable({
  placedOfferings,
  onPlace,
  onRemove,
}: {
  placedOfferings: Offering[];
  onPlace: (type: Offering['type']) => void;
  onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const slots: {
    type: Offering['type'];
    left: string;
    top: string;
    zIndex: number;
    scale: number;
    rotate: number;
  }[] = [
    { type: 'chicken',   left: '5%',  top: '4%',  zIndex: 3,  scale: 1.0,  rotate: -3 },
    { type: 'tangerine', left: '22%', top: '2%',  zIndex: 4,  scale: 0.92, rotate: 2  },
    { type: 'fruit',     left: '38%', top: '0%',  zIndex: 5,  scale: 1.05, rotate: -1 },
    { type: 'zongzi',    left: '58%', top: '3%',  zIndex: 6,  scale: 0.95, rotate: 4  },
    { type: 'rice',      left: '10%', top: '38%', zIndex: 7,  scale: 1.0,  rotate: -2 },
    { type: 'tangyuan',  left: '32%', top: '35%', zIndex: 8,  scale: 0.9,  rotate: 3  },
    { type: 'sweet',     left: '52%', top: '37%', zIndex: 9,  scale: 0.95, rotate: -4 },
    { type: 'tea',       left: '70%', top: '40%', zIndex: 10, scale: 1.0,  rotate: 1  },
    { type: 'wine',      left: '2%',  top: '58%', zIndex: 11, scale: 0.88, rotate: -3 },
    { type: 'flower',    left: '25%', top: '68%', zIndex: 12, scale: 1.1,  rotate: 2  },
    { type: 'candy',     left: '50%', top: '65%', zIndex: 13, scale: 0.85, rotate: -2 },
    { type: 'cigarette', left: '68%', top: '70%', zIndex: 14, scale: 0.9,  rotate: 4  },
  ];

  return (
    <div className="relative w-full" style={{ height: '180px', margin: '8px 0' }}>
      {slots.map(({ type, left, top, zIndex, scale, rotate }) => {
        const placed = placedOfferings.find((o) => o.type === type);
        const label = OFFERING_LABELS[type];
        const isHovered = hovered === type;

        return (
          <div
            key={type}
            className="absolute cursor-pointer group"
            style={{
              left,
              top,
              zIndex,
              transform: `scale(${scale * (isHovered ? 1.1 : 1)}) rotate(${rotate}deg)`,
              transformOrigin: 'center bottom',
              transition: 'transform 0.2s ease, filter 0.2s ease',
              filter: placed ? 'none' : 'grayscale(0.6) brightness(0.6)',
            }}
            onMouseEnter={() => setHovered(type)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => placed ? onRemove(placed.id) : onPlace(type)}
          >
            <RealisticDish type={type} placed={!!placed} hovered={isHovered} />
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{ fontSize: '9px', color: placed ? '#f4a825' : '#7a7060' }}
            >
              {label.zh}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ 灯笼 ============

export function Lantern({ side }: { side: 'left' | 'right' }) {
  return (
    <motion.div
      animate={{ rotate: side === 'left' ? -2 : 2 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-6" style={{ background: 'linear-gradient(180deg, #2a2a35, #f4a825)' }} />
        <div
          className="w-14 h-16 rounded-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #e63946 0%, #a61c2a 100%)',
            boxShadow: '0 0 20px rgba(230,57,70,0.6), inset 0 0 15px rgba(244,168,37,0.3)',
            border: '1px solid rgba(230,57,70,0.4)',
          }}
        >
          <div className="absolute inset-2 rounded opacity-60"
            style={{ background: 'radial-gradient(ellipse, rgba(244,168,37,0.5), transparent)', animation: 'flicker 3s ease-in-out infinite' }} />
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-zhu text-c-gold opacity-60" style={{ fontSize: '14px', textShadow: '0 0 10px rgba(244,168,37,0.8)' }}>
              福
            </span>
          </div>
        </div>
        <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, #f4a825, #7a7570)' }} />
        <div className="w-2 h-3 rounded-b"
          style={{ background: 'linear-gradient(180deg, #f4a825, #a16e10)', boxShadow: '0 0 8px rgba(244,168,37,0.4)' }} />
      </div>
    </motion.div>
  );
}

// ============ 香烛燃芯 ============

export function LitIncenseStick({ incense, now }: { incense: { duration: number; litAt: number }; now: number }) {
  const remaining = Math.max(0, incense.duration - (now - incense.litAt));
  const progress = remaining / incense.duration;
  const height = 24 + progress * 10;

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute -top-3 w-2 h-3 rounded-t-full"
        style={{
          background: 'radial-gradient(ellipse at bottom, #fff 0%, #f4a825 40%, #e63946 80%, transparent 100%)',
          animation: 'flame-flicker 0.3s ease-in-out infinite',
          filter: 'blur(0.5px)',
        }}
      />
      <div className="w-1.5 rounded-t"
        style={{
          height: `${height}px`,
          background: `linear-gradient(180deg, #4a3520 ${(1 - progress) * 100}%, #2a1a10 100%)`,
        }}
      />
      {progress < 0.7 && (
        <div className="absolute w-1.5 h-1 rounded-full -top-0.5" style={{ background: '#8a7a6a' }} />
      )}
    </div>
  );
}
