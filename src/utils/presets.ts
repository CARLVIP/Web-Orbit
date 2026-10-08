import { Bookmark, SearchEngine } from '../types/browser';

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    homepage: 'https://www.google.com',
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    iconName: 'google',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    homepage: 'https://duckduckgo.com',
    searchUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    iconName: 'shield',
  },
  {
    id: 'bing',
    name: 'Bing',
    homepage: 'https://www.bing.com',
    searchUrl: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    iconName: 'bing',
  },
  {
    id: 'wikipedia-fa',
    name: 'ویکی‌پدیا فارسی',
    homepage: 'https://fa.wikipedia.org',
    searchUrl: (q) => `https://fa.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
    iconName: 'book',
  },
  {
    id: 'wikipedia-en',
    name: 'Wikipedia (EN)',
    homepage: 'https://en.wikipedia.org',
    searchUrl: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
    iconName: 'book',
  },
  {
    id: 'github',
    name: 'GitHub',
    homepage: 'https://github.com',
    searchUrl: (q) => `https://github.com/search?q=${encodeURIComponent(q)}`,
    iconName: 'github',
  },
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'b1',
    title: 'Google',
    url: 'https://www.google.com',
    favicon: 'https://www.google.com/favicon.ico',
    category: 'جستجو',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'b2',
    title: 'ویکی‌پدیا فارسی',
    url: 'https://fa.wikipedia.org',
    favicon: 'https://fa.wikipedia.org/static/favicon/wikipedia.ico',
    category: 'مرجع علمی',
    createdAt: Date.now() - 900000,
  },
  {
    id: 'b3',
    title: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.githubassets.com/favicons/favicon.png',
    category: 'توسعه',
    createdAt: Date.now() - 800000,
  },
  {
    id: 'b4',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    favicon: 'https://developer.mozilla.org/favicon-48x48.png',
    category: 'آموزش HTML',
    createdAt: Date.now() - 700000,
  },
  {
    id: 'b5',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    favicon: 'https://stackoverflow.com/favicon.ico',
    category: 'برنامه‌نویسی',
    createdAt: Date.now() - 600000,
  },
  {
    id: 'b6',
    title: 'زومیت (Zoomit)',
    url: 'https://www.zoomit.ir',
    favicon: 'https://www.zoomit.ir/favicon.ico',
    category: 'فناوری و اخبار',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'b7',
    title: 'دیجی‌کالا',
    url: 'https://www.digikala.com',
    favicon: 'https://www.digikala.com/favicon.ico',
    category: 'خرید آنلاین',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'b8',
    title: 'ورزش سه',
    url: 'https://www.varzesh3.com',
    favicon: 'https://www.varzesh3.com/favicon.ico',
    category: 'ورزش',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'b9',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    favicon: 'https://news.ycombinator.com/favicon.ico',
    category: 'توسعه‌دهندگان',
    createdAt: Date.now() - 200000,
  },
];

export const INITIAL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>برنامه وب HTML تستی</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .counter-box {
      background: #090d16;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .count-display {
      font-size: 48px;
      font-weight: 700;
      color: #a855f7;
      font-family: monospace;
    }
    .btn-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    button {
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #0369a1;
      transform: translateY(-2px);
    }
    button.reset {
      background: #475569;
    }
    button.reset:hover {
      background: #334155;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 برنامه زنده HTML</h1>
    <p>شما می‌توانید این کد را ویرایش کنید تا فوراً تغییرات را در همین مرورگر مشاهده نمایید!</p>
    
    <div class="counter-box">
      <div id="counter" class="count-display">0</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">شمارنده تعاملی جاوااسکریپت</div>
    </div>

    <div class="btn-group">
      <button onclick="changeCount(1)">+ افزایش</button>
      <button onclick="changeCount(-1)">- کاهش</button>
      <button class="reset" onclick="resetCount()">بازنشانی</button>
    </div>
  </div>

  <script>
    let count = 0;
    const el = document.getElementById('counter');
    function changeCount(delta) {
      count += delta;
      el.textContent = count;
    }
    function resetCount() {
      count = 0;
      el.textContent = count;
    }
  </script>
</body>
</html>`;

export const HTML_PRESETS = [
  {
    id: 'counter',
    name: 'شمارنده و کارت مدرن',
    code: INITIAL_HTML_TEMPLATE,
  },
  {
    id: 'game',
    name: 'بازی حباب‌پران (Canvas Game)',
    code: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>بازی کلیکی ساده</title>
  <style>
    body { margin: 0; background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
    #canvas { border: 2px solid #38bdf8; border-radius: 12px; background: #020617; cursor: crosshair; }
    .hud { margin-bottom: 12px; font-size: 18px; display: flex; gap: 24px; }
  </style>
</head>
<body>
  <div class="hud">
    <div>امتیاز: <span id="score" style="color: #38bdf8; font-weight: bold;">0</span></div>
    <div>زمان باقی‌مانده: <span id="timer" style="color: #f43f5e; font-weight: bold;">30</span>s</div>
  </div>
  <canvas id="canvas" width="600" height="400"></canvas>
  <p style="margin-top: 10px; color: #94a3b8; font-size: 13px;">روی دایره‌های رنگی کلیک کنید تا امتیاز بگیرید!</p>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let timeLeft = 30;
    let targets = [];

    function addTarget() {
      const r = 20 + Math.random() * 25;
      targets.push({
        x: r + Math.random() * (canvas.width - 2 * r),
        y: r + Math.random() * (canvas.height - 2 * r),
        r: r,
        color: 'hsl(' + Math.floor(Math.random() * 360) + ', 85%, 60%)',
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4
      });
    }

    for(let i=0; i<6; i++) addTarget();

    canvas.addEventListener('click', (e) => {
      if (timeLeft <= 0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.hypot(t.x - mx, t.y - my);
        if (dist <= t.r) {
          score += 10;
          document.getElementById('score').innerText = score;
          targets.splice(i, 1);
          addTarget();
          break;
        }
      }
    });

    setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
      }
    }, 1000);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      targets.forEach(t => {
        t.x += t.dx;
        t.y += t.dy;
        if (t.x - t.r < 0 || t.x + t.r > canvas.width) t.dx *= -1;
        if (t.y - t.r < 0 || t.y + t.r > canvas.height) t.dy *= -1;

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
        ctx.closePath();
      });
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
  },
  {
    id: 'clock',
    name: 'ساعت دیجیتال نئونی مدرن',
    code: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>ساعت نئون</title>
  <style>
    body {
      background: #09090b;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      font-family: monospace;
    }
    .clock {
      font-size: 64px;
      color: #06b6d4;
      text-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
      background: #18181b;
      padding: 30px 50px;
      border-radius: 18px;
      border: 1px solid #27272a;
      letter-spacing: 4px;
    }
  </style>
</head>
<body>
  <div class="clock" id="clock">00:00:00</div>
  <script>
    function update() {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      document.getElementById('clock').textContent = h + ':' + m + ':' + s;
    }
    setInterval(update, 1000);
    update();
  </script>
</body>
</html>`,
  }
];
