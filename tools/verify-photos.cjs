const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync, mkdirSync } = require('node:fs');
const path = require('node:path');

async function main() {
  const out = path.resolve('qa/2026-11-08/photos');
  const expected = JSON.parse(readFileSync(path.join(out, 'expected.json'), 'utf8'));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let passed = 0;
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => localStorage.setItem('shanyouzhonglu.intro.seen.v2', 'yes'));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      for (const [id, photo] of [['N03','N03'],['N05','N05'],['S02','N03'],['S04','N05'],['S06','N03']]) {
        await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8813') + '/#/node/' + id);
        await page.locator('#nodeDialog').waitFor({ state: 'visible' });
        const img = page.locator('#dlgBody .figure img').first();
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async img => { img.loading = 'eager'; await img.decode(); });
        assert.ok(await img.evaluate(img => img.naturalWidth > 0));
        const src = await img.getAttribute('src');
        assert.equal(src, 'assets/current/' + photo + '.jpg');
        const response = await page.request.get(new URL(src, page.url()).href);
        assert.equal(createHash('sha256').update(await response.body()).digest('hex'), expected[photo]);
        const caption = await page.locator('#dlgBody .figure__cap').first().innerText();
        assert.ok(!caption.includes('铭牌'), caption);
        if (id === 'S06') assert.ok(caption.includes('非《桐油灯》独立照片'));
        assert.deepEqual(errors, []);
        mkdirSync(out, { recursive: true });
        await page.screenshot({ path: path.join(out, `after-${width}-${id}.png`) });
        console.log('PASS', width, id);
        passed++;
      }
      await context.close();
    }
    console.log(`Photos: passed ${passed}, failed 0`);
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
