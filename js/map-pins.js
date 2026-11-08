(function(){
  'use strict';
  window.PARK_PINS = function (ctx) {
    var D=ctx.D, $=ctx.$, el=ctx.el, onPoiClick=ctx.onPoiClick, openStone=ctx.openStone;
    var chapterById={}; D.chapters.forEach(function(c){chapterById[c.id]=c;});
    var host = $('#poiLayer');
    if (!host) return;
    host.innerHTML = '';
    var grouped={}, folded={};
    var extent=window.PARK_MAP.extent;
    D.poi.filter(function(p){return p.kind!=='sculpture';}).forEach(function(p){
      var nearest=-1, distance=35;
      D.stones.forEach(function(s,i){
        var gap=Math.hypot((p.x-s.x)*extent[2]/100,(p.y-s.y)*extent[3]/100);
        if(gap<distance){distance=gap;nearest=i;}
      });
      if(nearest>=0){folded[p.id]=true;(grouped[nearest] ||= []).push(p);}
    });
    D.poi.filter(function (p) { return p.kind !== 'sculpture' && !folded[p.id]; }).forEach(function (p) {
      var btn = el('button', 'poi poi--' + p.kind);
      btn.type = 'button';
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.dataset.id = p.id;
      btn.dataset.kind = p.kind;

      if (p.kind === 'chapter') {
        var c = chapterById[p.id];
        btn.dataset.parent = p.id;
        btn.setAttribute('aria-label', D.sculptureIndex[c.primary].name + ' · ' + c.key);
        var dot = el('span', 'poi__dot');
        dot.textContent = '';
        btn.appendChild(dot);
        btn.appendChild(el('span', 'poi__label', D.sculptureIndex[c.primary].name));
      } else if (p.kind === 'site') {
        btn.dataset.parent = '';
        btn.setAttribute('aria-label', p.label);
        btn.appendChild(el('span', 'poi__dot'));
        btn.appendChild(el('span', 'poi__label', p.label));
      } else {
        btn.dataset.parent = '';
        btn.setAttribute('aria-label', p.label);
        btn.appendChild(el('span', 'poi__dot'));
        btn.appendChild(el('span', 'poi__label', '纪念碑亭'));
      }

      btn.addEventListener('click', function () { onPoiClick(p); });
      window.PARK_PREVIEW.bind(btn, window.PARK_CONTENT.describe(p), function () { onPoiClick(p); });
      host.appendChild(btn);
    });

    /* Stone order and positions are generated from the shared trail geometry. */
    (D.stones || []).forEach(function (s, i) {
      var b = el('button', 'poi poi--stone');
      b.type = 'button';
      b.style.left = s.x + '%';
      b.style.top = s.y + '%';
      b.dataset.kind = 'stone';
      b.dataset.stoneIndex = String(i);
      b.setAttribute('aria-label', '西迁之路地名石刻第 ' + (i + 1) + ' 站：' + s.n);
      b.appendChild(el('span', 'poi__dot'));
      var nearby=grouped[i] || [];
      b.dataset.relatedIds=nearby.map(function(p){return p.id;}).join(',');
      if(nearby.length) b.classList.add('has-place');
      var names=nearby.map(function(p){return window.PARK_CONTENT.describe(p).title;});
      b.appendChild(el('span', 'poi__label', names.length ? s.n+' · '+names.join('、') : s.n));
      b.addEventListener('click', function () { openStone(i); });
      window.PARK_PREVIEW.bind(b, window.PARK_CONTENT.stone(s), function () { openStone(i); }, nearby.map(function(p){
        return { title:window.PARK_CONTENT.describe(p).title, open:function(){onPoiClick(p);} };
      }));
      host.appendChild(b);
    });

  };
})();
