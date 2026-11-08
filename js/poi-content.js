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
  function stone(s) {
    var event = D.timeline.find(function (t) { return t.t.indexOf(s.n) !== -1 && t.d !== '1946'; });
    return { title: s.n, event: event ? event.d + ' · ' + event.t : '西迁之路地名石刻，沿园路串联西迁途中的地名。' };
  }
  function describe(p) {
    if (p.kind === 'stone') return stone(p);
    if (p.kind === 'chapter') {
      var c = D.chapters.find(function (c) { return c.id === p.id; });
      return { title: p.label, event: c.intro };
    }
    if (p.kind === 'sculpture') {
      var s = D.sculptureIndex[p.id];
      return { title: s.name, event: s.brief };
    }
    return { title: p.label, event: siteNotes[p.id] || D.prologue.intro };
  }
  window.PARK_CONTENT = { describe: describe, stone: stone };
})();
