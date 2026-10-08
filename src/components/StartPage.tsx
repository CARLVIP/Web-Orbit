import React, { useState } from 'react';
import { Search, Globe, Code2, Zap, Smartphone, ExternalLink, Sparkles, BookOpen, Layers } from 'lucide-react';
import { SearchEngine } from '../types/browser';
import { SEARCH_ENGINES, INITIAL_BOOKMARKS } from '../utils/presets';

interface StartPageProps {
  onNavigate: (url: string) => void;
  onOpenHtmlEditor: () => void;
}

export const StartPage: React.FC<StartPageProps> = ({
  onNavigate,
  onOpenHtmlEditor,
}) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let target = query.trim();
    if (/^https?:\/\//i.test(target)) {
      onNavigate(target);
    } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target)) {
      onNavigate('https://' + target);
    } else {
      onNavigate(selectedEngine.searchUrl(target));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 text-neutral-100">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            WebOrbit
          </h1>
        </div>
        <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-md">
          مرورگر وب پیشرفته با موتور ضد محدودیت فریم برای باز کردن تمام وب‌سایت‌ها و اجرای زنده کدهای HTML
        </p>
      </div>

      {/* Main Search Box */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center bg-neutral-900 border border-neutral-750 hover:border-neutral-600 focus-within:border-cyan-500/80 rounded-2xl p-2 shadow-2xl transition-all ring-1 ring-white/5 focus-within:ring-cyan-500/20"
        >
          {/* Engine Selector */}
          <select
            value={selectedEngine.id}
            onChange={(e) => {
              const found = SEARCH_ENGINES.find((eng) => eng.id === e.target.value);
              if (found) setSelectedEngine(found);
            }}
            className="bg-neutral-800 text-neutral-300 text-xs font-medium py-2 px-3 rounded-xl outline-none border border-neutral-700 cursor-pointer ml-2"
          >
            {SEARCH_ENGINES.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`جستجو با ${selectedEngine.name} یا وارد کردن آدرس سایت (مثلاً wikipedia.org)...`}
            dir="auto"
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-100 placeholder-neutral-500 px-3 py-1 font-normal"
          />

          {/* Submit Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all shrink-0"
            title="جستجو یا رفتن به نشانی"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Feature Highlights Banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>دور زدن خودکار خطای X-Frame</span>
          </span>
          <span className="text-neutral-700">•</span>
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>پشتیبانی کامل از اپ‌های HTML</span>
          </span>
          <span className="text-neutral-700">•</span>
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>شبیه‌ساز موبایل و تبلت</span>
          </span>
        </div>
      </div>

      {/* Speed Dial / Popular Websites Grid */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-neutral-400 font-medium">
          <span>دسترسی سریع به وب‌سایت‌های پرکاربرد:</span>
          <span>۱۰۰٪ پشتیبانی از طریق موتور پروکسی</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {INITIAL_BOOKMARKS.map((site) => (
            <button
              key={site.id}
              onClick={() => onNavigate(site.url)}
              className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 text-right transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                {site.favicon ? (
                  <img
                    src={site.favicon}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-neutral-200 group-hover:text-cyan-300 truncate">
                  {site.title}
                </div>
                <div className="text-[10px] text-neutral-500 truncate">
                  {site.category || 'وب'}
                </div>
              </div>
            </button>
          ))}

          {/* Special Quick Action: Open HTML Live Creator */}
          <button
            onClick={onOpenHtmlEditor}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-950/60 to-indigo-950/60 hover:from-purple-900/70 hover:to-indigo-900/70 border border-purple-800/50 hover:border-purple-600 text-right transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4 text-purple-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-purple-200 group-hover:text-purple-100 truncate">
                ساخت اپ HTML
              </div>
              <div className="text-[10px] text-purple-400/80 truncate">
                کدنویسی زنده در مرورگر
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Helpful Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto text-xs text-neutral-400">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
          <div className="flex items-center gap-2 font-semibold text-neutral-200 mb-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>چرا همه سایت‌ها بالا می‌آیند؟</span>
          </div>
          <p className="leading-relaxed text-neutral-400 text-[11px]">
            بسیاری از سایت‌ها هدر امنیتی X-Frame-Options دارند. موتور سرور Express پروکسی اختصاصی ما این هدرها را دور زده و هر سایتی را با موفقیت رندر می‌کند.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
          <div className="flex items-center gap-2 font-semibold text-neutral-200 mb-1">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>اپلیکیشن و سندهای HTML</span>
          </div>
          <p className="leading-relaxed text-neutral-400 text-[11px]">
            می‌توانید کدهای HTML/CSS/JS خود را به صورت زنده بنویسید، دکمه‌ها و اسکریپت‌ها را تست کنید و فایل نهایی را با یک کلیک با فرمت html ذخیره کنید.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
          <div className="flex items-center gap-2 font-semibold text-neutral-200 mb-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>ابزارهای بازرسی و مطالعه</span>
          </div>
          <p className="leading-relaxed text-neutral-400 text-[11px]">
            امکان مشاهده سورس کد صفحه (Inspect HTML)، استخراج متن مقاله در حالت Reader Mode و تست واکنش‌گرایی در اندازه‌های گوشی و تبلت.
          </p>
        </div>
      </div>
    </div>
  );
};
