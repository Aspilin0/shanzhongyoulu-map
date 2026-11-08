const { run } = require('./browser-qa.cjs');
run('tidy', async ({ page, width, shot, assert }) => {
  await shot(process.env.QA_BEFORE ? 'before' : 'after');
  await page.getByRole('button', { name: /地名石刻.*宜山/ }).click();
  if (width === 390) await page.locator('#previewDetails').click();
  if (!process.env.QA_BEFORE) {
    assert.equal(await page.locator('#dlgTitle').innerText(), '宜山');
    assert.ok(!(await page.locator('#dlgBody').innerText()).includes('为什么不多写'));
    assert.ok(!(await page.locator('#dlgBody').innerText()).includes('资料组'));
    assert.equal(await page.locator('#dlgNav button').count(), 1);
    assert.equal(await page.locator('#nav').count(), 0);
  }
  await shot(process.env.QA_BEFORE ? 'stone-before' : 'stone-after');
  await page.getByRole('button', { name: '返回地图', exact: true }).click();
  assert.equal(await page.locator('#journeyTitle').innerText(), '宜山');
  await page.locator('#journeyNext').click();
  assert.equal(await page.locator('#journeyTitle').innerText(), '青岩');
}).catch(e => { console.error(e); process.exitCode = 1; });
