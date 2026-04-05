import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useStore } from '@/store/useStore';

const BASE_URL = 'http://yunbai.bago.top/';

const PAGE_ROUTES: Record<string, string> = {
  '/altar': '祭坛',
  '/incense': '香火',
  '/offerings': '供品',
  '/paper': '元宝',
  '/family': '家谱',
  '/memorial': '祭日',
  '/prayers': '祈福',
  '/ritual': '祭祀',
};

interface ShareModalProps {
  onClose: () => void;
  /** Override the page title shown in the modal */
  pageTitle?: string;
}

export default function ShareModal({ onClose, pageTitle }: ShareModalProps) {
  const { totalIncenseBurned, totalPaperBurned } = useStore();

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Detect current route from window location
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/altar';
  const displayTitle = pageTitle || PAGE_ROUTES[currentPath] || '赛博祭祖';
  const shareUrl = `${BASE_URL}${currentPath === '/' || currentPath === '/altar' ? '' : currentPath}`;

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Capture current page content
  useEffect(() => {
    let cancelled = false;

    const doCapture = async () => {
      await new Promise((r) => setTimeout(r, 150));

      // Try page-specific capture first, fall back to altar capture
      const selectors = [
        '[data-page-capture]',
        '[data-altar-capture]',
        'main [class*="flex-col"]',
      ];

      let altarEl: HTMLElement | null = null;
      for (const sel of selectors) {
        altarEl = document.querySelector(sel) as HTMLElement | null;
        if (altarEl) break;
      }

      if (!altarEl || cancelled) {
        if (!cancelled) setPreviewSrc(null);
        return;
      }

      try {
        const src = await html2canvas(altarEl, {
          backgroundColor: '#0a0a0f',
          scale: 1,
          useCORS: true,
          logging: false,
        });

        if (cancelled) return;

        const footerH = 130;
        const dst = document.createElement('canvas');
        dst.width = src.width;
        dst.height = src.height + footerH;
        const ctx = dst.getContext('2d')!;

        ctx.drawImage(src, 0, 0);

        // Footer
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, src.height, dst.width, footerH);

        const g = ctx.createLinearGradient(0, src.height, dst.width, src.height);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, '#f4a825');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, src.height, dst.width, 2);

        // Title
        ctx.fillStyle = '#f4a825';
        ctx.font = `bold ${Math.max(16, Math.min(dst.width * 0.05, 22))}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${displayTitle} · 赛博祭祖`, dst.width / 2, src.height + 24);

        // QR
        const qrSize = Math.min(96, dst.width * 0.32);
        const qrX = dst.width / 2 - qrSize / 2;
        const qrY = src.height + 34;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);

        const QRCode = (await import('qrcode')).default;
        const qc = document.createElement('canvas');
        await QRCode.toCanvas(qc, shareUrl, {
          width: qrSize,
          margin: 1,
          color: { dark: '#0a0a0f', light: '#ffffff' },
        });
        ctx.drawImage(qc, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = '#00e5ff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(shareUrl, dst.width / 2, qrY + qrSize + 14);

        if (!cancelled) setPreviewSrc(dst.toDataURL('image/png'));
      } catch {
        if (!cancelled) setPreviewSrc(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doCapture();
    return () => { cancelled = true; };
  }, [displayTitle, shareUrl]);

  const handleDownload = useCallback(() => {
    if (!previewSrc) return;
    const link = document.createElement('a');
    link.download = `赛博祭祖-${displayTitle}.png`;
    link.href = previewSrc;
    link.click();
  }, [previewSrc, displayTitle]);

  const handleNativeShare = useCallback(async () => {
    if (!previewSrc) return;
    try {
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      const file = new File([blob], `赛博祭祖-${displayTitle}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `赛博祭祖 · ${displayTitle}`,
          text: `我在赛博祭祖${displayTitle}祈福🙏\n${shareUrl}`,
        });
      } else {
        await navigator.share({
          title: `赛博祭祖 · ${displayTitle}`,
          text: `我在赛博祭祖${displayTitle}祈福🙏\n${shareUrl}`,
        });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') handleCopyLink();
    }
  }, [previewSrc, displayTitle, shareUrl]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const retryCapture = useCallback(async () => {
    setLoading(true);
    try {
      const selectors = ['[data-page-capture]', '[data-altar-capture]'];
      let altarEl: HTMLElement | null = null;
      for (const sel of selectors) {
        altarEl = document.querySelector(sel) as HTMLElement | null;
        if (altarEl) break;
      }
      if (!altarEl) throw new Error('未找到页面内容');

      const src = await html2canvas(altarEl, { backgroundColor: '#0a0a0f', scale: 1, useCORS: true, logging: false });
      const footerH = 130;
      const dst = document.createElement('canvas');
      dst.width = src.width;
      dst.height = src.height + footerH;
      const ctx = dst.getContext('2d')!;
      ctx.drawImage(src, 0, 0);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, src.height, dst.width, footerH);
      const g = ctx.createLinearGradient(0, src.height, dst.width, src.height);
      g.addColorStop(0, 'transparent'); g.addColorStop(0.5, '#f4a825'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, src.height, dst.width, 2);
      ctx.fillStyle = '#f4a825';
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${displayTitle} · 赛博祭祖`, dst.width / 2, src.height + 24);
      const qrSize = Math.min(96, dst.width * 0.32);
      const qrX = dst.width / 2 - qrSize / 2;
      const qrY = src.height + 34;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      const QRCode = (await import('qrcode')).default;
      const qc = document.createElement('canvas');
      await QRCode.toCanvas(qc, shareUrl, { width: qrSize, margin: 1, color: { dark: '#0a0a0f', light: '#ffffff' } });
      ctx.drawImage(qc, qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = '#00e5ff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(shareUrl, dst.width / 2, qrY + qrSize + 14);
      setPreviewSrc(dst.toDataURL('image/png'));
    } catch {
      // keep loading true to show retry
    } finally {
      setLoading(false);
    }
  }, [displayTitle, shareUrl]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative flex flex-col w-full max-w-lg mx-auto h-full sm:h-auto sm:my-auto sm:rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #111118 0%, #0a0a0f 100%)',
            border: '1px solid rgba(244,168,37,0.25)',
            boxShadow: '0 0 80px rgba(244,168,37,0.12), 0 24px 80px rgba(0,0,0,0.9)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(42,42,53,0.6)' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🎋</span>
              <span className="font-zhu text-c-gold text-base text-glow-gold" style={{ letterSpacing: '0.08em' }}>
                分享{displayTitle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-c-muted mr-1">
                <span className="text-c-gold">🔥 {totalIncenseBurned}</span>
                <span className="text-c-gold">💰 {totalPaperBurned}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-c-muted hover:text-c-text transition-colors cursor-pointer text-sm"
                style={{ background: 'rgba(42,42,53,0.5)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: '#0a0a0f', border: '1px solid rgba(42,42,53,0.6)', maxHeight: '45vh', overflow: 'hidden' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-c-gold border-t-transparent animate-spin" />
                  <span className="text-c-muted text-xs font-mono">生成分享图...</span>
                </div>
              ) : previewSrc ? (
                <img src={previewSrc} alt="分享预览" className="w-full h-full object-contain block" style={{ maxHeight: '45vh' }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <div className="text-3xl">⛩️</div>
                  <span className="text-c-muted text-xs font-mono">截图生成失败</span>
                  <button onClick={retryCapture}
                    className="px-4 py-1.5 rounded text-xs font-mono cursor-pointer"
                    style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946' }}>
                    重试
                  </button>
                </div>
              )}
            </div>

            {/* Inline QR */}
            {!loading && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(26,26,37,0.6)', border: '1px solid rgba(42,42,53,0.5)' }}>
                <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ background: 'white', padding: '6px' }}>
                  <QRCodeSVG value={shareUrl} size={64} bgColor="#ffffff" fgColor="#0a0a0f" level="M" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="font-zhu text-sm text-c-gold text-glow-gold">{displayTitle} · 扫码祈福</div>
                  <div className="text-[10px] text-c-muted font-mono truncate">{shareUrl}</div>
                  <div className="text-[10px] text-c-muted font-mono">传承文化 · 数字祭祀</div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              {canShare && (
                <button
                  onClick={handleNativeShare}
                  disabled={loading || !previewSrc}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all disabled:opacity-40"
                  style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  分享图片
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={loading || !previewSrc}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all disabled:opacity-40"
                style={{ background: 'rgba(244,168,37,0.12)', border: '1px solid rgba(244,168,37,0.3)', color: '#f4a825' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                保存图片
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all"
                style={{ background: 'rgba(7,193,96,0.12)', border: '1px solid rgba(7,193,96,0.3)', color: '#07c160' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 5.58 2 10c0 1.97.73 3.77 1.94 5.18L2 22l5.82-1.94A9.96 9.96 0 0012 20c5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                </svg>
                {copied ? '已复制' : '复制链接'}
              </button>
              <button
                onClick={() => window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('我在赛博祭祖' + displayTitle + '祈福🙏')}`, '_blank')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all"
                style={{ background: 'rgba(230,22,45,0.12)', border: '1px solid rgba(230,22,45,0.3)', color: '#e6162d' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443z"/>
                </svg>
                微博
              </button>
            </div>

            {/* Copy bar */}
            {copied ? (
              <div className="w-full py-2.5 rounded-xl text-xs font-mono text-center"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}>
                ✓ 链接已复制到剪贴板
              </div>
            ) : (
              <button onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl text-xs font-mono text-center cursor-pointer transition-all"
                style={{ background: 'rgba(26,26,37,0.8)', border: '1px solid rgba(42,42,53,0.5)', color: '#00e5ff' }}>
                📋 复制分享链接 · {shareUrl}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
