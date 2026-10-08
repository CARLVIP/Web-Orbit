import React, { useState } from 'react';
import { X, Search, Trash2, Bookmark as BookmarkIcon, Globe, Plus, ExternalLink } from 'lucide-react';
import { Bookmark } from '../types/browser';

interface BookmarksDrawerProps {
  isOpen: boolean;
  bookmarks: Bookmark[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onAddBookmark: (title: string, url: string, category: string) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  bookmarks,
  onClose,
  onNavigate,
  onAddBookmark,
  onDeleteBookmark,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let targetUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    onAddBookmark(newTitle.trim(), targetUrl, newCategory.trim() || 'نشانک‌ها');
    setNewTitle('');
    setNewUrl('');
    setNewCategory('');
    setShowAddForm(false);
  };

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-neutral-900 border-r border-neutral-800 flex flex-col text-neutral-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-neutral-100">مدیریت نشانک‌ها (Bookmarks)</h3>
            <span className="text-xs text-neutral-500 font-mono">({bookmarks.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Bookmark Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-3 bg-neutral-950/80 border-b border-neutral-800 space-y-2 text-xs">
            <input
              type="text"
              placeholder="عنوان نشانک (مثلاً گیت‌هاب)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="آدرس اینترنتی (مثلاً https://github.com)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              dir="ltr"
              required
              className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-neutral-100 placeholder-neutral-500 font-mono text-[11px] outline-none focus:border-amber-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="دسته‌بندی (اختیاری)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-750 rounded-lg px-2.5 py-1 text-neutral-100 placeholder-neutral-500 text-[11px] outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-xs"
              >
                ذخیره
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded-lg text-xs"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div className="p-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 focus-within:border-amber-500">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در نشانک‌ها..."
              className="w-full bg-transparent border-none outline-none text-xs text-neutral-100 placeholder-neutral-500"
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-xs">
              <BookmarkIcon className="w-8 h-8 mb-2 opacity-40" />
              <span>نشانکی یافت نشد.</span>
            </div>
          ) : (
            filtered.map((item) => (
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
                    <div className="text-xs font-medium text-neutral-200 group-hover:text-amber-300 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate" dir="ltr">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <button
                    onClick={() => onDeleteBookmark(item.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                    title="حذف نشانک"
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
