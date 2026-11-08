const { run } = require('./browser-qa.cjs');
const modes = [
  {ridge:'ridge','stone:樟树':'ridge','stone:衡阳':'north-spine','stone:宜山':'cross',west:'west-spine','stone:湄潭':'south-spine','south-fork':'southwest'},
  {'stone:樟树':'east','stone:宜山':'south-story','stone:湄潭':'pavilion',riverside:'river-east'},
  {'stone:樟树':'ridge','stone:衡阳':'north-gate'},
  {'stone:樟树':'east','stone:宜山':'cross',west:'west-gate'},
  {'stone:樟树':'east','stone:宜山':'south-story','stone:湄潭':'south-spine','south-fork':'southeast'},
  {'stone:樟树':'east','stone:宜山':'south-story','stone:湄潭':'pavilion',riverside:'river-south'}
];
run('branch-journey', async ({ page, shot, assert }) => {
  const url = page.url().split('#')[0] + '#/map';
  for (let route=0; route<modes.length; route++) {
    await page.goto(url);
    await page.reload();
    assert.equal(await page.locator('#journeyTitle').innerText(),'杭州');
    assert.ok(await page.locator('#journeyPrev').isDisabled());
    const visited=[], titles=[];
    for (let step=0;step<60;step++) {
      const id=await page.locator('#journeyTitle').getAttribute('data-stop');
      assert.ok(!visited.includes(id),'Forced return to '+id);
      visited.push(id); titles.push(await page.locator('#journeyTitle').innerText());
      await shot(`route-${route+1}-step-${String(step+1).padStart(2,'0')}`);
      if (await page.locator('#journeyNext').innerText()==='重新游览') break;
      const buttons=page.locator('#journeyChoices button');
      if (await buttons.count()) {
        assert.ok(await page.locator('#journeyNext').isDisabled(),'Junction must wait for route choice');
        assert.ok(modes[route][id],'Unspecified junction '+id);
        await page.locator(`#journeyChoices [data-edge="${modes[route][id]}"]`).click();
      } else await page.locator('#journeyNext').click();
    }
    assert.ok(visited.length<60);
    if (route===0) {
      assert.ok(titles.includes('保护四库全书') && titles.includes('费巩明灯') && titles.includes('百鸟归林') && titles.includes('求是巢') && titles.includes('120 周年纪念雕塑'));
      assert.ok(!titles.includes('抢运校产'));
    }
    if (route===1) {
      assert.ok(titles.includes('抢运校产') && titles.includes('手摇发电亮灯') && titles.includes('求是巢') && titles.includes('西迁纪念碑亭'));
      assert.ok(!titles.includes('保护四库全书'));
    }
    await page.locator('#view-finale.is-active').waitFor({state:'visible'});
    await shot('route-'+(route+1)+'-finale');
  }
  // Return to the fork and select the other direction without retaining the old branch.
  await page.goto(url);
    await page.reload();
  while (await page.locator('#journeyTitle').innerText()!=='樟树') await page.locator('#journeyNext').click();
  await page.locator('[data-edge="ridge"]').click();
  await page.locator('#journeyPrev').click();
  assert.equal(await page.locator('#journeyTitle').innerText(),'樟树');
  await page.locator('[data-edge="east"]').click();
  assert.notEqual(await page.locator('#journeyTitle').getAttribute('data-stop'),'stone:茶陵');
  await shot('changed-branch');
}).catch(e=>{console.error(e);process.exitCode=1;});
