import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { OFFERING_LABELS } from '../../data/demo';
import type { Offering } from '../../types';

const ALL_OFFERING_TYPES: Offering['type'][] = ['fruit', 'tea', 'wine', 'sweet', 'flower', 'zongzi'];

export default function OfferingsView() {
  const { placedOfferings, placeOffering, removeOffering } = useStore();
  const [flashId, setFlashId] = useState<string | null>(null);

  const handlePlace = (type: Offering['type']) => {
    const id = `offering-${Date.now()}-${Math.random()}`;
    placeOffering({ id, type, placedAt: Date.now() });
    setFlashId(id);
    setTimeout(() => setFlashId(null), 500);
  };

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">献供</h1>
        <p className="text-c-muted text-xs font-mono">PRESENT OFFERINGS TO YOUR ANCESTORS</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Available offerings */}
        <div
          className="rounded-lg p-5"
          style={{
            background: 'rgba(17,17,24,0.8)',
            border: '1px solid #2a2a35',
            minWidth: '300px',
          }}
        >
          <h3 className="font-zhu text-c-text text-sm mb-4 text-center" style={{ letterSpacing: '0.1em' }}>
            选择供品
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {ALL_OFFERING_TYPES.map((type) => {
              const label = OFFERING_LABELS[type];
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlace(type)}
                  className="flex flex-col items-center gap-1 px-4 py-4 rounded-lg transition-all cursor-pointer"
                  style={{
                    background: 'rgba(26,26,37,0.6)',
                    border: '1px solid #2a2a35',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,168,37,0.5)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(244,168,37,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2a2a35';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <span className="text-3xl">{label.emoji}</span>
                  <span className="font-zhu text-c-text text-sm">{label.zh}</span>
                  <span className="text-c-muted text-[10px] font-mono">{label.en}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Altar view */}
        <div
          className="rounded-lg p-5"
          style={{
            background: 'rgba(17,17,24,0.8)',
            border: '1px solid #2a2a35',
            minWidth: '350px',
          }}
        >
          <h3 className="font-zhu text-c-text text-sm mb-4 text-center" style={{ letterSpacing: '0.1em' }}>
            当前供桌
          </h3>

          {placedOfferings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-c-muted">
              <span className="text-4xl mb-2">🍽️</span>
              <span className="text-xs font-mono">供桌空置</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {placedOfferings.map((offering) => (
                  <OfferingItem
                    key={offering.id}
                    offering={offering}
                    isFlashing={flashId === offering.id}
                    onRemove={() => removeOffering(offering.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {placedOfferings.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-c-muted text-xs font-mono">
                {placedOfferings.length} 件供品已上供
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferingItem({
  offering,
  isFlashing,
  onRemove,
}: {
  offering: Offering;
  isFlashing: boolean;
  onRemove: () => void;
}) {
  const label = OFFERING_LABELS[offering.type];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
      className="relative flex flex-col items-center gap-1 p-3 rounded-lg cursor-pointer"
      style={{
        background: isFlashing ? 'rgba(244,168,37,0.2)' : 'rgba(26,26,37,0.6)',
        border: `1px solid ${isFlashing ? 'rgba(244,168,37,0.6)' : '#2a2a35'}`,
        boxShadow: isFlashing ? '0 0 20px rgba(244,168,37,0.3)' : 'none',
        transition: 'all 0.3s ease',
      }}
      onClick={onRemove}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(230,57,70,0.5)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(230,57,70,0.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#2a2a35';
        (e.currentTarget as HTMLElement).style.background = 'rgba(26,26,37,0.6)';
      }}
    >
      <span className="text-2xl">{label.emoji}</span>
      <span className="font-zhu text-c-text text-[10px]">{label.zh}</span>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
        style={{ background: '#e63946' }}>
        ×
      </div>
    </motion.div>
  );
}
