import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Sidebar from './components/shared/Sidebar';
import ParticleBackground from './components/shared/ParticleBackground';
import AltarView from './components/Altar/AltarView';
import IncenseView from './components/Incense/IncenseView';
import OfferingsView from './components/Offerings/OfferingsView';
import PaperOfferingsView from './components/PaperOfferings/PaperOfferingsView';
import FamilyTreeView from './components/FamilyTree/FamilyTreeView';
import MemorialDaysView from './components/MemorialDays/MemorialDaysView';
import PrayersView from './components/Prayers/PrayersView';
import RitualGuide from './components/Ritual/RitualGuide';

const SECTION_TITLES: Record<string, string> = {
  altar: '祭坛',
  incense: '香火',
  offerings: '供品',
  paper: '元宝',
  family: '家谱',
  memorial: '祭日',
  prayers: '祈福',
  ritual: '祭祀',
};

const viewVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function SectionRouter() {
  const { activeSection } = useStore();

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          variants={viewVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeSection === 'altar' && <AltarView />}
          {activeSection === 'incense' && <IncenseView />}
          {activeSection === 'offerings' && <OfferingsView />}
          {activeSection === 'paper' && <PaperOfferingsView />}
          {activeSection === 'family' && <FamilyTreeView />}
          {activeSection === 'memorial' && <MemorialDaysView />}
          {activeSection === 'prayers' && <PrayersView />}
          {activeSection === 'ritual' && <RitualGuide />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <div
      className="relative flex"
      style={{ height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}
    >
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(230,57,70,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0,229,255,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(244,168,37,0.02) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      <ParticleBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main — fills remaining width and full height */}
      <main className="relative flex flex-col flex-1" style={{ zIndex: 1, minWidth: 0 }}>
        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6"
          style={{
            height: '48px',
            background: 'rgba(10,10,15,0.95)',
            borderBottom: '1px solid rgba(42,42,53,0.6)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-c-muted text-xs font-mono">CYBER ZHEN ZU</span>
            <span className="text-c-border">|</span>
            <CurrentSectionTitle />
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 rounded text-xs font-mono"
              style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946' }}
            >
              <span className="text-[9px] opacity-60 mr-1">●</span>
              数字化祭祖
            </div>
          </div>
        </header>

        {/* Page content — scrollable */}
        <SectionRouter />
      </main>
    </div>
  );
}

function CurrentSectionTitle() {
  const { activeSection } = useStore();
  const title = SECTION_TITLES[activeSection] || '';
  return (
    <span className="font-zhu text-sm" style={{ color: '#f0ece3', letterSpacing: '0.1em' }}>
      {title}
    </span>
  );
}

export default App;
