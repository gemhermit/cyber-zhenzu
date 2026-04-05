import { lazy, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/shared/Sidebar';
import ParticleBackground from './components/shared/ParticleBackground';
import ShareModal from './components/shared/ShareModal';

const AltarView = lazy(() => import('./components/Altar/AltarView'));
const IncenseView = lazy(() => import('./components/Incense/IncenseView'));
const OfferingsView = lazy(() => import('./components/Offerings/OfferingsView'));
const PaperOfferingsView = lazy(() => import('./components/PaperOfferings/PaperOfferingsView'));
const FamilyTreeView = lazy(() => import('./components/FamilyTree/FamilyTreeView'));
const MemorialDaysView = lazy(() => import('./components/MemorialDays/MemorialDaysView'));
const PrayersView = lazy(() => import('./components/Prayers/PrayersView'));
const RitualGuide = lazy(() => import('./components/Ritual/RitualGuide'));

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

const ROUTE_TO_SECTION: Record<string, string> = {
  '/altar': 'altar',
  '/incense': 'incense',
  '/offerings': 'offerings',
  '/paper': 'paper',
  '/family': 'family',
  '/memorial': 'memorial',
  '/prayers': 'prayers',
  '/ritual': 'ritual',
};

const SECTION_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<{}>>> = {
  altar: AltarView,
  incense: IncenseView,
  offerings: OfferingsView,
  paper: PaperOfferingsView,
  family: FamilyTreeView,
  memorial: MemorialDaysView,
  prayers: PrayersView,
  ritual: RitualGuide,
};

const viewVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full" style={{ minHeight: '400px' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-c-gold border-t-transparent animate-spin" />
        <span className="text-c-muted text-xs font-mono">加载中...</span>
      </div>
    </div>
  );
}

function PageContent() {
  const location = useLocation();
  const section = ROUTE_TO_SECTION[location.pathname] || 'altar';
  const Component = SECTION_COMPONENTS[section];

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={viewVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Suspense fallback={<PageFallback />}>
            <Component />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [showShare, setShowShare] = useState(false);
  return (
    <div className="relative flex" style={{ height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}>
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

      {/* Main */}
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
            {/* Share button */}
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(0,229,255,0.08)',
                border: '1px solid rgba(0,229,255,0.25)',
                color: '#00e5ff',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.15)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(0,229,255,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.08)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              分享
            </button>
            <div
              className="px-3 py-1 rounded text-xs font-mono"
              style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946' }}
            >
              <span className="text-[9px] opacity-60 mr-1">●</span>
              数字化祭祖
            </div>
          </div>
        </header>

        {/* Page content */}
        <PageContent />
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </div>
  );
}

function CurrentSectionTitle() {
  const location = useLocation();
  const section = ROUTE_TO_SECTION[location.pathname] || 'altar';
  const title = SECTION_TITLES[section] || '';
  return (
    <span className="font-zhu text-sm" style={{ color: '#f0ece3', letterSpacing: '0.1em' }}>
      {title}
    </span>
  );
}
