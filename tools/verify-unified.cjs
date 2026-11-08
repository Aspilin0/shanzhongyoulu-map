const { run } = require('./browser-qa.cjs');
run('unified', async ({ page, width, shot, assert }) => {
  assert.equal(await page.locator('.map-layers, [data-layer]').count(), 0);
  assert.equal(await page.locator('.poi--sculpture').count(), 0);
  assert.equal(await page.locator('.poi--chapter:visible').count(), 5);
  assert.equal(await page.locator('.poi--stone:visible').count(), 28);
  await shot('map');
  const lamp = page.getByRole('button', { name: '费巩明灯 · 灯火', exact: true });
  if (width === 390) await lamp.click(); else await lamp.hover();
  await page.locator('#poiPreview').waitFor({ state: 'visible' });
  await shot('preview');
  await page.locator('#previewDetails').click();
  assert.equal(await page.locator('#dlgTitle').innerText(), '灯火');
  assert.ok((await page.locator('#dlgBody').innerText()).includes('桐油灯'));
  await shot('details');
}).catch(e => { console.error(e); process.exitCode = 1; });
