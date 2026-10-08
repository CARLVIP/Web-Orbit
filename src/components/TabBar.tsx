import React from 'react';
import { BrowserTab } from '../types/browser';
import { Plus, X, Globe, Pin, Copy } from 'lucide-react';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onPinTab: (id: string, e: React.MouseEvent) => void;
  onDuplicateTab: (id: string, e: React.MouseEvent) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
  onDuplicateTab,
}) => {
  return (
    <div className="flex items-center gap-1 bg-neutral-900 border-b border-neutral-800 px-2 pt-2 select-none overflow-x-auto no-scrollbar">
      {/* Tabs List */}
      <div className="flex items-center gap-1.5 min-w-0 max-w-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 h-9 px-3 rounded-t-lg text-xs font-medium cursor-pointer transition-all duration-150 border-t border-x ${
                isActive
                  ? 'bg-neutral-800 text-cyan-300 border-neutral-700 shadow-sm z-10'
                  : 'bg-neutral-900/80 text-neutral-400 border-transparent hover:bg-neutral-850 hover:text-neutral-200'
              } ${tab.isPinned ? 'w-10 justify-center px-0' : 'min-w-[130px] max-w-[220px]'}`}
              title={tab.title || tab.url || 'زبانه جدید'}
            >
              {/* Favicon or Spinner or Globe */}
              {tab.isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : tab.favicon ? (
                <img
                  src={tab.favicon}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-3.5 h-3.5 rounded-sm object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-neutral-500'}`} />
              )}

              {/* Title */}
              {!tab.isPinned && (
                <span className="truncate flex-1 text-right dir-rtl leading-none">
                  {tab.title || (tab.url.startsWith('weborbit://') ? 'زبانه جدید' : tab.url) || 'صفحه خالی'}
                </span>
              )}

              {/* Action Buttons: Pin, Duplicate, Close */}
              {!tab.isPinned && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  <button
                    onClick={(e) => onDuplicateTab(tab.id, e)}
                    className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200"
                    title="تکثیر زبانه"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => onPinTab(tab.id, e)}
                    className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200"
                    title="سنجاق کردن"
                  >
                    <Pin className="w-2.5 h-2.5" />
                  </button>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => onCloseTab(tab.id, e)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-neutral-400 transition-colors"
                      title="بستن زبانه (Ctrl+W)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Pinned Indicator */}
              {tab.isPinned && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0 mr-1"
        title="زبانه جدید (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
