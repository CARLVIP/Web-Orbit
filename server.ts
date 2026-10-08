import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to normalize and validate URL
function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return 'https://www.google.com';
  if (!/^https?:\/\//i.test(url)) {
    // If it looks like a domain, prepend https://
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url)) {
      url = 'https://' + url;
    } else {
      // If it's a search term, turn into Google search
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
  }
  return url;
}

// CORS middleware for API endpoints
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 1. Core Web Proxy Endpoint - Bypasses X-Frame-Options and Content-Security-Policy
app.all('/api/proxy', async (req, res) => {
  const targetUrlParam = req.query.url as string;
  if (!targetUrlParam) {
    return res.status(400).send('Missing "url" query parameter');
  }

  const normalizedUrl = normalizeUrl(targetUrlParam);

  try {
    const urlObj = new URL(normalizedUrl);
    
    // Copy headers from incoming request, adapting host/referrer
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    if (req.headers['cookie']) {
      headers['Cookie'] = req.headers['cookie'] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      redirect: 'follow',
    };

    if (req.method === 'POST' && req.body) {
      if (typeof req.body === 'object') {
        fetchOptions.body = JSON.stringify(req.body);
        headers['Content-Type'] = 'application/json';
      } else {
        fetchOptions.body = req.body;
      }
    }

    const response = await fetch(normalizedUrl, fetchOptions);
    const finalUrl = response.url || normalizedUrl;
    const finalUrlObj = new URL(finalUrl);

    // Pass through status
    res.status(response.status);

    // Expose final URL so client can update address bar
    res.setHeader('X-Final-Url', finalUrl);
    res.setHeader('Access-Control-Expose-Headers', 'X-Final-Url, Content-Type');

    // Strip restrictive framing & security headers
    const contentType = response.headers.get('content-type') || '';
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Explicitly omit or strip:
    // x-frame-options, content-security-policy, content-security-policy-report-only, cross-origin-opener-policy

    if (contentType.includes('text/html')) {
      let html = await response.text();

      // Clean out meta CSP tags that would block framing or proxy scripts
      html = html.replace(/<meta[^>]*http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]*http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');

      // Injected browser client script:
      // 1. Injects communication with parent WebOrbit window
      // 2. Intercepts navigation & link clicks so they stay in proxy
      // 3. Reports document title, URL, and favicon
      const injectedScript = `
        <script>
        (function() {
          const currentUrl = ${JSON.stringify(finalUrl)};
          const currentOrigin = ${JSON.stringify(finalUrlObj.origin)};

          // Notify parent of current page
          function notifyParent() {
            try {
              const faviconEl = document.querySelector("link[rel*='icon']");
              let faviconUrl = faviconEl ? faviconEl.getAttribute('href') : '';
              if (faviconUrl && !faviconUrl.startsWith('http') && !faviconUrl.startsWith('//')) {
                faviconUrl = new URL(faviconUrl, currentUrl).href;
              }
              window.parent.postMessage({
                type: 'WEBLORBIT_PAGE_LOADED',
                url: currentUrl,
                title: document.title || currentUrl,
                favicon: faviconUrl || ''
              }, '*');
            } catch(e) {}
          }

          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            notifyParent();
          } else {
            window.addEventListener('DOMContentLoaded', notifyParent);
          }
          window.addEventListener('load', notifyParent);

          // Intercept links
          document.addEventListener('click', function(e) {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

            e.preventDefault();
            e.stopPropagation();

            let targetUrl = href;
            try {
              targetUrl = new URL(href, currentUrl).href;
            } catch(err) {}

            window.parent.postMessage({
              type: 'WEBLORBIT_NAVIGATE',
              url: targetUrl
            }, '*');

            window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl);
          }, true);

          // Intercept forms
          document.addEventListener('submit', function(e) {
            const form = e.target;
            if (!form) return;
            const method = (form.method || 'GET').toUpperCase();
            if (method === 'GET') {
              e.preventDefault();
              try {
                const formData = new FormData(form);
                const params = new URLSearchParams();
                for (const [key, value] of formData.entries()) {
                  if (typeof value === 'string') params.append(key, value);
                }
                const action = form.getAttribute('action') || currentUrl;
                const targetUrl = new URL(action, currentUrl);
                targetUrl.search = params.toString();
                
                window.parent.postMessage({
                  type: 'WEBLORBIT_NAVIGATE',
                  url: targetUrl.href
                }, '*');

                window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl.href);
              } catch(err) {}
            }
          }, true);

          // Overwrite window.open
          window.open = function(url) {
            if (url) {
              let targetUrl = url;
              try {
                targetUrl = new URL(url, currentUrl).href;
              } catch(e) {}
              window.parent.postMessage({
                type: 'WEBLORBIT_OPEN_TAB',
                url: targetUrl
              }, '*');
            }
            return null;
          };
        })();
        </script>
      `;

      // Base tag ensures all relative resources (css, js, images, fonts) resolve properly
      const baseTag = `<base href="${finalUrl}">`;

      // Insert base tag and injected script right after <head> or at the beginning of html
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, `$&${baseTag}${injectedScript}`);
      } else {
        html = baseTag + injectedScript + html;
      }

      return res.send(html);
    } else {
      // For images, stylesheets, scripts, binary files, stream buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }
  } catch (error: any) {
    console.error('Proxy fetch error:', error?.message || error);
    return res.status(502).send(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>خطا در بارگذاری صفحه</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
          .card { max-width: 520px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h2 { margin-top: 0; color: #f87171; font-size: 20px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .url-box { background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 8px 12px; font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all; margin: 16px 0; text-align: left; direction: ltr; }
          button { background: #0284c7; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
          button:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>خطا در اتصال به وب‌سایت</h2>
          <p>امکان دسترسی مستقیم به آدرس درخواستی فراهم نشد یا سرور مقصد پاسخ نداد:</p>
          <div class="url-box">${normalizedUrl}</div>
          <p style="font-size: 12px; color: #64748b;">علت: ${error?.message || 'خطای شبکه یا مسدود شدن توسط هاست مقصد'}</p>
          <button onclick="window.location.reload()">تلاش مجدد</button>
        </div>
      </body>
      </html>
    `);
  }
});

// 2. Page Inspection & Source Code Endpoint
app.get('/api/inspect', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' });

  const normalized = normalizeUrl(targetUrl);
  try {
    const response = await fetch(normalized, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const status = response.status;
    const finalUrl = response.url || normalized;
    const contentType = response.headers.get('content-type') || '';
    const rawHtml = await response.text();

    // Extract title, description, favicon
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = rawHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                      rawHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    const iconMatch = rawHtml.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    let favicon = iconMatch ? iconMatch[1].trim() : '';
    if (favicon && !favicon.startsWith('http') && !favicon.startsWith('//')) {
      try {
        favicon = new URL(favicon, finalUrl).href;
      } catch(e) {}
    }

    // Extract plain text for Reader View
    const plainText = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Headers map
    const headersObj: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headersObj[key] = val;
    });

    res.json({
      url: finalUrl,
      status,
      title,
      description,
      favicon,
      contentType,
      sizeBytes: Buffer.byteLength(rawHtml, 'utf8'),
      headers: headersObj,
      rawHtml,
      plainText: plainText.slice(0, 15000), // reader text snippet
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to inspect url' });
  }
});

// 3. Quick Search Suggestions API (DuckDuckGo instant or Wikipedia)
app.get('/api/suggest', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query) return res.json({ suggestions: [] });

  try {
    const ddgUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
    const response = await fetch(ddgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return res.json({ suggestions: data[1].slice(0, 6) });
      }
    }
  } catch (e) {
    // fallback
  }

  return res.json({ suggestions: [] });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WebOrbit Browser server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
