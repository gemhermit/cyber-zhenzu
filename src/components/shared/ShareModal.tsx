import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useStore } from '@/store/useStore';

const SHARE_URL = 'http://yunbai.bago.top/';

interface ShareModalProps {
  onClose: () => void;
}

export default function ShareModal({ onClose }: ShareModalProps) {
  const { ancestors, activeAncestorId, totalIncenseBurned, totalPaperBurned } = useStore();
  const activeAncestor = ancestors.find((a) => a.id === activeAncestorId) || ancestors[0];

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  // Check native share support
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Build composite preview: altar + footer with QR
  useEffect(() => {
    let cancelled = false;

    const doCapture = async () => {
      await new Promise((r) => setTimeout(r, 150));

      const altarEl = document.querySelector('[data-altar-capture]') as HTMLElement | null;
      if (!altarEl || cancelled) {
        if (!cancelled) { setError('祭坛元素未找到'); setLoading(false); }
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

        // Build composite: altar + footer
        const footerH = 140;
        const dst = document.createElement('canvas');
        dst.width = src.width;
        dst.height = src.height + footerH;
        const ctx = dst.getContext('2d')!;

        // Draw altar
        ctx.drawImage(src, 0, 0);

        // Footer background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, src.height, dst.width, footerH);

        // Gold gradient line
        const g = ctx.createLinearGradient(0, src.height, dst.width, src.height);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, '#f4a825');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, src.height, dst.width, 2);

        // App name
        ctx.fillStyle = '#f4a825';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('赛博祭祖 · Cyber Zhen Zu', dst.width / 2, src.height + 26);

        // QR code
        const QRCode = (await import('qrcode')).default;
        const qrSize = Math.min(100, src.width * 0.35);
        const qrX = dst.width / 2 - qrSize / 2;
        const qrY = src.height + 36;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        const qc = document.createElement('canvas');
        await QRCode.toCanvas(qc, SHARE_URL, { width: qrSize, margin: 1, color: { dark: '#0a0a0f', light: '#ffffff' } });
        ctx.drawImage(qc, qrX, qrY, qrSize, qrSize);

        // URL label
        ctx.fillStyle = '#00e5ff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(SHARE_URL, dst.width / 2, qrY + qrSize + 14);

        if (!cancelled) {
          setPreviewSrc(dst.toDataURL('image/png'));
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) { setError(e?.message || '截图失败'); setLoading(false); }
      }
    };

    doCapture();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = useCallback(async () => {
    // The previewSrc IS the full composite image
    if (!previewSrc) return;
    const link = document.createElement('a');
    link.download = `赛博祭祖-${activeAncestor?.name || '祭坛'}.png`;
    link.href = previewSrc;
    link.click();
  }, [previewSrc, activeAncestor]);

  const handleNativeShare = useCallback(async () => {
    if (!previewSrc) return;
    try {
      // Convert data URL to blob
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      const file = new File([blob], `赛博祭祖-${activeAncestor?.name || '祭坛'}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '赛博祭祖', text: `我在赛博祭祖为 ${activeAncestor?.name || '先祖'} 上香祈福 🙏\n${SHARE_URL}` });
      } else {
        // Fallback: share text
        await navigator.share({ title: '赛博祭祖', text: `我在赛博祭祖为 ${activeAncestor?.name || '先祖'} 上香祈福 🙏\n${SHARE_URL}` });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') handleCopyLink();
    }
  }, [previewSrc, activeAncestor]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const retryCapture = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const altarEl = document.querySelector('[data-altar-capture]') as HTMLElement | null;
      if (!altarEl) throw new Error('祭坛元素未找到');
      const src = await html2canvas(altarEl, { backgroundColor: '#0a0a0f', scale: 1, useCORS: true, logging: false });

      const footerH = 140;
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
      ctx.fillText('赛博祭祖 · Cyber Zhen Zu', dst.width / 2, src.height + 26);
      const QRCode = (await import('qrcode')).default;
      const qrSize = Math.min(100, src.width * 0.35);
      const qrX = dst.width / 2 - qrSize / 2;
      const qrY = src.height + 36;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      const qc = document.createElement('canvas');
      await QRCode.toCanvas(qc, SHARE_URL, { width: qrSize, margin: 1, color: { dark: '#0a0a0f', light: '#ffffff' } });
      ctx.drawImage(qc, qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = '#00e5ff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(SHARE_URL, dst.width / 2, qrY + qrSize + 14);

      setPreviewSrc(dst.toDataURL('image/png'));
    } catch (e: any) {
      setError(e?.message || '截图失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // Mobile: full screen; desktop: centered
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          // Mobile: full width/height; desktop: card
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
                分享祭坛
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Stats */}
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

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {/* Preview image — altar + QR + URL composite */}
            <div className="relative rounded-xl overflow-hidden"
              style={{ background: '#0a0a0f', border: '1px solid rgba(42,42,53,0.6)' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-c-gold border-t-transparent animate-spin" />
                  <span className="text-c-muted text-xs font-mono">生成分享图...</span>
                </div>
              ) : previewSrc ? (
                <img src={previewSrc} alt="分享预览" className="w-full object-contain block" />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="text-3xl">⛩️</div>
                  <span className="text-c-muted text-xs font-mono">{error || '截图失败'}</span>
                  <button onClick={retryCapture}
                    className="px-4 py-1.5 rounded text-xs font-mono cursor-pointer"
                    style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946' }}>
                    重试
                  </button>
                </div>
              )}
            </div>

            {/* Inline QR for mobile scanning */}
            {!loading && previewSrc && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(26,26,37,0.6)', border: '1px solid rgba(42,42,53,0.5)' }}>
                <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ background: 'white', padding: '6px' }}>
                  <QRCodeSVG value={SHARE_URL} size={64} bgColor="#ffffff" fgColor="#0a0a0f" level="M" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="font-zhu text-sm text-c-gold text-glow-gold">扫码祭祖祈福</div>
                  <div className="text-[10px] text-c-muted font-mono truncate">{SHARE_URL}</div>
                  <div className="text-[10px] text-c-muted font-mono">传承文化 · 数字祭祀</div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Native share (mobile) */}
              {canShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all"
                  style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  分享图片
                </button>
              )}

              {/* Download */}
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

              {/* WeChat */}
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

              {/* Weibo */}
              <button
                onClick={() => window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(SHARE_URL)}&title=${encodeURIComponent('我在赛博祭祖为' + (activeAncestor?.name || '先祖') + '上香祈福🙏')}`, '_blank')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono cursor-pointer transition-all"
                style={{ background: 'rgba(230,22,45,0.12)', border: '1px solid rgba(230,22,45,0.3)', color: '#e6162d' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149z"/>
                </svg>
                微博
              </button>
            </div>

            {/* URL bar */}
            {!copied && (
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl text-xs font-mono text-center transition-all cursor-pointer"
                style={{ background: 'rgba(26,26,37,0.8)', border: '1px solid rgba(42,42,53,0.5)', color: '#00e5ff' }}
              >
                📋 复制分享链接 {SHARE_URL}
              </button>
            )}
            {copied && (
              <div className="w-full py-2.5 rounded-xl text-xs font-mono text-center"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}>
                ✓ 链接已复制到剪贴板
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
