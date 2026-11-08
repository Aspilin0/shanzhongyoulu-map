(function () {
  'use strict';
  var D = window.SITE;
  function stone(s) {
    var record = window.STONE_CONTENT[s.n];
    if (!record) return { title:s.n, event:'该点的资料尚未核实。', sources:[], missing:true };
    return { title:s.n, event:record.intro,
      intro:record.intro, category:record.category, detail:record.detail, sources:record.sources };
  }
  function describe(p) {
    if (p.kind === 'stone') return stone(p);
    if (p.kind === 'chapter') {
      var c = D.chapters.find(function (c) { return c.id === p.id; });
      return { title:D.sculptureIndex[c.primary].name, event:c.intro, category:'西迁故事', sources:c.src.concat(['R01']) };
    }
    if (p.kind === 'sculpture') {
      var s = D.sculptureIndex[p.id];
      return { title:s.name, event:s.brief, category:'西迁故事', sources:s.src.concat(['R01']) };
    }
    var record = window.PLACE_CONTENT[p.id];
    return { title:p.label, event:record.intro, detail:record.detail, category:'园区景观', sources:record.sources };
  }
  window.PARK_CONTENT = { describe:describe, stone:stone };
})();
