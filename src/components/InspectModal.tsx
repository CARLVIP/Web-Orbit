import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Code2, Play, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { PageInspectData } from '../types/browser';

interface InspectModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoEditor: (htmlCode: string) => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  url,
  isOpen,
  onClose,
  onLoadIntoEditor,
}) => {
  const [data, setData] = useState<PageInspectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'source' | 'headers' | 'metadata'>('source');

  useEffect(() => {
    if (isOpen && url && !url.startsWith('weborbit://')) {
      fetchInspectData();
    }
  }, [isOpen, url]);

  const fetchInspectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspect?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'خطا در واکشی سورس صفحه');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (data?.rawHtml) {
      navigator.clipboard.writeText(data.rawHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (data?.rawHtml) {
      const blob = new Blob([data.rawHtml], { type: 'text/html;charset=utf-8' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = 'page-source.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col w-full max-w-4xl h-[85vh] bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">بازرس سورس کد و اطلاعات صفحه HTML</h3>
              <p className="text-[11px] text-neutral-400 font-mono truncate max-w-md" dir="ltr">
                {url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInspectData}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-cyan-400 disabled:opacity-40 transition-colors"
              title="بارگذاری مجدد سورس"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 py-2 bg-neutral-900 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'source'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              سورس کد HTML ({data ? `${Math.round(data.sizeBytes / 1024)} KB` : '...'})
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'headers'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              هدرهای HTTP ({data ? Object.keys(data.headers || {}).length : 0})
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'metadata'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              متادیتا و محتوا
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {data?.rawHtml && (
              <>
                <button
                  onClick={() => {
                    onLoadIntoEditor(data.rawHtml);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm"
                  title="انتقال این کد به ویرایشگر زنده HTML مرورگر برای تغییر و اجرا"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>اجرا در ویرایشگر HTML</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>کپی کد</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950 font-mono text-xs">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
              <RefreshCw className="w-7 h-7 text-purple-400 animate-spin" />
              <span>در حال واکشی و تحلیل سورس کد صفحه...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-rose-400">
              <span className="font-semibold text-sm">خطا در بارگذاری اطلاعات:</span>
              <span className="text-xs text-neutral-400">{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Tab 1: Source Code */}
              {activeTab === 'source' && (
                <div className="relative">
                  <pre
                    dir="ltr"
                    className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 text-neutral-200 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap select-text"
                  >
                    <code>{data.rawHtml}</code>
                  </pre>
                </div>
              )}

              {/* Tab 2: HTTP Headers */}
              {activeTab === 'headers' && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center gap-4 p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
                    <span className="text-neutral-400">وضعیت پاسخ:</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                      data.status >= 200 && data.status < 300
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {data.status} HTTP
                    </span>
                    <span className="text-neutral-400">نوع محتوا:</span>
                    <span className="font-mono text-cyan-400">{data.contentType}</span>
                  </div>

                  <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
                    <h4 className="text-xs font-bold text-neutral-300 mb-3 font-sans">هدرهای دریافت شده از سرور مقصد:</h4>
                    <div className="space-y-1.5 font-mono text-[11px]" dir="ltr">
                      {Object.entries(data.headers).map(([key, val]) => (
                        <div key={key} className="flex gap-2 border-b border-neutral-800/60 pb-1">
                          <span className="text-purple-400 font-semibold">{key}:</span>
                          <span className="text-neutral-300 break-all">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Metadata */}
              {activeTab === 'metadata' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
                    <div>
                      <span className="text-neutral-500 block mb-1">عنوان صفحه (Title):</span>
                      <div className="text-sm font-semibold text-neutral-100">{data.title || '(بدون عنوان)'}</div>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">توضیحات متا (Description):</span>
                      <div className="text-xs text-neutral-300 leading-relaxed">{data.description || '(بدون توضیحات)'}</div>
                    </div>
                    {data.favicon && (
                      <div>
                        <span className="text-neutral-500 block mb-1">فاوآیکون (Favicon):</span>
                        <div className="flex items-center gap-2">
                          <img src={data.favicon} alt="" className="w-5 h-5 rounded" />
                          <span className="text-[11px] text-neutral-400 font-mono truncate" dir="ltr">{data.favicon}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                    <span className="text-neutral-400 font-bold block mb-2">متن استخراج شده برای حالت مطالعه (Reader Snippet):</span>
                    <p className="text-xs text-neutral-300 leading-relaxed line-clamp-10 whitespace-pre-line">
                      {data.plainText}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
