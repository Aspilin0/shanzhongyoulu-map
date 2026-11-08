const { run } = require('./browser-qa.cjs');
run('content', async ({ page, width, shot, assert }) => {
  await page.locator('#zoomFit').click();
  const core = {'樟树':['马一浮','西迁史实'],'兰溪':['折回兰溪','西迁史实'],'曲江':['泰和启运','西迁史实'],'三水':['校产','西迁史实'],'青岩':['开始上课','西迁史实'],'衡山':['不能互换','西迁资料待考'],'永丰':['待考','西迁资料待考'],'宜山':['求是','西迁史实'],'湄潭':['谈家桢','西迁史实']};
  for (const name of await page.evaluate(()=>SITE.stones.map(s=>s.n))) {
    const [text,category]=core[name] || ['',null];
    const point=page.getByRole('button',{name:new RegExp('地名石刻.*'+name)});
    await point.click();
    if (width===390) await page.locator('#previewDetails').click();
    assert.equal(await page.locator('#dlgTitle').innerText(),name);
    if(category) assert.equal(await page.locator('#dlgSub').innerText(),category);
    assert.ok((await page.locator('#dlgBody').innerText()).includes(text));
    await page.locator('#dlgBody .source-details summary').click();
    assert.ok(await page.locator('#dlgBody .source-details a[href]').count()>0);
    if(core[name]) await shot(name);
    await page.locator('.dialog__close').click();
    await page.keyboard.press('Escape');
  }
  await page.locator('#zoomFit').click();
  const pavilion=page.getByRole('button',{name:'西迁纪念碑亭',exact:true});
  await pavilion.click();
  if(width===390) await page.locator('#previewDetails').click();
  assert.equal(await page.locator('#dlgTitle').innerText(),'西迁纪念碑亭');
  assert.ok((await page.locator('#dlgBody').innerText()).includes('2013'));
  await shot('pavilion');
}).catch(e=>{console.error(e);process.exitCode=1;});
