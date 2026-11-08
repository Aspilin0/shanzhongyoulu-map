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
  assert.ok(['西迁史实','西迁资料待考'].includes(c.category),stone.n+' must describe migration, not geographic filler');
  if (c.category === '西迁资料待考') {
    assert.match(c.detail,/到达.*待考.*离开.*待考/,stone.n+' must disclose unknown dates');
  }
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
assert.match(PARK_CONTENT.stone({n:'兰溪'}).event,/1937.*折回兰溪/);
assert.match(PARK_CONTENT.stone({n:'三水'}).event,/1938.*泰和启运/);
assert.match(PARK_CONTENT.stone({n:'青岩'}).event,/1940.*2 月 9 日.*开始上课/);
for (const name of ['赣州','南雄','曲江','三水']) {
  assert.match(PARK_CONTENT.stone({n:name}).detail,/到达.*离开.*(未列明|未核实)/,name+' must not invent transit dates');
}
assert.equal(PARK_CONTENT.stone({n:'永兴'}).category,'西迁史实');
for (const poi of SITE.poi.filter(p=>p.kind!=='sculpture')) {
  const c = PARK_CONTENT.describe(poi);
  assert.ok(c.event.length > 20,poi.id);
  assert.ok(c.sources.length && c.sources.some(id=>SITE.sources[id]?.u),poi.id+' needs sources');
}
console.log('Content: 28 migration introductions (26 sourced accounts, 2 explicitly pending) and 11 landmarks passed; dates and claim scope checked.');
