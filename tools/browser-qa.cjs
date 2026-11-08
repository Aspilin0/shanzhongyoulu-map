const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');

exports.run = async function (name, check) {
  const out = path.resolve('qa/2026-11-08', name);
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let passed = 0;
  const fonts = [];
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
      await context.addInitScript(() => localStorage.setItem('shanyouzhonglu.intro.seen.v2', 'yes'));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8813') + '/#/map');
      const shot = async label => {
        assert.deepEqual(errors, [], 'Browser console errors');
        const texts = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(n => n.getClientRects().length && Array.from(n.childNodes).some(c => c.nodeType === 3 && c.textContent.trim())).map(n => ({ text: n.textContent.trim().slice(0,120), size: parseFloat(getComputedStyle(n).fontSize), selector: n.id ? '#' + n.id : n.tagName + '.' + n.className })));
        fonts.push({ name: `${width}-${label}`, texts });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflows horizontally');
        await page.screenshot({ path: path.join(out, `${width}-${label}.png`) });
      };
      await check({ page, context, width, shot, assert });
      assert.deepEqual(errors, []);
      passed++;
      console.log('PASS', name, width);
      await context.close();
    }
    writeFileSync(path.join(out, 'font-audit.json'), JSON.stringify({ cases: fonts }, null, 2));
    console.log(`${name}: passed ${passed}, failed 0`);
  } finally { await browser.close(); }
};
