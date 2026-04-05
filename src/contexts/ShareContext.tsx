import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ShareContextValue {
  openShare: (pageTitle?: string) => void;
  closeShare: () => void;
  isOpen: boolean;
  pageTitle: string;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('赛博祭祖');

  const openShare = useCallback((title?: string) => {
    setPageTitle(title || '赛博祭祖');
    setIsOpen(true);
  }, []);

  const closeShare = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ShareContext.Provider value={{ openShare, closeShare, isOpen, pageTitle }}>
      {children}
    </ShareContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShare must be used inside ShareProvider');
  return ctx;
}
