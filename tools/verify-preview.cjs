const { run } = require('./browser-qa.cjs');
run('preview', async ({ page, width, shot, assert }) => {
  await page.locator('#zoomFit').click();
  const target = page.locator('.poi--chapter[data-id="N02"]');
  if (process.env.QA_BEFORE) { await target.hover(); await shot('before'); return; }
  if (width === 390) await target.click(); else await target.hover();
  await page.locator('#poiPreview').waitFor({ state: 'visible' });
  assert.ok((await page.locator('#poiPreviewTitle').innerText()).includes('四库全书'));
  assert.ok((await page.locator('#poiPreviewEvent').innerText()).includes('一百三十九箱'));
  assert.equal(await page.locator('#nodeDialog').isVisible(), false);
  const box = await page.locator('#poiPreview').boundingBox();
  const point = await target.boundingBox();
  assert.ok(box.x + box.width <= point.x || point.x + point.width <= box.x || box.y + box.height <= point.y || point.y + point.height <= box.y, 'Preview blocks its trigger');
  await shot('chapter');
  await page.locator('#previewDetails').click();
  assert.equal(await page.locator('#dlgTitle').innerText(), '守护');
  await shot('details');
  await page.locator('.dialog__close').click();
  const sculpture = page.locator('.poi--chapter[data-id="N05"]');
  await sculpture.focus();
  assert.equal(await page.locator('#poiPreviewTitle').innerText(), '百鸟归林');
  await shot('keyboard');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#poiPreview').isVisible(), false);
  await page.getByRole('button', { name: /地名石刻.*樟树/ }).focus();
  assert.equal(await page.locator('#poiPreviewTitle').innerText(), '樟树');
  await shot('stone');
}).catch(e => { console.error(e); process.exitCode = 1; });
