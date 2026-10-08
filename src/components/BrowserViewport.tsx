import React, { useRef, useEffect, useState } from 'react';
import { BrowserTab } from '../types/browser';
import { StartPage } from './StartPage';
import { HtmlEditorTab } from './HtmlEditorTab';
import { ReaderView } from './ReaderView';
import { Zap, AlertTriangle, ExternalLink } from 'lucide-react';

interface BrowserViewportProps {
  tab: BrowserTab;
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onUpdateTabInfo: (title: string, favicon: string, finalUrl?: string) => void;
  onOpenHtmlEditor: () => void;
  onSwitchToProxy: () => void;
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  tab,
  onNavigate,
  onOpenNewTab,
  onUpdateTabInfo,
  onOpenHtmlEditor,
  onSwitchToProxy,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Re-render iframe on tab.url change
  useEffect(() => {
    setIframeKey((k) => k + 1);
  }, [tab.url, tab.viewMode]);

  // Listen to messages from injected proxy script
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'WEBLORBIT_PAGE_LOADED') {
        if (data.title || data.favicon || data.url) {
          onUpdateTabInfo(data.title || '', data.favicon || '', data.url);
        }
      } else if (data.type === 'WEBLORBIT_NAVIGATE') {
        if (data.url) {
          onNavigate(data.url);
        }
      } else if (data.type === 'WEBLORBIT_OPEN_TAB') {
        if (data.url) {
          onOpenNewTab(data.url);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onOpenNewTab, onUpdateTabInfo]);

  // Check if start page
  const isStartPage = !tab.url || tab.url.startsWith('weborbit://') || tab.url === 'about:blank';

  if (isStartPage) {
    return <StartPage onNavigate={onNavigate} onOpenHtmlEditor={onOpenHtmlEditor} />;
  }

  if (tab.viewMode === 'html-editor') {
    return (
      <HtmlEditorTab
        initialCode={tab.customHtml}
        onCodeChange={(code) => {
          tab.customHtml = code;
        }}
      />
    );
  }

  if (tab.viewMode === 'reader') {
    return <ReaderView url={tab.url} onExitReader={onSwitchToProxy} />;
  }

  // Target URL based on mode
  const iframeSrc =
    tab.viewMode === 'proxy'
      ? `/api/proxy?url=${encodeURIComponent(tab.url)}`
      : tab.url;

  // Viewport container sizing for device emulation
  const getDeviceStyle = () => {
    switch (tab.deviceViewport) {
      case 'desktop':
        return 'w-full max-w-[1440px] h-full my-auto rounded-xl border border-neutral-800 shadow-2xl';
      case 'laptop':
        return 'w-full max-w-[1024px] h-[95%] my-auto rounded-xl border border-neutral-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[95%] my-auto rounded-[36px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden';
      case 'mobile':
        return 'w-[390px] h-[92%] my-auto rounded-[46px] border-[14px] border-neutral-800 shadow-2xl overflow-hidden';
      case 'full':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950 overflow-hidden relative">
      {/* Direct mode warning if site blocks frames */}
      {tab.viewMode === 'direct' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 text-amber-200 border border-amber-800/80 px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-2 backdrop-blur-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>اگر سایت باز نشد، ممکن است فریم مستقیم را مسدود کرده باشد.</span>
          <button
            onClick={onSwitchToProxy}
            className="underline font-bold text-amber-300 hover:text-white flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>تغییر به حالت پروکسی ضد بلاک</span>
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div
        className={`relative flex flex-col bg-white transition-all duration-200 ${getDeviceStyle()}`}
        style={{
          transform: tab.zoom !== 1 ? `scale(${tab.zoom})` : undefined,
          transformOrigin: 'center top',
        }}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={iframeSrc}
          title={tab.title || 'Web Page'}
          className="w-full h-full border-none flex-1 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};
