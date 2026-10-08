import React from 'react';
import { Bookmark } from '../types/browser';
import { Globe, Plus } from 'lucide-react';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onAddBookmark: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onAddBookmark,
}) => {
  return (
    <div className="flex items-center gap-1 bg-neutral-900/90 border-b border-neutral-800/80 px-3 py-1 text-xs select-none overflow-x-auto no-scrollbar">
      {bookmarks.slice(0, 12).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.url)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-300 hover:text-cyan-200 hover:bg-neutral-800 transition-colors whitespace-nowrap text-[11px] shrink-0"
          title={item.url}
        >
          {item.favicon ? (
            <img
              src={item.favicon}
              alt=""
              referrerPolicy="no-referrer"
              className="w-3.5 h-3.5 rounded-sm object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
          )}
          <span>{item.title}</span>
        </button>
      ))}

      <button
        onClick={onAddBookmark}
        className="flex items-center gap-1 px-2 py-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors shrink-0 text-[11px] ml-auto"
        title="افزودن نشانک جدید"
      >
        <Plus className="w-3 h-3" />
        <span>افزودن</span>
      </button>
    </div>
  );
};
