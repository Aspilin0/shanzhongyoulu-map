const { run } = require('./browser-qa.cjs');
const stage = Number(process.env.EDITORIAL_STAGE || 3);
run('editorial', async ({ page, shot, assert }) => {
  for (const id of ['N01','N02','N03','N04','N05','S01','S02','S03','S04','S05','S06']) {
    await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8813') + '/#/node/' + id);
    const dialog = page.locator('#nodeDialog');
    await dialog.waitFor({ state:'visible' });
    await page.locator('#dlgBody img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{
      img.loading='eager'; await img.decode();
    })));
    const text = await dialog.innerText();
    if (stage >= 1) {
      assert.doesNotMatch(text,/第\s*\d+\s*章|所属章节|资料底本|SCULPTURE/,'Remove chapter labels and technical eyebrows from '+id);
    }
    if (stage >= 2) {
      const captions = await page.locator('.figure__cap').allTextContents();
      assert.doesNotMatch(captions.join(' '),/依据[：:]|史料记载|核查人|本章同一张/,'Keep illustration captions short: '+id);
      assert.ok(await page.locator('.figure--then').count() || text.includes('历史示意图'),'Illustrations must still be identified');
    }
    if (stage >= 3) {
      assert.doesNotMatch(text,/回到今日|参与体验|P1 增强|当前版本|那股劲|不是灯本身|全部的「学问」/,'Remove reflections and placeholder copy: '+id);
      assert.ok(await page.locator('#dlgBody .source-details a[href]').count()>0,'Keep sources available: '+id);
    }
    await shot(id+'-top');
    if (id === 'N04' || id === 'S05') {
      const heading = page.locator('#dlgBody summary').filter({hasText:'深入历史'});
      if (await heading.count()) await heading.click();
      await page.locator('#dlgNav').scrollIntoViewIfNeeded();
      await shot(id+'-body');
    }
    if (stage >= 3 && id === 'N03') {
      await page.getByRole('button',{name:'查看桐油灯',exact:true}).click();
      assert.equal(await page.locator('#dlgTitle').innerText(),'桐油灯');
      await shot('related-oil-lamp');
    }
    await page.locator('.dialog__close').click();
    assert.equal(await dialog.isVisible(),false);
  }
  if (stage >= 3) {
    await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8813') + '/#/node/N04');
    await page.locator('#dlgNav').getByRole('button',{name:'费巩明灯',exact:true}).click();
    assert.equal(await page.locator('#dlgTitle').innerText(),'费巩明灯');
    await page.locator('#dlgNav').getByRole('button',{name:'手摇发电亮灯',exact:true}).click();
    assert.equal(await page.locator('#dlgTitle').innerText(),'手摇发电亮灯');
    await page.goto((process.env.BASE_URL || 'http://127.0.0.1:8813') + '/#/finale');
    const ending = await page.locator('#finaleBody').innerText();
    assert.equal((await page.locator('#finaleBody h2').innerText()).replace(/\s+/g,''),'山中有路，山外，也有');
    assert.equal(await page.locator('#finaleBody p').count(),0,'The ending keeps only the requested sentence');
    assert.doesNotMatch(ending,/会创造|路是可以走出来的|有理由相信|一千多名师生走了九年/);
    await shot('finale');
    await page.getByRole('link',{name:'自由探索',exact:true}).click();
    assert.ok(await page.locator('#exploreControls').isVisible());
    await page.evaluate(()=>localStorage.removeItem('shanyouzhonglu.intro.seen.v2'));
    await page.goto(page.url().split('#')[0]);
    assert.equal(await page.locator('#homeTitle').innerText(),'北山西迁文化园');
    await shot('first-visit');
    await page.locator('#enterMap').click();
    assert.ok(await page.locator('#view-map.is-active').isVisible());
  }
}).catch(e=>{console.error(e);process.exitCode=1;});
