import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { RealisticOfferingTable, Lantern, LitIncenseStick } from './AltarDecor';


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
    <div className="relative flex flex-col items-center px-4" data-altar-capture>
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

