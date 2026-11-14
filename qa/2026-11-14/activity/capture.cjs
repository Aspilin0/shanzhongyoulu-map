const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const base = process.env.BASE_URL || 'http://127.0.0.1:8814';
const originals = new Map(['index.html','css/atlas.css','js/data.js','js/sculptures.js'].map(file =>
  ['/' + (file === 'index.html' ? '' : file), execFileSync('git',['show','HEAD:' + file],{cwd:root,encoding:'utf8'})]));

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const results = [];
  const structures = new Map();
  try {
    for (const width of [1440,390]) for (const stage of ['before','after']) {
      const context = await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
      if (stage === 'before') await page.route('**/*',route=>{
        const url = new URL(route.request().url());
        const body = originals.get(url.pathname);
        return body === undefined ? route.continue() : route.fulfill({body,contentType:url.pathname.endsWith('.css')?'text/css':url.pathname.endsWith('.js')?'application/javascript':'text/html'});
      });
      const out = path.join(__dirname,stage,'comparison');
      mkdirSync(out,{recursive:true});
      const shot = async name=>{
        assert.deepEqual(errors,[],'Browser errors');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
        await page.screenshot({path:path.join(out,`${width}-${name}.png`)});
        results.push({stage,width,scene:name});
      };
      await page.goto(base);
      const skeleton = await page.locator('main').evaluate(main=>Array.from(main.querySelectorAll('*')).map(n=>`${n.tagName}#${n.id}`).join('\n'));
      if(stage==='before')structures.set(width,skeleton);
      else assert.equal(skeleton,structures.get(width),'Main page structure remains unchanged');
      await shot('intro');
      await page.locator('#enterMap').click();
      await shot('map');
      await page.goto(base+'/#/about');
      await shot('about');
      for(const id of ['N03','N04']) {
        await page.goto(base+'/#/node/'+id);
        await page.locator('#nodeDialog').waitFor({state:'visible'});
        await page.locator('#dlgBody img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{img.loading='eager';await img.decode();})));
        await page.locator('#dlgBody p').last().scrollIntoViewIfNeeded();
        await shot(id);
      }
      await page.goto(base+'/#/finale');
      await shot('finale');
      await context.close();
    }
    writeFileSync(path.join(__dirname,'comparison-results.json'),JSON.stringify({results,structureMatches:2,errors:[]},null,2));
    console.log('Comparison: 24 screenshots; desktop/mobile main structures unchanged; errors 0.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
