import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Type, ZoomIn, ZoomOut, RefreshCw, ExternalLink } from 'lucide-react';
import { PageInspectData } from '../types/browser';

interface ReaderViewProps {
  url: string;
  onExitReader: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ url, onExitReader }) => {
  const [data, setData] = useState<PageInspectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontTheme, setFontTheme] = useState<'sans' | 'serif'>('sans');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/inspect?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (e) {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [url]);

  const words = data?.plainText ? data.plainText.split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 overflow-y-auto">
      {/* Reader Controls Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-2.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-xs">
        <button
          onClick={onExitReader}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به نمای وب</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-neutral-400">
            <span>اندازه فونت:</span>
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="p-1 hover:bg-neutral-800 rounded"
              title="کوچک‌تر"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              className="p-1 hover:bg-neutral-800 rounded"
              title="بزرگ‌تر"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setFontTheme('sans')}
              className={`px-2 py-0.5 rounded text-[11px] ${fontTheme === 'sans' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-neutral-400'}`}
            >
              ساده (Sans)
            </button>
            <button
              onClick={() => setFontTheme('serif')}
              className={`px-2 py-0.5 rounded text-[11px] ${fontTheme === 'serif' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-neutral-400'}`}
            >
              کتابی (Serif)
            </button>
          </div>
        </div>
      </div>

      {/* Reader Article Body */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
            <span className="text-sm">در حال آماده‌سازی نسخه خواندن بدون حواشی...</span>
          </div>
        ) : data ? (
          <article className={fontTheme === 'serif' ? 'font-serif' : 'font-sans'}>
            <header className="mb-8 pb-6 border-b border-neutral-800">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 leading-snug mb-3">
                {data.title || 'محتوای صفحه وب'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-neutral-500 font-sans">
                <span className="font-mono" dir="ltr">{new URL(url).hostname}</span>
                <span>•</span>
                <span>{words.toLocaleString('fa-IR')} کلمه</span>
                <span>•</span>
                <span>حدود {readMinutes} دقیقه مطالعه</span>
              </div>
            </header>

            <div
              className="text-neutral-300 leading-loose space-y-5"
              style={{ fontSize: `${fontSize}px` }}
            >
              {data.plainText.split('\n\n').filter((p) => p.trim().length > 0).map((paragraph, idx) => (
                <p key={idx} className="text-justify leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            امکان استخراج متن مقاله از این نشانی وجود نداشت.
          </div>
        )}
      </div>
    </div>
  );
};
