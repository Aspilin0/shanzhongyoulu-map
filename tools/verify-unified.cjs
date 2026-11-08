const { run } = require('./browser-qa.cjs');
run('unified', async ({ page, width, shot, assert }) => {
  assert.equal(await page.locator('.map-layers, [data-layer]').count(), 0);
  assert.equal(await page.locator('.poi--sculpture').count(), 0);
  const represented=await page.locator('.poi').evaluateAll(items=>items.flatMap(n=>[n.dataset.id,...(n.dataset.relatedIds||'').split(',')]));
  for(const id of ['N01','N02','N03','N04','N05']) assert.ok(represented.includes(id));
  assert.equal(await page.locator('.poi--stone:visible').count(), 28);
  await shot('map');
  const lamp = page.getByRole('button', { name:/地名石刻.*宜山/ });
  if (width === 390) await lamp.click(); else await lamp.hover();
  await page.locator('#poiPreview').waitFor({ state: 'visible' });
  await shot('preview');
  await page.locator('#previewRelated').getByRole('button',{name:'费巩明灯',exact:true}).click();
  assert.equal(await page.locator('#dlgTitle').innerText(), '费巩明灯');
  assert.ok((await page.locator('#dlgBody').innerText()).includes('桐油灯'));
  await shot('details');
}).catch(e => { console.error(e); process.exitCode = 1; });
