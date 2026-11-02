/**
 * 无头 Chrome 截图工具（CDP 版）
 * ----------------------------------------------------------------------------
 * 为什么不用 `chrome --screenshot`：Windows 上的窗口有最小宽度，--window-size=390
 * 实际会按 512 布局，模拟不出真实手机视口。这里用 DevTools Protocol 的
 * Emulation.setDeviceMetricsOverride 精确设定视口，并支持整页截图。
 *
 * 用法：
 *   node tools/shoot.mjs shots.json
 *
 * shots.json 形如：
 *   [{ "name":"m-map", "url":"http://127.0.0.1:8811/#/map",
 *      "w":390, "h":900, "mobile":true, "full":true }]
 * 输出：与 shots.json 同目录下的 <name>.png
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import process from 'node:process';

const CHROME = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.SHOOT_PORT || 9333);

const shotsPath = process.argv[2];
if (!shotsPath) {
  console.error('usage: node tools/shoot.mjs shots.json');
  process.exit(1);
}
const shots = JSON.parse(readFileSync(shotsPath, 'utf8').replace(/^\uFEFF/, ''));
const outDir = dirname(shotsPath);
mkdirSync(outDir, { recursive: true });

const profile = join(process.env.TEMP || '.', 'shoot-profile-' + Date.now());
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions',
  '--no-first-run', '--no-default-browser-check', '--disable-crash-reporter',
  '--disable-breakpad', '--hide-scrollbars', '--mute-audio',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitEndpoint() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('DevTools endpoint did not come up');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method, timeout = 15000) {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this.listeners = this.listeners.filter((f) => f !== fn);
        resolve(null);
      }, timeout);
      const fn = (msg) => {
        if (msg.method === method) {
          clearTimeout(t);
          this.listeners = this.listeners.filter((f) => f !== fn);
          resolve(msg.params);
        }
      };
      this.listeners.push(fn);
    });
  }
}

async function main() {
  await waitEndpoint();
  const version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: 'PUT'
  })).json();
  const wsUrl = tab.webSocketDebuggerUrl || version.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  const cdp = new CDP(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  for (const s of shots) {
    const w = s.w || 1440;
    const h = s.h || 900;
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: w, height: h, deviceScaleFactor: s.dsf || 1, mobile: !!s.mobile
    });
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [
        { name: 'prefers-reduced-motion', value: s.reducedMotion ? 'reduce' : 'no-preference' }
      ]
    });

    const loaded = cdp.once('Page.loadEventFired', 20000);
    await cdp.send('Page.navigate', { url: s.url });
    await loaded;
    await sleep(s.wait || 900);

    if (s.before) {
      // 可选：执行一段页面脚本（例如打开某张卡片）
      await cdp.send('Runtime.evaluate', { expression: s.before, awaitPromise: true });
      await sleep(700);
    }

    let clip;
    if (s.full) {
      const m = await cdp.send('Page.getLayoutMetrics');
      const cs = m.cssContentSize || m.contentSize;
      const totalH = Math.min(Math.ceil(cs.height), 6000);
      clip = { x: 0, y: 0, width: Math.ceil(cs.width), height: totalH, scale: 1 };
    }

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: !!s.full,
      ...(clip ? { clip } : {})
    });
    const out = join(outDir, s.name + '.png');
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('OK', s.name, `${w}x${clip ? clip.height : h}`);
  }

  ws.close();
}

main()
  .then(() => { chrome.kill(); process.exit(0); })
  .catch((e) => {
    console.error('SHOOT FAILED:', e.message);
    chrome.kill();
    process.exit(1);
  });
