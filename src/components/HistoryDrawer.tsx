import React, { useState } from 'react';
import { X, Search, Trash2, Clock, Globe, ArrowUpRight } from 'lucide-react';
import { HistoryItem } from '../types/browser';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onNavigate,
  onClearHistory,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-neutral-900 border-r border-neutral-800 flex flex-col text-neutral-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100">تاریخچه مرور (History)</h3>
            <span className="text-xs text-neutral-500 font-mono">({history.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                title="پاکسازی تمام تاریخچه"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی همه</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search History */}
        <div className="p-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 focus-within:border-cyan-500">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در تاریخچه..."
              className="w-full bg-transparent border-none outline-none text-xs text-neutral-100 placeholder-neutral-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-xs">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <span>موردی در تاریخچه یافت نشد.</span>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-neutral-850/60 hover:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 transition-all"
              >
                <div
                  onClick={() => {
                    onNavigate(item.url);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                    {item.favicon ? (
                      <img src={item.favicon} alt="" className="w-3.5 h-3.5 object-contain" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="text-xs font-medium text-neutral-200 group-hover:text-cyan-300 truncate">
                      {item.title || item.url}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate" dir="ltr">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(item.visitedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                    title="حذف از تاریخچه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
