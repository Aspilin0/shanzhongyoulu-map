/**
 * 小字检查：抓出全站「可见且字号小于 12px」的文字。
 * ----------------------------------------------------------------------------
 * 规则来自 DESIGN.md：全站最小字号 12px。这个脚本把规则变成一次可运行的检查，
 * 而不是靠人肉看截图。
 *
 * 用法：
 *   node tools/serve.mjs 8811 &
 *   node tools/audit-small-text.mjs [port]
 *
 * 退出码 0 = 没有小于 12px 的文字；1 = 有（会逐条列出选择器与文字）。
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

// CUA can collect the actual rendered text without starting another browser.
// node tools/audit-small-text.mjs --report path/to/rendered-text.json
if (process.argv[2] === '--report') {
  const { readFileSync } = await import('node:fs');
  const report = JSON.parse(readFileSync(process.argv[3], 'utf8'));
  if (!Array.isArray(report.cases) || !report.cases.length) throw new Error('No browser observations in report');
  let bad = 0;
  for (const item of report.cases) {
    if (!Array.isArray(item.texts) || !item.texts.length) throw new Error('Empty rendered-text observation: ' + item.name);
    const invalid = item.texts.filter(t => !Number.isFinite(t.size) || ![12,14,20,32].includes(t.size));
    bad += invalid.length;
    console.log(`${invalid.length ? 'FAIL' : 'PASS'} ${item.name}: ${item.texts.length} rendered text nodes, ${invalid.length} outside 12/14/20/32px`);
    invalid.forEach(t => console.log(`  ${t.size}px ${t.text}`));
  }
  console.log(`Rendered-text audit: ${report.cases.length} cases, ${bad} violations.`);
  process.exit(bad ? 1 : 0);
}

const CHROME = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.argv[2] || 8811);
const CDP_PORT = Number(process.env.AUDIT_CDP_PORT || 9345);
const MIN = 12;
const VIEWS = ['home', 'map', 'timeline', 'finale', 'about'];

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions',
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
  '--remote-debugging-port=' + CDP_PORT,
  '--user-data-dir=' + (process.env.TEMP || '.') + '\\audit-profile-' + Date.now(),
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
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
}

const AUDIT = `(() => {
  const out = [], seen = new Set();
  const walk = (n) => {
    if (n.nodeType === 3) {
      const t = n.textContent.trim();
      if (!t) return;
      const p = n.parentElement;
      if (!p) return;
      const st = getComputedStyle(p);
      if (st.visibility === 'hidden' || st.display === 'none') return;
      const r = p.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const size = parseFloat(st.fontSize);
      if (size >= ${MIN}) return;
      let sel = p.tagName.toLowerCase();
      if (typeof p.className === 'string' && p.className) sel += '.' + p.className.trim().split(/\\s+/).join('.');
      const key = sel + '|' + t.slice(0, 30);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ size: +size.toFixed(1), sel, text: t.slice(0, 90) });
      return;
    }
    if (n.nodeType === 1) {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(n.tagName)) return;
      for (const c of n.childNodes) walk(c);
    }
  };
  walk(document.body);
  return out;
})()`;

async function main() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); if (r.ok) break; } catch { /* not up */ }
    await sleep(200);
  }
  const tab = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const base = `http://127.0.0.1:${PORT}/#/`;
  const cases = VIEWS.map((v) => [v, v, null]);

  let bad = 0;
  for (const [label, route, before] of cases) {
    await cdp.send('Page.navigate', { url: base + route });
    await sleep(1500);
    if (before) { await cdp.send('Runtime.evaluate', { expression: before }); await sleep(700); }
    const r = await cdp.send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
    const list = r.result.value || [];
    if (list.length) {
      bad += list.length;
      console.log(`\n✗ ${label}：${list.length} 处小于 ${MIN}px`);
      list.forEach((x) => console.log(`   ${x.size}px  ${x.sel}  「${x.text}」`));
    } else {
      console.log(`✓ ${label}`);
    }
  }
  ws.close();
  return bad;
}

main()
  .then((bad) => {
    chrome.kill();
    if (bad) {
      console.log(`\n小字检查失败：${bad} 处小于 ${MIN}px。规则见 DESIGN.md。`);
      process.exit(1);
    }
    console.log(`\n小字检查通过：全站没有小于 ${MIN}px 的文字。`);
    process.exit(0);
  })
  .catch((e) => {
    console.error('小字检查无法运行：', e.message);
    chrome.kill();
    process.exit(1);
  });
