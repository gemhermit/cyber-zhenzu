import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import type { NavSection } from '@/types';

const NAV_ITEMS: { id: NavSection; label: string; icon: string; path: string }[] = [
  { id: 'altar', label: '祭坛', icon: '⛩️', path: '/altar' },
  { id: 'incense', label: '香火', icon: '🔥', path: '/incense' },
  { id: 'offerings', label: '供品', icon: '🍎', path: '/offerings' },
  { id: 'paper', label: '元宝', icon: '💰', path: '/paper' },
  { id: 'family', label: '家谱', icon: '🌳', path: '/family' },
  { id: 'memorial', label: '祭日', icon: '📅', path: '/memorial' },
  { id: 'prayers', label: '祈福', icon: '🎋', path: '/prayers' },
  { id: 'ritual', label: '祭祀', icon: '✨', path: '/ritual' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = NAV_ITEMS.find(item => item.path === location.pathname)?.id;

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <nav
      className="relative flex flex-col items-center py-4 sm:py-6 gap-2 sm:gap-3 h-full w-12 sm:w-16 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(17,17,24,0.95) 100%)',
        borderRight: '1px solid rgba(42,42,53,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div className="mb-3 sm:mb-4 flex flex-col items-center gap-1">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl"
          style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)' }}
        >
          ⛩️
        </div>
        <span className="text-[7px] sm:text-[8px] font-zhu text-c-muted leading-none hidden sm:block">赛博</span>
      </div>

      <div className="w-6 sm:w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #2a2a35, transparent)' }} />

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.path)}
            className="relative group w-9 h-9 sm:w-11 sm:h-11 flex flex-col items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              background: isActive ? 'rgba(230,57,70,0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(230,57,70,0.5)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(230,57,70,0.2)' : 'none',
            }}
          >
            <span className="text-base sm:text-lg leading-none">{item.icon}</span>
            <span
              className="text-[7px] sm:text-[8px] mt-0.5 leading-none transition-colors hidden sm:block"
              style={{ color: isActive ? '#e63946' : '#7a7570', fontFamily: 'ZCOOL XiaoWei, serif' }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                style={{ background: '#e63946', boxShadow: '0 0 8px rgba(230,57,70,0.8)' }}
              />
            )}

            {/* Tooltip */}
            <div
              className="absolute left-full ml-3 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: '#1a1a25',
                border: '1px solid #2a2a35',
                color: '#f0ece3',
                fontFamily: 'Space Mono, monospace',
                fontSize: '10px',
              }}
            >
              {item.label}
            </div>
          </button>
        );
      })}

      {/* Stats at bottom */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, #2a2a35, transparent)' }} />
        <StatsDisplay />
      </div>
    </nav>
  );
}

function StatsDisplay() {
  const { totalIncenseBurned, totalPaperBurned } = useStore();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative px-2 py-3 rounded-lg text-center cursor-default"
      style={{
        background: 'rgba(26,26,37,0.6)',
        border: '1px solid #2a2a35',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-xs text-c-gold font-zhu" style={{ fontSize: '10px' }}>功德</div>
      <div className="text-c-gold" style={{ fontSize: '12px', textShadow: '0 0 8px rgba(244,168,37,0.5)' }}>
        {(totalIncenseBurned + totalPaperBurned * 3)}
      </div>
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50"
          style={{
            background: '#1a1a25',
            border: '1px solid #2a2a35',
            fontSize: '10px',
          }}
        >
          <div className="text-c-muted">香火: {totalIncenseBurned}</div>
          <div className="text-c-muted">纸供: {totalPaperBurned}</div>
        </div>
      )}
    </div>
  );
}
