const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const context = vm.createContext({ window:{} });
const files = ['geometry','data-sources','sculptures','timeline-data','data','content-sources','stone-content','place-content','poi-content'];
for (const file of files) vm.runInContext(readFileSync(`js/${file}.js`,'utf8'),context);
const { SITE, PARK_CONTENT } = context.window;
assert.equal(SITE.stones.length,28);
const seen = new Set();
for (const stone of SITE.stones) {
  const c = PARK_CONTENT.stone(stone);
  assert.ok(!c.missing, stone.n+' needs researched content');
  assert.ok(c.event.length > 20 && !c.event.includes('沿园路串联西迁途中的地名'),stone.n+' has generic filler');
  assert.ok(!seen.has(c.event),'Repeated filler for '+stone.n); seen.add(c.event);
  assert.ok(c.sources.length && c.sources.some(id=>SITE.sources[id]?.u),stone.n+' needs a public source');
  for (const id of c.sources) assert.ok(SITE.sources[id],stone.n+': missing '+id);
}
const names = SITE.stones.map(s=>s.n);
for (const wrong of ['西江','泰和','崇陵']) assert.ok(!names.includes(wrong),'Incorrect stone transcription: '+wrong);
for (const name of ['曲江','耒阳','茶陵','永丰']) assert.ok(names.includes(name));
assert.match(PARK_CONTENT.stone({n:'樟树'}).event,/马一浮/);
assert.match(PARK_CONTENT.stone({n:'宜山'}).event,/求是/);
assert.match(PARK_CONTENT.stone({n:'湄潭'}).event,/谈家桢/);
assert.equal(PARK_CONTENT.stone({n:'兰溪'}).category,'地理背景');
assert.equal(PARK_CONTENT.stone({n:'永兴'}).category,'西迁史实');
for (const poi of SITE.poi.filter(p=>p.kind!=='sculpture')) {
  const c = PARK_CONTENT.describe(poi);
  assert.ok(c.event.length > 20,poi.id);
  assert.ok(c.sources.length && c.sources.some(id=>SITE.sources[id]?.u),poi.id+' needs sources');
}
console.log('Content: 28 distinct sourced stone introductions and 11 landmark introductions passed; names and fact types checked.');
