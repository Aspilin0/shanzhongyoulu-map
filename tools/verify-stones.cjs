const { run } = require('./browser-qa.cjs');
run('stones', async ({ page, width, shot, assert }) => {
  await page.locator('[data-layer="stone"]').click();
  await page.locator('#zoomFit').click();
  await shot(process.env.QA_BEFORE ? 'before' : 'after');
  if (process.env.QA_BEFORE) return;
  assert.equal(await page.locator('.poi--stone:visible').count(), 28);
  const pin = page.getByRole('button', { name: /地名石刻.*衡阳/ });
  await pin.click();
  if (width === 390) await page.locator('#previewDetails').click();
  assert.equal(await page.locator('#dlgTitle').textContent(), '衡阳');
  await shot('hengyang-card');
}).catch(e => { console.error(e); process.exitCode = 1; });
