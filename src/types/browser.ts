export type ViewMode = 'proxy' | 'direct' | 'html-editor' | 'reader';

export type DeviceViewport = 'full' | 'desktop' | 'laptop' | 'tablet' | 'mobile';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  favicon: string;
  isLoading: boolean;
  viewMode: ViewMode;
  customHtml?: string;
  deviceViewport: DeviceViewport;
  zoom: number; // 0.8 to 1.5
  isPinned: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  category?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  visitedAt: number;
}

export interface SearchEngine {
  id: string;
  name: string;
  searchUrl: (query: string) => string;
  homepage: string;
  iconName: string;
}

export interface PageInspectData {
  url: string;
  status: number;
  title: string;
  description: string;
  favicon: string;
  contentType: string;
  sizeBytes: number;
  headers: Record<string, string>;
  rawHtml: string;
  plainText: string;
}
