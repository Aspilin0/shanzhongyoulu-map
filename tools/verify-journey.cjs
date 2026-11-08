const { run } = require('./browser-qa.cjs');
run('mainline-journey', async ({ page, shot, assert }) => {
  const title=page.locator('#journeyTitle'), next=page.locator('#journeyNext'), prev=page.locator('#journeyPrev');
  assert.equal(await title.innerText(),'杭州');
  assert.ok(await prev.isDisabled());
  assert.equal(await page.locator('#journeyChoices,[data-edge]').count(),0);
  const visited=[], titles=[];
  for(let step=0;step<40;step++) {
    const id=await title.getAttribute('data-stop');
    assert.ok(!visited.includes(id),'Mainline loops back to '+id);
    visited.push(id);titles.push(await title.innerText());
    assert.ok(await next.isEnabled(),'Next stop must never wait for a branch choice');
    if(id!=='stone:杭州') await page.waitForFunction(()=>{
      const p=document.querySelector('#journeyMarker').getBoundingClientRect(),v=document.querySelector('#mapScroll').getBoundingClientRect();
      return Math.abs(p.x+p.width/2-v.x-v.width/2)<3 && Math.abs(p.y+p.height/2-v.y-v.height/2)<3;
    },null,{timeout:3000});
    const nav=await next.boundingBox();
    assert.ok(nav.y+nav.height<=page.viewportSize().height,'Next button must stay on screen');
    await shot('step-'+String(step+1).padStart(2,'0'));
    if(await next.innerText()==='重新游览') break;
    if(await title.innerText()==='费巩明灯') {
      await page.locator('#journeyDetails').click();
      assert.equal(await page.locator('#dlgTitle').innerText(),'灯火');
      await shot('lamp-details');
      await page.locator('.dialog__close').click();
      assert.equal(await title.innerText(),'费巩明灯');
    }
    await next.click();
  }
  assert.equal(visited.length,27);
  assert.ok(titles.indexOf('宜山')<titles.indexOf('费巩明灯') && titles.indexOf('费巩明灯')<titles.indexOf('青岩'));
  for(const branch of ['衡阳','衡山','攸县','耒阳','茶陵','永丰','桂林','荔浦','西侧岔路','滨水岔路']) assert.ok(!titles.includes(branch),'Branch entered: '+branch);
  assert.equal(titles.at(-1),'永兴');
  await prev.click();
  await page.waitForTimeout(1500);
  assert.ok(await page.locator('#view-map.is-active').isVisible(),'Previous cancels the pending finale');
  await next.click();
  await page.locator('#view-finale.is-active').waitFor({state:'visible'});
  await shot('finale');
  await page.getByRole('link',{name:'返回地图',exact:true}).click();
  await next.click();
  assert.equal(await title.innerText(),'杭州');
  assert.ok(await prev.isDisabled());
  // Branches remain freely readable, without entering the Next-stop sequence.
  await page.locator('#zoomFit').click();
  await page.getByRole('button',{name:/地名石刻.*衡阳/}).focus();
  assert.equal(await page.locator('#poiPreviewTitle').innerText(),'衡阳');
  assert.equal(await title.innerText(),'杭州');
  await shot('free-branch-preview');
}).catch(e=>{console.error(e);process.exitCode=1;});
