(function () {
  'use strict';
  var D = window.SITE;
  var siteNotes = {
    F01: '西迁文化园石碑位于园区东北侧。',
    F02: '「西迁之路」铜牌邻近东北侧的地名石刻步道。',
    F03: '校友林石碑位于园区东侧。',
    F04: '「求是巢」木构位于园区西南部。园区沿革资料记录了建筑学专业同学于 2024 年搭建木构的故事。',
    F05: '建校 120 周年、西迁 80 周年纪念雕塑位于园区西南侧。'
  };
  var stoneEvents = { '杭州':'1937.11.11', '建德':'1937.12.01', '金华':'1937.12.26', '玉山':'1938.01.06', '泰和':'1938.07', '宜山':'1938.11.01', '遵义':'1940', '湄潭':'1940', '永兴':'1943' };
  function stone(s) {
    var event = D.timeline.find(function (t) { return t.d === stoneEvents[s.n]; });
    return { title: s.n, event: event ? event.d + ' · ' + event.t : '西迁之路地名石刻，沿园路串联西迁途中的地名。' };
  }
  function describe(p) {
    if (p.kind === 'stone') return stone(p);
    if (p.kind === 'chapter') {
      var c = D.chapters.find(function (c) { return c.id === p.id; });
      return { title: D.sculptureIndex[c.primary].name, event: c.intro };
    }
    if (p.kind === 'sculpture') {
      var s = D.sculptureIndex[p.id];
      return { title: s.name, event: s.brief };
    }
    return { title: p.label, event: siteNotes[p.id] || D.prologue.intro };
  }
  window.PARK_CONTENT = { describe: describe, stone: stone };
})();
