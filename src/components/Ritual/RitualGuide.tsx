import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

// 叩首音效：用 Web Audio API 生成合成音
function playKnockSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

function playBellSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    osc2.type = 'sine';
    osc2.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.5);
    osc2.stop(ctx.currentTime + 2.5);
  } catch {}
}

function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t);
      osc.stop(t + 0.8);
    });
  } catch {}
}

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

// 鞠躬动画状态
function BowAnimation({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={active ? { rotateX: [-20, 0, -15, 0, -10, 0] } : { rotateX: 0 }}
      transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      style={{ transformOrigin: 'center bottom', display: 'inline-block' }}
    >
      <div className="text-6xl">⛩️</div>
    </motion.div>
  );
}

// 叩首动画
function KowtowAnimation({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={i < count ? { y: [0, 20, 0], scale: [1, 0.9, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: i < count ? 'rgba(230,57,70,0.3)' : 'rgba(26,26,37,0.6)',
              border: `1px solid ${i < count ? '#e63946' : '#2a2a35'}`,
            }}
          >
            {i < count ? '🙏' : '○'}
          </div>
          {i < count && (
            <span className="text-xs font-mono text-c-gold">
              第{i + 1}叩
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// 献供动画
function OfferingAnimation({ placed }: { placed: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: -20 }}
      animate={placed ? { scale: 1, opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: 'spring' }}
      className="text-5xl"
    >
      🍎🍊🍵
    </motion.div>
  );
}

// 敬酒动画
function WineAnimation({ poured }: { poured: boolean }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <motion.div
        animate={poured ? { y: [-5, 5, -5], opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl"
      >
        🍶
      </motion.div>
      {poured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          ✨
        </motion.div>
      )}
    </div>
  );
}

// 化纸动画
function PaperBurnAnimation({ burning }: { burning: boolean }) {
  return (
    <div className="text-5xl">
      <AnimatePresence>
        {burning ? (
          <motion.div
            key="burning"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            💰🔥
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            💰
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RitualGuide() {
  const {
    ritualActive,
    ritualStep,
    startRitual,
    advanceRitual,
    endRitual,
    lightIncense,
    placeOffering,
    addPaperOffering,
    burnPaperOffering,
    ancestors,
  } = useStore();

  const [kowtowCount, setKowtowCount] = useState(0);
  const [_bowCount, setBowCount] = useState(0);
  const [bowActive, setBowActive] = useState(false);

  // 姓氏自动提取（与家谱页面保持一致）
  const surname = (() => {
    if (ancestors.length === 0) return '陈';
    const counts: Record<string, number> = {};
    const COMMON = ['李','王','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','彭','钱','蒋','蔡','潘','田','杜','叶','余','苏','卢','姜','崔','钟','谭','陆','汪','范','金','韦','夏','方','石','姚','雷','毛','侯','邵','孟','龙','万','段','漕','钱','颜','丁'];
    const TITLES = ['曾祖父','曾祖母','祖父','祖母','父亲','母亲','父','母'];
    for (const a of ancestors) {
      let n = a.name;
      for (const t of TITLES) { if (n.startsWith(t)) { n = n.slice(t.length).trim(); break; } }
      if (!n) continue;
      const s2 = n.slice(0, 2);
      const s = COMMON.includes(s2) ? s2 : n[0];
      if (s) counts[s] = (counts[s] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '陈';
  })();
  const [bellRang, setBellRang] = useState(0);
  const [offeringPlaced, setOfferingPlaced] = useState(false);
  const [winePoured, setWinePoured] = useState(false);
  const [paperBurning, setPaperBurning] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [showPrayerInput, setShowPrayerInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);

  const currentStepData = RITUAL_STEPS.find((s) => s.id === ritualStep);

  // 重置状态当步骤变化时
  useEffect(() => {
    setStepCompleted(false);
    setBowCount(0);
    setBowActive(false);
    setBellRang(0);
    setOfferingPlaced(false);
    setWinePoured(false);
    setPaperBurning(false);
    setShowPrayerInput(false);
    playSuccessChime();
  }, [ritualStep]);

  // 重置全部状态当仪式结束时
  const handleEnd = useCallback(() => {
    setKowtowCount(0);
    setBowCount(0);
    setBowActive(false);
    setBellRang(0);
    setOfferingPlaced(false);
    setWinePoured(false);
    setPaperBurning(false);
    setPrayerText('');
    setShowPrayerInput(false);
    setShowSuccess(false);
    endRitual();
  }, [endRitual]);

  // 完成祈福
  const handlePrayerSubmit = () => {
    setShowPrayerInput(false);
    setPrayerText('');
    setStepCompleted(true);
    playSuccessChime();
    setTimeout(() => {
      advanceRitual();
      // 仪式结束
      setShowSuccess(true);
      playSuccessChime();
    }, 1500);
  };

  // 点击主按钮
  const handleMainAction = () => {
    if (!currentStepData) return;
    const { action } = currentStepData;

    if (action === 'incense') {
      if (!stepCompleted) {
        // 点燃三炷香
        for (let i = 0; i < 3; i++) {
          setTimeout(() => lightIncense({ type: 'sandalwood', duration: 60000 }), i * 200);
        }
        setStepCompleted(true);
      } else {
        advanceRitual();
      }
      return;
    }

    if (action === 'offering') {
      if (!stepCompleted) {
        const types: Array<'fruit'|'tangerine'|'tea'|'wine'|'sweet'|'tangyuan'|'rice'|'chicken'|'zongzi'|'flower'|'candy'|'cigarette'> = ['fruit','tangerine','tea','wine','sweet'];
        types.forEach((type, i) => {
          setTimeout(() => {
            placeOffering({ id: `ritual-offering-${Date.now()}-${i}`, type, placedAt: Date.now() });
          }, i * 300);
        });
        setStepCompleted(true);
        setOfferingPlaced(true);
      } else {
        advanceRitual();
      }
      return;
    }

    if (action === 'wine') {
      if (!stepCompleted) {
        setStepCompleted(true);
        setWinePoured(true);
      } else {
        advanceRitual();
      }
      return;
    }

    if (action === 'bow') {
      if (stepCompleted) {
        advanceRitual();
        return;
      }
      setBowCount((c) => {
        if (c >= 2) {
          setTimeout(() => setStepCompleted(true), 0);
          return 0;
        }
        setBowActive(true);
        setTimeout(() => setBowActive(false), 500);
        return c + 1;
      });
      return;
    }

    if (action === 'kowtow') {
      if (stepCompleted) {
        advanceRitual();
        return;
      }
      setKowtowCount((c) => {
        if (c >= 2) {
          setTimeout(() => setStepCompleted(true), 0);
          return 0;
        }
        playKnockSound();
        return c + 1;
      });
      return;
    }

    if (action === 'bell') {
      if (stepCompleted) {
        advanceRitual();
        return;
      }
      setBellRang((c) => {
        if (c >= 2) {
          setTimeout(() => {
            setBellRang(0);
            setStepCompleted(true);
          }, 0);
          return c;
        }
        playBellSound();
        return c + 1;
      });
      return;
    }

    if (action === 'paper') {
      if (!stepCompleted) {
        ['gold_ingot', 'silver_ingot', 'spirit_money'].forEach((type, i) => {
          setTimeout(() => {
            addPaperOffering(type as any);
            setPaperBurning(true);
            const id = `ritual-paper-${Date.now()}-${i}`;
            // burn after a short delay
            setTimeout(() => burnPaperOffering(id), 800);
          }, i * 400);
        });
        setStepCompleted(true);
      } else {
        advanceRitual();
      }
      return;
    }

    if (action === 'pray') {
      setShowPrayerInput(true);
      return;
    }

    // 其他步骤
    setStepCompleted(true);
    setTimeout(() => advanceRitual(), 500);
  };

  const getButtonLabel = () => {
    if (!currentStepData) return '';
    const { action } = currentStepData;
    if (stepCompleted && action !== 'kowtow' && action !== 'bell' && action !== 'bow') return '下一步 →';
    if (action === 'bow') return stepCompleted ? '下一步 →' : '鞠躬';
    if (action === 'kowtow') return stepCompleted ? '下一步 →' : '叩首';
    if (action === 'bell') return stepCompleted ? '下一步 →' : `鸣钟 (${bellRang}/3)`;
    if (action === 'pray') return showPrayerInput ? '' : '祈福';
    return '执行';
  };

  // 成功完成界面
  if (showSuccess) {
    return (
      <div className="relative flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            ✨
          </motion.div>
          <h2 className="font-zhu text-3xl text-c-gold text-glow-gold mb-3">祭祀圆满</h2>
          <p className="text-c-muted text-sm font-zhu mb-2">先祖有知，佑尔平安</p>
          <p className="text-c-muted text-xs font-mono mb-8">Ritual Complete · All 8 Steps Finished</p>
          <button
            onClick={handleEnd}
            className="px-6 py-2 rounded font-zhu text-sm cursor-pointer"
            style={{
              background: 'rgba(244,168,37,0.15)',
              border: '1px solid rgba(244,168,37,0.4)',
              color: '#f4a825',
            }}
          >
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-6">
        <h1 className="font-zhu text-3xl text-c-gold text-glow-gold mb-1">祭祀大典</h1>
        <p className="text-c-muted text-xs font-mono">GUIDED RITUAL SEQUENCE</p>
      </div>

      <AnimatePresence mode="wait">
        {!ritualActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-56 h-36 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(17,17,24,0.9), rgba(10,10,15,0.95))',
                border: '1px solid rgba(244,168,37,0.3)',
                boxShadow: '0 0 40px rgba(244,168,37,0.1)',
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-3">⛩️</div>
                <div className="font-zhu text-c-gold text-lg">{surname}氏宗祠</div>
                <div className="text-c-muted text-xs font-mono mt-1">Cyber Zhen Zu</div>
              </div>
            </motion.div>

            <p className="font-zhu text-c-text text-sm text-center leading-relaxed max-w-sm">
              祭祀祖先，追思先人
              <br />
              <span className="text-c-muted text-xs">八步仪程，从点香至祈福</span>
            </p>

            <button
              onClick={startRitual}
              className="px-8 py-4 rounded-lg font-zhu text-lg cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, rgba(230,57,70,0.2), rgba(230,57,70,0.08))',
                border: '1px solid rgba(230,57,70,0.5)',
                color: '#e63946',
                boxShadow: '0 0 30px rgba(230,57,70,0.2)',
                letterSpacing: '0.2em',
              }}
            >
              开始祭祀
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="ritual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl flex flex-col gap-5"
          >
            {/* 步骤进度条 */}
            <div>
              <div className="flex justify-between mb-2 px-1">
                {RITUAL_STEPS.map((step) => {
                  const isDone = step.id < ritualStep;
                  const isCurrent = step.id === ritualStep;
                  return (
                    <button
                      key={step.id}
                      className="flex flex-col items-center gap-0.5 cursor-default"
                      onClick={() => {}}
                      title={step.name}
                    >
                      <motion.div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          background: isDone
                            ? 'rgba(244,168,37,0.2)'
                            : isCurrent
                            ? 'rgba(230,57,70,0.25)'
                            : 'rgba(26,26,37,0.6)',
                          border: `1.5px solid ${isDone ? '#f4a825' : isCurrent ? '#e63946' : '#2a2a35'}`,
                          boxShadow: isCurrent ? '0 0 12px rgba(230,57,70,0.5)' : 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        {isDone ? (
                          <span style={{ color: '#f4a825' }}>✓</span>
                        ) : (
                          <span>{step.icon}</span>
                        )}
                      </motion.div>
                      {isCurrent && (
                        <span className="text-[8px] font-zhu" style={{ color: '#e63946' }}>
                          {step.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* 进度条 */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(26,26,37,0.8)', border: '1px solid #2a2a35' }}>
                <motion.div
                  className="h-full rounded-full"
                  layoutId="ritual-progress"
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{
                    width: `${((ritualStep - 1) / RITUAL_STEPS.length) * 100}%`,
                    background: 'linear-gradient(90deg, #e63946, #f4a825)',
                    boxShadow: '0 0 8px rgba(230,57,70,0.6)',
                  }}
                />
              </div>
              <div className="text-center mt-1">
                <span className="text-c-muted text-[10px] font-mono">
                  第 {ritualStep} / {RITUAL_STEPS.length} 步
                </span>
              </div>
            </div>

            {/* 当前步骤卡片 */}
            {currentStepData && (
              <motion.div
                key={ritualStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg p-6 text-center"
                style={{
                  background: 'rgba(17,17,24,0.85)',
                  border: stepCompleted
                    ? '1px solid rgba(244,168,37,0.4)'
                    : '1px solid rgba(230,57,70,0.3)',
                  boxShadow: stepCompleted
                    ? '0 0 40px rgba(244,168,37,0.1)'
                    : '0 0 40px rgba(230,57,70,0.1)',
                  transition: 'box-shadow 0.5s, border-color 0.5s',
                }}
              >
                {/* 步骤动画区 */}
                <div className="h-28 flex items-center justify-center mb-4">
                  {currentStepData.action === 'bow' && (
                    <BowAnimation active={bowActive} />
                  )}
                  {currentStepData.action === 'kowtow' && (
                    <KowtowAnimation count={kowtowCount} />
                  )}
                  {currentStepData.action === 'offering' && (
                    <OfferingAnimation placed={offeringPlaced} />
                  )}
                  {currentStepData.action === 'wine' && (
                    <WineAnimation poured={winePoured} />
                  )}
                  {currentStepData.action === 'paper' && (
                    <PaperBurnAnimation burning={paperBurning} />
                  )}
                  {currentStepData.action === 'bell' && (
                    <BellAnimation rang={bellRang} />
                  )}
                  {currentStepData.action === 'incense' && (
                    <IncenseAnimation lit={stepCompleted} />
                  )}
                  {currentStepData.action === 'pray' && !showPrayerInput && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl"
                    >
                      ✨
                    </motion.div>
                  )}
                </div>

                {/* 步骤信息 */}
                <div className="mb-1">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      background: stepCompleted ? 'rgba(244,168,37,0.15)' : 'rgba(230,57,70,0.15)',
                      border: `1px solid ${stepCompleted ? 'rgba(244,168,37,0.4)' : 'rgba(230,57,70,0.3)'}`,
                      color: stepCompleted ? '#f4a825' : '#e63946',
                    }}
                  >
                    {stepCompleted ? '✓ 已完成' : '进行中'}
                  </span>
                </div>
                <div className="font-zhu text-xl text-c-text mb-1" style={{ letterSpacing: '0.15em' }}>
                  {currentStepData.name}
                </div>
                <div className="text-c-muted text-[10px] font-mono mb-4">{currentStepData.nameEn}</div>
                <div className="font-zhu text-sm text-c-text leading-relaxed mb-6" style={{ maxWidth: 360, margin: '0 auto 24px' }}>
                  {currentStepData.desc}
                </div>

                {/* 祈福输入 */}
                <AnimatePresence>
                  {showPrayerInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 text-left"
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
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrayerSubmit}
                          className="flex-1 py-2 rounded font-zhu text-sm cursor-pointer"
                          style={{
                            background: 'rgba(244,168,37,0.15)',
                            border: '1px solid rgba(244,168,37,0.4)',
                            color: '#f4a825',
                          }}
                        >
                          提交祈福
                        </button>
                        <button
                          onClick={() => { setShowPrayerInput(false); }}
                          className="flex-1 py-2 rounded font-zhu text-sm cursor-pointer"
                          style={{ background: 'transparent', border: '1px solid #2a2a35', color: '#7a7570' }}
                        >
                          取消
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 主按钮 */}
                {!showPrayerInput && (
                  <button
                    onClick={handleMainAction}
                    className="px-8 py-3 rounded-lg font-zhu text-base cursor-pointer transition-all"
                    style={{
                      background: stepCompleted
                        ? 'rgba(244,168,37,0.15)'
                        : 'rgba(230,57,70,0.15)',
                      border: `1px solid ${stepCompleted ? 'rgba(244,168,37,0.5)' : 'rgba(230,57,70,0.4)'}`,
                      color: stepCompleted ? '#f4a825' : '#e63946',
                      boxShadow: stepCompleted
                        ? '0 0 20px rgba(244,168,37,0.15)'
                        : '0 0 20px rgba(230,57,70,0.1)',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {getButtonLabel()}
                  </button>
                )}
              </motion.div>
            )}

            {/* 退出 */}
            <button
              onClick={handleEnd}
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

// 钟动画
function BellAnimation({ rang }: { rang: number }) {
  const [swinging, setSwinging] = useState(false);

  useEffect(() => {
    if (rang > 0) {
      setSwinging(true);
      const t = setTimeout(() => setSwinging(false), 1000);
      return () => clearTimeout(t);
    }
  }, [rang]);

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={swinging ? { rotate: [-10, 8, -6, 5, -3, 0] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="w-px h-6" style={{ background: 'linear-gradient(180deg, #f4a825, #8a6914)' }} />
        <div
          className="w-14 h-12 rounded-t-full rounded-b"
          style={{
            background: 'linear-gradient(180deg, #f4a825 0%, #c4860a 50%, #8a6010 100%)',
            boxShadow: swinging
              ? '0 0 40px rgba(244,168,37,0.8), 0 0 80px rgba(244,168,37,0.3)'
              : '0 0 15px rgba(244,168,37,0.3)',
            border: '1px solid rgba(244,168,37,0.5)',
          }}
        />
      </motion.div>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i < rang ? '#f4a825' : 'rgba(26,26,37,0.6)',
              border: `1px solid ${i < rang ? '#f4a825' : '#2a2a35'}`,
              boxShadow: i < rang ? '0 0 6px rgba(244,168,37,0.8)' : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// 香烟动画
function IncenseAnimation({ lit }: { lit: boolean }) {
  return (
    <div className="flex items-end justify-center gap-3 h-20">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0 }}
          animate={lit ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: i * 0.2, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* 火焰 */}
          {lit && (
            <motion.div
              className="w-2 h-3 rounded-t-full"
              style={{
                background: 'radial-gradient(ellipse at bottom, #fff 0%, #f4a825 40%, #e63946 80%, transparent 100%)',
                animation: 'flame-flicker 0.3s ease-in-out infinite',
                filter: 'blur(0.5px)',
              }}
            />
          )}
          {/* 香棒 */}
          <div
            className="w-1 rounded-t"
            style={{
              height: lit ? '24px' : '0px',
              background: lit ? '#3a2515' : 'transparent',
              transition: 'height 0.4s',
            }}
          />
        </motion.div>
      ))}
      {lit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl"
        >
          🕯️
        </motion.div>
      )}
    </div>
  );
}
