import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

const RITUAL_STEPS = [
  { id: 1, name: '点香', nameEn: 'Light Incense', icon: '🔥', desc: '点燃三炷香，置于香炉之中', action: 'incense' },
  { id: 2, name: '献供', nameEn: 'Present Offerings', icon: '🍎', desc: '摆放水果、茶酒等供品于供桌', action: 'offering' },
  { id: 3, name: '敬酒', nameEn: 'Pour Tea/Wine', icon: '🍶', desc: '恭敬地献上清茶或清酒', action: 'wine' },
  { id: 4, name: '上香', nameEn: 'Offer Incense', icon: '香', desc: '双手持香，躬身行礼三鞠躬', action: 'bow' },
  { id: 5, name: '叩拜', nameEn: 'Kowtow', icon: '🙏', desc: '肃穆叩首三次，以表敬意', action: 'kowtow' },
  { id: 6, name: '鸣钟', nameEn: 'Ring Bell', icon: '🔔', desc: '敲击铜钟三声，警醒神明', action: 'bell' },
  { id: 7, name: '化纸', nameEn: 'Burn Offerings', icon: '💰', desc: '焚烧纸钱元宝，送达阴间', action: 'paper' },
  { id: 8, name: '祈福', nameEn: 'Pray & Bless', icon: '✨', desc: '心中默念，向祖先祈求庇佑', action: 'pray' },
];

