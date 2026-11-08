const { run } = require('./browser-qa.cjs');
run(process.env.QA_NAME || 'map-view', async ({ page, shot, assert }) => {
  await page.locator('#mapFrame .map-frame__img').evaluate(img => img.decode());
  await shot(process.env.QA_BEFORE ? 'before' : 'after');
  if (process.env.QA_BEFORE) return;
  const geometry = await page.evaluate(() => window.PARK_MAP);
  assert.deepEqual(geometry.extent, [60,40,1220,1530]);
  for (const [id,pin] of Object.entries(geometry.pins)) {
    assert.ok(pin.x > 0 && pin.x < 100 && pin.y > 0 && pin.y < 100, `${id} cropped out`);
  }
  const response = await page.request.get(new URL('assets/map/beishan-map.svg', page.url()).href);
  const svg = await response.text();
  assert.ok(svg.includes('viewBox="60 40 1220 1530"'));
  assert.ok(!svg.includes('translate(1480 1275)'), 'Incorrect peripheral building still present');
  await page.locator('#zoomIn').click();
  await shot('zoom');
  await page.locator('#zoomFit').click();
  await shot('fit');
}).catch(e => { console.error(e); process.exitCode = 1; });
