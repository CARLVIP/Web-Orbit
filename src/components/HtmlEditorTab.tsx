import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Copy, Check, RotateCcw, Sparkles, Terminal, Maximize2, Split } from 'lucide-react';
import { HTML_PRESETS, INITIAL_HTML_TEMPLATE } from '../utils/presets';

interface HtmlEditorTabProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export const HtmlEditorTab: React.FC<HtmlEditorTabProps> = ({
  initialCode = INITIAL_HTML_TEMPLATE,
  onCodeChange,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<{ type: string; message: string; time: string }[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview-only' | 'code-only'>('split');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleUpdateCode = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weborbit-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = (templateCode: string) => {
    handleUpdateCode(templateCode);
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-xs">
        {/* Left: Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ویرایشگر و سازنده زنده اپلیکیشن HTML:</span>
          </span>

          <div className="flex items-center gap-1">
            {HTML_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleReset(preset.code)}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Split / Preview toggles */}
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                previewMode === 'split' ? 'bg-purple-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="نمایش دو ستونه (کد و پیش‌نمایش)"
            >
              دو ستونه
            </button>
            <button
              onClick={() => setPreviewMode('code-only')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                previewMode === 'code-only' ? 'bg-purple-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="فقط ویرایشگر کد"
            >
              کد
            </button>
            <button
              onClick={() => setPreviewMode('preview-only')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                previewMode === 'preview-only' ? 'bg-purple-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              title="فقط پیش‌نمایش"
            >
              پیش‌نمایش
            </button>
          </div>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
              showConsole ? 'bg-neutral-800 text-cyan-400 border-neutral-600' : 'bg-neutral-850 text-neutral-400 border-neutral-750 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>کنسول</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-850 hover:bg-neutral-750 text-neutral-300 text-[11px] border border-neutral-750 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>کپی کد</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] shadow-sm transition-colors"
            title="دانلود به عنوان فایل HTML مستقل برای اجرا در مرورگر"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود فایل HTML</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Area */}
        {(previewMode === 'split' || previewMode === 'code-only') && (
          <div className={`flex flex-col border-l border-neutral-800 bg-neutral-950 ${
            previewMode === 'split' ? 'w-1/2' : 'w-full'
          }`}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-850 text-[11px] text-neutral-400 font-mono">
              <span>سورس کد HTML / CSS / JS</span>
              <span>UTF-8 · live edit</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => handleUpdateCode(e.target.value)}
              spellCheck={false}
              dir="ltr"
              className="flex-1 w-full p-4 bg-neutral-950 text-neutral-100 font-mono text-xs leading-relaxed resize-none outline-none selection:bg-purple-500/30 selection:text-purple-200 border-none"
              placeholder="کدهای HTML، CSS و جاوااسکریپت خود را اینجا بنویسید..."
            />
          </div>
        )}

        {/* Live Preview Area */}
        {(previewMode === 'split' || previewMode === 'preview-only') && (
          <div className={`flex flex-col bg-neutral-900 ${
            previewMode === 'split' ? 'w-1/2' : 'w-full'
          }`}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-850 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>پیش‌نمایش زنده در وب</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500">Sandboxed Environment</span>
            </div>

            <div className="flex-1 relative bg-white">
              <iframe
                ref={iframeRef}
                srcDoc={code}
                title="HTML Live Runner"
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Optional In-app Console Drawer */}
      {showConsole && (
        <div className="h-36 bg-neutral-900 border-t border-neutral-800 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1 bg-neutral-850 text-[11px] text-neutral-400">
            <span>کنسول خروجی جاوااسکریپت</span>
            <button
              onClick={() => setLogs([])}
              className="text-neutral-500 hover:text-neutral-200 text-[10px]"
            >
              پاکسازی
            </button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto text-neutral-300 space-y-1">
            <div className="text-neutral-500 text-[11px]">محیط زنده آماده است. هر تغییر فوراً رندر می‌شود.</div>
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <span className="text-neutral-500">{log.time}</span>
                <span className={log.type === 'error' ? 'text-red-400' : 'text-neutral-200'}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