export default function RitualGuide() {
  const {
    ritualActive,
    ritualStep,
    startRitual,
    advanceRitual,
    endRitual,
    ringBell,
    bellRinging,
  } = useStore();

  const [kowtowCount, setKowtowCount] = useState(0);
  const [prayerText, setPrayerText] = useState('');
  const [showPrayerInput, setShowPrayerInput] = useState(false);

  const currentStepData = RITUAL_STEPS.find((s) => s.id === ritualStep);

  const handleStepAction = () => {
    if (!currentStepData) return;
    const { action } = currentStepData;

    if (action === 'kowtow') {
      setKowtowCount((c) => {
        if (c >= 2) {
          // 第三次叩完，用 setTimeout 避免在 setState 回调里再次 setState
          setTimeout(() => {
            setKowtowCount(0);
            advanceRitual();
          }, 0);
          return c;
        }
        // Play kowtow sound
        if (typeof window !== 'undefined') {
          const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleQERQ=');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
        return c + 1;
      });
      return;
    }

    if (action === 'bell') {
      ringBell();
      return;
    }

    if (action === 'pray') {
      setShowPrayerInput(true);
      return;
    }

    advanceRitual();
  };

  const handlePrayerSubmit = () => {
    setShowPrayerInput(false);
    setPrayerText('');
    advanceRitual();
  };

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">祭祀大典</h1>
        <p className="text-c-muted text-xs font-mono">GUIDED RITUAL SEQUENCE</p>
      </div>

      <AnimatePresence mode="wait">
        {!ritualActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Decorative altar preview */}
            <div
              className="w-64 h-40 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(17,17,24,0.8), rgba(10,10,15,0.9))',
                border: '1px solid rgba(244,168,37,0.3)',
                boxShadow: '0 0 40px rgba(244,168,37,0.1)',
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-3">⛩️</div>
                <div className="font-zhu text-c-gold text-lg">陈氏宗祠</div>
                <div className="text-c-muted text-xs font-mono mt-1">Cyber Zhen Zu</div>
              </div>
            </div>

            <div className="text-center">
              <p className="font-zhu text-c-text text-sm mb-6 max-w-md leading-relaxed">
                祭祀祖先，追思先人。依古礼而行，共八步仪程。
                <br />
                <span className="text-c-muted text-xs">
                  从点香至祈福，完成一场完整的祭祀仪轨。
                </span>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRitual}
              className="px-8 py-4 rounded-lg font-zhu text-lg transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, rgba(230,57,70,0.2), rgba(230,57,70,0.1))',
                border: '1px solid rgba(230,57,70,0.5)',
                color: '#e63946',
                boxShadow: '0 0 30px rgba(230,57,70,0.2)',
                letterSpacing: '0.2em',
              }}
            >
              开始祭祀
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="ritual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl flex flex-col gap-6"
          >
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-2">
                {RITUAL_STEPS.map((step) => {
                  const isDone = step.id < ritualStep;
                  const isCurrent = step.id === ritualStep;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{
                          background: isDone
                            ? 'rgba(244,168,37,0.2)'
                            : isCurrent
                            ? 'rgba(230,57,70,0.2)'
                            : 'rgba(26,26,37,0.6)',
                          border: `1px solid ${isDone ? '#f4a825' : isCurrent ? '#e63946' : '#2a2a35'}`,
                          boxShadow: isCurrent ? '0 0 15px rgba(230,57,70,0.4)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isDone ? '✓' : step.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="h-1 rounded-full"
                style={{
                  background: 'rgba(26,26,37,0.6)',
                  border: '1px solid #2a2a35',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((ritualStep - 1) / RITUAL_STEPS.length) * 100}%` }}
                  style={{
                    background: 'linear-gradient(90deg, #e63946, #f4a825)',
                    boxShadow: '0 0 10px rgba(230,57,70,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Current step card */}
            {currentStepData && (
              <motion.div
                key={ritualStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-8 text-center"
                style={{
                  background: 'rgba(17,17,24,0.8)',
                  border: '1px solid rgba(230,57,70,0.3)',
                  boxShadow: '0 0 40px rgba(230,57,70,0.1)',
                }}
              >
                <div className="text-5xl mb-4">{currentStepData.icon}</div>
                <div className="font-zhu text-c-gold text-2xl mb-1 text-glow-gold" style={{ letterSpacing: '0.2em' }}>
                  {currentStepData.name}
                </div>
                <div className="text-c-muted text-xs font-mono mb-4">{currentStepData.nameEn}</div>
                <div
                  className="text-c-text text-sm font-zhu mb-6 leading-relaxed"
                  style={{ maxWidth: '400px', margin: '0 auto 24px' }}
                >
                  {currentStepData.desc}
                </div>

                {/* Special step interactions */}
                {currentStepData.action === 'kowtow' && (
                  <div className="mb-4">
                    <div className="flex justify-center gap-2 mb-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: i <= kowtowCount ? 'rgba(230,57,70,0.3)' : 'rgba(26,26,37,0.6)',
                            border: `1px solid ${i <= kowtowCount ? '#e63946' : '#2a2a35'}`,
                          }}
                        >
                          {i < kowtowCount ? '🙏' : ''}
                        </div>
                      ))}
                    </div>
                    <p className="text-c-muted text-xs font-mono">
                      {kowtowCount < 3 ? `再叩 ${3 - kowtowCount} 次` : '三叩已毕'}
                    </p>
                  </div>
                )}

                {currentStepData.action === 'bell' && (
                  <div className="mb-4">
                    <p className="text-c-muted text-xs font-mono mb-2">
                      {bellRinging ? '🔔 钟声悠扬...' : '点击钟身鸣钟'}
                    </p>
                    <BellDisplay ringing={bellRinging} />
                  </div>
                )}

                {showPrayerInput && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4"
                  >
                    <textarea
                      value={prayerText}
                      onChange={(e) => setPrayerText(e.target.value.slice(0, 100))}
                      placeholder="心中默念，向祖先诉说..."
                      rows={3}
                      className="w-full rounded p-3 text-sm resize-none mb-3"
                      style={{
                        background: 'rgba(26,26,37,0.6)',
                        border: '1px solid rgba(244,168,37,0.3)',
                        color: '#f0ece3',
                        fontFamily: 'ZCOOL XiaoWei, serif',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      onClick={handlePrayerSubmit}
                      className="px-6 py-2 rounded font-zhu text-sm cursor-pointer"
                      style={{
                        background: 'rgba(244,168,37,0.15)',
                        border: '1px solid rgba(244,168,37,0.4)',
                        color: '#f4a825',
                      }}
                    >
                      完成祈福
                    </button>
                  </motion.div>
                )}

                {!showPrayerInput && (
                  <button
                    onClick={handleStepAction}
                    disabled={
                      (currentStepData.action === 'kowtow' && kowtowCount < 3) ||
                      (currentStepData.action === 'bell' && bellRinging)
                    }
                    className="px-8 py-3 rounded-lg font-zhu text-sm transition-all cursor-pointer disabled:opacity-30"
                    style={{
                      background: 'rgba(230,57,70,0.15)',
                      border: '1px solid rgba(230,57,70,0.4)',
                      color: '#e63946',
                    }}
                  >
                    {currentStepData.action === 'kowtow'
                      ? kowtowCount < 3 ? '叩首' : '下一步'
                      : currentStepData.action === 'bell'
                      ? bellRinging ? '钟声中...' : '鸣钟'
                      : currentStepData.action === 'pray'
                      ? '祈福'
                      : '下一步'}
                  </button>
                )}
              </motion.div>
            )}

            {/* Exit */}
            <button
              onClick={endRitual}
              className="text-c-muted text-xs font-mono hover:text-c-red transition-colors cursor-pointer text-center"
            >
              退出祭祀
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BellDisplay({ ringing }: { ringing: boolean }) {
  return (
    <motion.div
      animate={ringing ? { rotate: [-8, 6, -5, 4, -2, 0] } : {}}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="inline-flex flex-col items-center cursor-pointer"
      onClick={() => {}}
    >
      <div className="w-px h-4" style={{ background: 'linear-gradient(180deg, #f4a825, #8a6914)' }} />
      <div
        className="w-10 h-8 rounded-t-full rounded-b"
        style={{
          background: 'linear-gradient(180deg, #f4a825 0%, #c4860a 50%, #8a6010 100%)',
          boxShadow: ringing
            ? '0 0 30px rgba(244,168,37,0.8), 0 0 60px rgba(244,168,37,0.4)'
            : '0 0 10px rgba(244,168,37,0.2)',
          border: '1px solid rgba(244,168,37,0.4)',
        }}
      />
      {ringing && (
        <div className="absolute mt-2 text-c-gold text-lg">🔔</div>
      )}
    </motion.div>
  );
}
