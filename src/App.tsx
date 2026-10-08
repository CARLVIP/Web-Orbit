/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserTab, Bookmark, HistoryItem, ViewMode, DeviceViewport } from './types/browser';
import { INITIAL_BOOKMARKS, INITIAL_HTML_TEMPLATE } from './utils/presets';
import { TabBar } from './components/TabBar';
import { NavigationBar } from './components/NavigationBar';
import { BookmarksBar } from './components/BookmarksBar';
import { BrowserViewport } from './components/BrowserViewport';
import { InspectModal } from './components/InspectModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BookmarksDrawer } from './components/BookmarksDrawer';

export default function App() {
  // Create an initial tab with Start Page
  const createInitialTab = (): BrowserTab => ({
    id: 'tab-' + Date.now(),
    title: 'زبانه جدید',
    url: 'weborbit://newtab',
    history: ['weborbit://newtab'],
    historyIndex: 0,
    favicon: '',
    isLoading: false,
    viewMode: 'proxy',
    deviceViewport: 'full',
    zoom: 1,
    isPinned: false,
    customHtml: INITIAL_HTML_TEMPLATE,
  });

  const [tabs, setTabs] = useState<BrowserTab[]>(() => {
    try {
      const saved = localStorage.getItem('weborbit_tabs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [createInitialTab()];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id || 'tab-1');

  // Bookmarks state with localStorage persistence
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('weborbit_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_BOOKMARKS;
  });

  // History state with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('weborbit_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // UI Drawer / Modal states
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Active tab reference
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || createInitialTab();

  // Save tabs, bookmarks, history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('weborbit_tabs', JSON.stringify(tabs));
    } catch (e) {}
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem('weborbit_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('weborbit_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Record a history item when navigating
  const recordHistory = useCallback((url: string, title?: string, favicon?: string) => {
    if (!url || url.startsWith('weborbit://') || url === 'about:blank') return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      const newItem: HistoryItem = {
        id: 'hist-' + Date.now() + Math.random(),
        url,
        title: title || url,
        favicon: favicon || '',
        visitedAt: Date.now(),
      };
      return [newItem, ...filtered].slice(0, 200); // keep max 200 history items
    });
  }, []);

  // Navigate current tab
  const handleNavigate = useCallback(
    (url: string) => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            const nextHistory = t.history.slice(0, t.historyIndex + 1);
            nextHistory.push(url);
            return {
              ...t,
              url,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              title: url.startsWith('weborbit://') ? 'زبانه جدید' : url,
              isLoading: true,
            };
          }
          return t;
        })
      );
      recordHistory(url);
    },
    [activeTabId, recordHistory]
  );

  // Back navigation
  const handleBack = () => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId && t.historyIndex > 0) {
          const nextIndex = t.historyIndex - 1;
          const prevUrl = t.history[nextIndex];
          return {
            ...t,
            url: prevUrl,
            historyIndex: nextIndex,
            isLoading: true,
          };
        }
        return t;
      })
    );
  };

  // Forward navigation
  const handleForward = () => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId && t.historyIndex < t.history.length - 1) {
          const nextIndex = t.historyIndex + 1;
          const nextUrl = t.history[nextIndex];
          return {
            ...t,
            url: nextUrl,
            historyIndex: nextIndex,
            isLoading: true,
          };
        }
        return t;
      })
    );
  };

  // Reload current tab
  const handleReload = () => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            isLoading: true,
          };
        }
        return t;
      })
    );
  };

  // Go Home
  const handleHome = () => {
    handleNavigate('weborbit://newtab');
  };

  // New Tab
  const handleNewTab = useCallback((targetUrl = 'weborbit://newtab') => {
    const newTab: BrowserTab = {
      id: 'tab-' + Date.now() + Math.random(),
      title: targetUrl.startsWith('weborbit://') ? 'زبانه جدید' : targetUrl,
      url: targetUrl,
      history: [targetUrl],
      historyIndex: 0,
      favicon: '',
      isLoading: false,
      viewMode: 'proxy',
      deviceViewport: 'full',
      zoom: 1,
      isPinned: false,
      customHtml: INITIAL_HTML_TEMPLATE,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  // Close Tab
  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length <= 1) return;

    setTabs((prev) => {
      const nextTabs = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        const closedIdx = prev.findIndex((t) => t.id === id);
        const nextActive = nextTabs[Math.max(0, closedIdx - 1)] || nextTabs[0];
        if (nextActive) setActiveTabId(nextActive.id);
      }
      return nextTabs;
    });
  };

  // Pin Tab
  const handlePinTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  // Duplicate Tab
  const handleDuplicateTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    const duplicated: BrowserTab = {
      ...target,
      id: 'tab-' + Date.now(),
      title: `${target.title} (کپی)`,
    };
    setTabs((prev) => [...prev, duplicated]);
    setActiveTabId(duplicated.id);
  };

  // Bookmark toggle
  const isCurrentBookmarked = bookmarks.some((b) => b.url === currentTab.url);

  const handleToggleBookmark = () => {
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== currentTab.url));
    } else {
      if (!currentTab.url || currentTab.url.startsWith('weborbit://')) return;
      const newBookmark: Bookmark = {
        id: 'bm-' + Date.now(),
        title: currentTab.title || currentTab.url,
        url: currentTab.url,
        favicon: currentTab.favicon,
        category: 'نشانک‌ها',
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  // Add custom bookmark from drawer
  const handleAddBookmark = (title: string, url: string, category: string) => {
    const newBm: Bookmark = {
      id: 'bm-' + Date.now(),
      title,
      url,
      category,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [newBm, ...prev]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // View Mode Change (Proxy, Direct, HTML Editor, Reader)
  const handleChangeMode = (mode: ViewMode) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, viewMode: mode } : t))
    );
  };

  // Viewport Device change
  const handleChangeViewport = (viewport: DeviceViewport) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, deviceViewport: viewport } : t))
    );
  };

  // Zoom
  const handleChangeZoom = (delta: number) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, zoom: Math.min(1.6, Math.max(0.7, Math.round((t.zoom + delta) * 10) / 10)) }
          : t
      )
    );
  };

  const handleResetZoom = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, zoom: 1 } : t))
    );
  };

  // Update tab title and favicon when loaded
  const handleUpdateTabInfo = useCallback(
    (title: string, favicon: string, finalUrl?: string) => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            return {
              ...t,
              title: title || t.title,
              favicon: favicon || t.favicon,
              url: finalUrl || t.url,
              isLoading: false,
            };
          }
          return t;
        })
      );
      if (finalUrl) {
        recordHistory(finalUrl, title, favicon);
      }
    },
    [activeTabId, recordHistory]
  );

  // Switch to HTML Live Editor
  const handleOpenHtmlEditor = () => {
    handleChangeMode('html-editor');
  };

  // Load inspected HTML into Editor
  const handleLoadIntoEditor = (code: string) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            viewMode: 'html-editor',
            customHtml: code,
          };
        }
        return t;
      })
    );
  };

  // Keyboard Shortcuts (Ctrl+T, Ctrl+W, Ctrl+R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T (New tab)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Ctrl+W or Cmd+W (Close active tab)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      }
      // Ctrl+R (Reload)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, handleNewTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* 1. Top Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab()}
        onPinTab={handlePinTab}
        onDuplicateTab={handleDuplicateTab}
      />

      {/* 2. Navigation Bar (Omnibox & Controls) */}
      <NavigationBar
        currentTab={currentTab}
        isBookmarked={isCurrentBookmarked}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        onHome={handleHome}
        onToggleBookmark={handleToggleBookmark}
        onChangeMode={handleChangeMode}
        onChangeViewport={handleChangeViewport}
        onChangeZoom={handleChangeZoom}
        onResetZoom={handleResetZoom}
        onOpenInspect={() => setIsInspectOpen(true)}
        onOpenBookmarksDrawer={() => setIsBookmarksDrawerOpen(true)}
        onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
      />

      {/* 3. Bookmarks Bar (Quick Access) */}
      {showBookmarksBar && (
        <BookmarksBar
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onAddBookmark={() => setIsBookmarksDrawerOpen(true)}
        />
      )}

      {/* 4. Active Tab Content (Proxy Web / Live HTML Runner / Reader / Start Page) */}
      <main className="flex-1 flex overflow-hidden relative">
        <BrowserViewport
          tab={currentTab}
          onNavigate={handleNavigate}
          onOpenNewTab={handleNewTab}
          onUpdateTabInfo={handleUpdateTabInfo}
          onOpenHtmlEditor={handleOpenHtmlEditor}
          onSwitchToProxy={() => handleChangeMode('proxy')}
        />
      </main>

      {/* Modals & Drawers */}
      <InspectModal
        url={currentTab.url}
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        onLoadIntoEditor={handleLoadIntoEditor}
      />

      <BookmarksDrawer
        isOpen={isBookmarksDrawerOpen}
        bookmarks={bookmarks}
        onClose={() => setIsBookmarksDrawerOpen(false)}
        onNavigate={handleNavigate}
        onAddBookmark={handleAddBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        history={history}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onNavigate={handleNavigate}
        onClearHistory={() => setHistory([])}
        onDeleteItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
      />
    </div>
  );
}
