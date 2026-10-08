import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Lock,
  Star,
  Code2,
  Bookmark,
  History,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Zap,
  Globe,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { BrowserTab, ViewMode, DeviceViewport, SearchEngine } from '../types/browser';
import { SEARCH_ENGINES } from '../utils/presets';

interface NavigationBarProps {
  currentTab: BrowserTab;
  isBookmarked: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onChangeMode: (mode: ViewMode) => void;
  onChangeViewport: (viewport: DeviceViewport) => void;
  onChangeZoom: (delta: number) => void;
  onResetZoom: () => void;
  onOpenInspect: () => void;
  onOpenBookmarksDrawer: () => void;
  onOpenHistoryDrawer: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentTab,
  isBookmarked,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  onToggleBookmark,
  onChangeMode,
  onChangeViewport,
  onChangeZoom,
  onResetZoom,
  onOpenInspect,
  onOpenBookmarksDrawer,
  onOpenHistoryDrawer,
}) => {
  const [inputUrl, setInputUrl] = useState(currentTab.url);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isViewportMenuOpen, setIsViewportMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sync input value with current tab URL when tab changes or URL updates externally
  useEffect(() => {
    if (!isFocused) {
      if (currentTab.url.startsWith('weborbit://newtab')) {
        setInputUrl('');
      } else {
        setInputUrl(currentTab.url);
      }
    }
  }, [currentTab.url, isFocused]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (engineRef.current && !engineRef.current.contains(e.target as Node)) {
        setIsEngineMenuOpen(false);
      }
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setIsModeMenuOpen(false);
      }
      if (viewportRef.current && !viewportRef.current.contains(e.target as Node)) {
        setIsViewportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions debounced
  useEffect(() => {
    if (!isFocused || !inputUrl || inputUrl.length < 2 || inputUrl.startsWith('http')) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(inputUrl)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (e) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputUrl, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setShowSuggestions(false);
    
    // Check if it's already a URL or needs engine search
    let target = inputUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target)) {
        target = 'https://' + target;
      } else {
        target = selectedEngine.searchUrl(target);
      }
    }
    onNavigate(target);
    inputRef.current?.blur();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const canGoBack = currentTab.historyIndex > 0;
  const canGoForward = currentTab.historyIndex < currentTab.history.length - 1;

  return (
    <div className="flex flex-col bg-neutral-900 border-b border-neutral-800 text-neutral-200 select-none">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Navigation Controls: Back, Forward, Reload, Home */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoBack ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="صفحه قبل (Alt+Left)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-lg transition-colors ${
              canGoForward ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="صفحه بعد (Alt+Right)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onReload}
            className={`p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 transition-colors ${
              currentTab.isLoading ? 'animate-spin text-cyan-400' : ''
            }`}
            title="بارگذاری مجدد (Ctrl+R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={onHome}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 transition-colors"
            title="صفحه اصلی و دسترسی سریع"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / Search & URL Input */}
        <div className="relative flex-1 max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className={`flex items-center gap-1.5 bg-neutral-950 border px-3 py-1.5 rounded-xl transition-all duration-200 ${
              isFocused
                ? 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                : 'border-neutral-750 hover:border-neutral-650'
            }`}
          >
            {/* Search Engine Picker Button */}
            <div className="relative shrink-0" ref={engineRef}>
              <button
                type="button"
                onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-850 hover:bg-neutral-800 text-neutral-300 transition-colors"
                title={`موتور جستجو: ${selectedEngine.name}`}
              >
                <span>{selectedEngine.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {isEngineMenuOpen && (
                <div className="absolute top-full mt-1.5 right-0 z-50 bg-neutral-900 border border-neutral-750 rounded-xl shadow-2xl py-1 w-44">
                  <div className="px-3 py-1 text-[10px] text-neutral-500 font-semibold border-b border-neutral-800">
                    انتخاب موتور جستجو
                  </div>
                  {SEARCH_ENGINES.map((engine) => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        setSelectedEngine(engine);
                        setIsEngineMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-right transition-colors ${
                        selectedEngine.id === engine.id
                          ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>{engine.name}</span>
                      {selectedEngine.id === engine.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lock / Protocol Icon */}
            <div className="shrink-0 text-neutral-500">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
            </div>

            {/* URL / Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(suggestions.length > 0);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="جستجو در وب یا وارد کردن نشانی اینترنتی (URL)..."
              dir="ltr"
              className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-100 placeholder-neutral-500 px-1 font-mono tracking-tight"
            />

            {/* Action inside URL bar: Copy URL */}
            {currentTab.url && !currentTab.url.startsWith('weborbit://') && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-neutral-400 hover:text-neutral-100 rounded transition-colors"
                title="کپی پیوند"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Bookmark Star Button */}
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`p-1 rounded transition-colors ${
                isBookmarked
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-neutral-400 hover:text-amber-400'
              }`}
              title={isBookmarked ? 'حذف از نشانک‌ها' : 'افزودن به نشانک‌ها'}
            >
              <Star className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-neutral-900 border border-neutral-750 rounded-xl shadow-2xl overflow-hidden py-1">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => {
                    setInputUrl(item);
                    onNavigate(selectedEngine.searchUrl(item));
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-cyan-300 cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Selector (⚡ Proxy | 🌐 Direct | 💻 HTML Code | 📖 Reader) */}
        <div className="relative shrink-0" ref={modeRef}>
          <button
            onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              currentTab.viewMode === 'proxy'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : currentTab.viewMode === 'html-editor'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : currentTab.viewMode === 'reader'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
            title="تغییر موتور و حالت نمایش وب"
          >
            {currentTab.viewMode === 'proxy' && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
            {currentTab.viewMode === 'direct' && <Globe className="w-3.5 h-3.5 text-neutral-400" />}
            {currentTab.viewMode === 'html-editor' && <Code2 className="w-3.5 h-3.5 text-purple-400" />}
            {currentTab.viewMode === 'reader' && <BookOpen className="w-3.5 h-3.5 text-amber-400" />}

            <span className="hidden sm:inline">
              {currentTab.viewMode === 'proxy' && 'موتور پروکسی (ضد بلاک)'}
              {currentTab.viewMode === 'direct' && 'آی‌فریم مستقیم'}
              {currentTab.viewMode === 'html-editor' && 'ویرایشگر HTML زنده'}
              {currentTab.viewMode === 'reader' && 'حالت مطالعه'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isModeMenuOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-50 bg-neutral-900 border border-neutral-750 rounded-xl shadow-2xl py-1.5 w-60">
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 border-b border-neutral-800">
                حالت اجرای مرورگر
              </div>

              <button
                onClick={() => {
                  onChangeMode('proxy');
                  setIsModeMenuOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 text-right transition-colors ${
                  currentTab.viewMode === 'proxy' ? 'bg-cyan-500/10 text-cyan-300' : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">پروکسی بدون فیلتر فریم</div>
                  <div className="text-[10px] text-neutral-500">رفع خطای X-Frame و باز کردن همه سایت‌ها</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onChangeMode('direct');
                  setIsModeMenuOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 text-right transition-colors ${
                  currentTab.viewMode === 'direct' ? 'bg-cyan-500/10 text-cyan-300' : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <Globe className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">آی‌فریم مستقیم</div>
                  <div className="text-[10px] text-neutral-500">اتصال مستقیم به سایت‌های مجاز</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onChangeMode('html-editor');
                  setIsModeMenuOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 text-right transition-colors ${
                  currentTab.viewMode === 'html-editor' ? 'bg-purple-500/10 text-purple-300' : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <Code2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">ویرایشگر و رانر زنده HTML</div>
                  <div className="text-[10px] text-neutral-500">نوشتن و تست زنده کدهای HTML/CSS/JS</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onChangeMode('reader');
                  setIsModeMenuOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 text-right transition-colors ${
                  currentTab.viewMode === 'reader' ? 'bg-amber-500/10 text-amber-300' : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">حالت مطالعه (Reader View)</div>
                  <div className="text-[10px] text-neutral-500">متن تمیز مقاله بدون تبلیغات و استایل اضافی</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Device Viewport Selector (Desktop, Laptop, Tablet, Mobile) */}
        <div className="relative shrink-0 hidden md:block" ref={viewportRef}>
          <button
            onClick={() => setIsViewportMenuOpen(!isViewportMenuOpen)}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
            title="تغییر ابعاد و شبیه‌ساز دستگاه"
          >
            {currentTab.deviceViewport === 'full' && <Maximize2 className="w-4 h-4" />}
            {currentTab.deviceViewport === 'desktop' && <Monitor className="w-4 h-4" />}
            {currentTab.deviceViewport === 'laptop' && <Monitor className="w-4 h-4 text-cyan-400" />}
            {currentTab.deviceViewport === 'tablet' && <Tablet className="w-4 h-4 text-cyan-400" />}
            {currentTab.deviceViewport === 'mobile' && <Smartphone className="w-4 h-4 text-cyan-400" />}
            <ChevronDown className="w-3 h-3" />
          </button>

          {isViewportMenuOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-50 bg-neutral-900 border border-neutral-750 rounded-xl shadow-2xl py-1 w-44">
              <div className="px-3 py-1 text-[10px] text-neutral-500 font-semibold border-b border-neutral-800">
                ابعاد صفحه نمایش
              </div>
              <button
                onClick={() => { onChangeViewport('full'); setIsViewportMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <span>تمام صفحه (۱۰۰٪)</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { onChangeViewport('desktop'); setIsViewportMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <span>رایانه (1440px)</span>
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { onChangeViewport('laptop'); setIsViewportMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <span>لپ‌تاپ (1024px)</span>
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { onChangeViewport('tablet'); setIsViewportMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <span>تبلت iPad (768px)</span>
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { onChangeViewport('mobile'); setIsViewportMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                <span>موبایل (390px)</span>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="items-center gap-0.5 bg-neutral-850 rounded-lg p-0.5 border border-neutral-750 hidden lg:flex shrink-0">
          <button
            onClick={() => onChangeZoom(-0.1)}
            disabled={currentTab.zoom <= 0.7}
            className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-40"
            title="کوچک‌نمایی"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="text-[11px] font-mono px-1.5 text-neutral-300 hover:text-cyan-300 tabular-nums"
            title="بازنشانی بزرگ‌نمایی"
          >
            {Math.round(currentTab.zoom * 100)}%
          </button>
          <button
            onClick={() => onChangeZoom(0.1)}
            disabled={currentTab.zoom >= 1.6}
            className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-40"
            title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tools: Inspect HTML Source, Bookmarks Drawer, History Drawer */}
        <div className="flex items-center gap-1 shrink-0 border-r border-neutral-800 pr-2 mr-1">
          <button
            onClick={onOpenInspect}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-purple-400 transition-colors"
            title="بازرس کد منبع HTML صفحه (Inspect Source)"
          >
            <Code2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenBookmarksDrawer}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors"
            title="مدیریت نشانک‌ها"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistoryDrawer}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-cyan-400 transition-colors"
            title="تاریخچه مرور (History)"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
