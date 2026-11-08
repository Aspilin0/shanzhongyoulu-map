/* ============================================================================
 * 山中有路 · 交互逻辑
 * 零依赖。路由用 hash： #/  #/map  #/timeline  #/finale  #/about  #/node/N01
 * ========================================================================== */
(function () {
  'use strict';

  var D = window.SITE;
  var LS_KEY = 'shanyouzhonglu.visited.v1';
  var LS_ANIM = 'shanyouzhonglu.anim.v1';
  var LS_INTRO = 'shanyouzhonglu.intro.seen.v2';
  var introSeen = false;
  try { introSeen = localStorage.getItem(LS_INTRO) === 'yes'; } catch (e) {}
  var firstDestination = location.hash && location.hash !== '#/home' ? location.hash : '#/map';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var chapterById = {};
  D.chapters.forEach(function (c) { chapterById[c.id] = c; });
  /* 序章也走同一套卡片渲染，但不计入五章进度 */
  if (D.prologue) chapterById[D.prologue.id] = D.prologue;
  var navOrder = (D.prologue ? [D.prologue] : []).concat(D.chapters);

  /* --------------------------------------------------------------- 进度存储 */
  var visited = (function () {
    try {
      var raw = localStorage.getItem(LS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  })();

  function hasVisited(id) { return visited.indexOf(id) !== -1; }

  function markVisited(chapter) {
    var ids = [chapter.id].concat(chapter.extra || []);
    var changed = false;
    ids.forEach(function (id) {
      if (visited.indexOf(id) === -1) { visited.push(id); changed = true; }
    });
    if (changed) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(visited)); } catch (e) {}
      paintProgress();
    }
  }

  function resetVisited() {
    visited.length = 0;
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    paintProgress();
  }

  function paintProgress() {
    $$('.poi--chapter').forEach(function (el) {
      el.classList.toggle('is-visited', hasVisited(el.dataset.id));
    });
    $$('.poi--sculpture').forEach(function (el) {
      el.classList.toggle('is-visited', hasVisited(el.dataset.parent));
    });

  }

  /* ------------------------------------------------------------------ 工具 */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function citeList(ids) {
    var wrap = el('div', 'src-table');
    ids.forEach(function (id) {
      var s = D.sources[id];
      if (!s) return;
      var row = el('div', 'src-row' + (s.u || s.local ? '' : ' src-row--nolink'));
      row.appendChild(el('span', 'src-row__id', id));
      var body = el('span', 'src-row__title');
      body.textContent = s.t;
      row.appendChild(body);
      var meta = el('span', 'src-row__meta');
      if (s.u) {
        var a = el('a', null, s.o + ' · ' + s.d);
        a.href = s.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
        meta.appendChild(a);
      } else {
        meta.textContent = s.o + ' · ' + s.d;
      }
      row.appendChild(meta);
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* 图片：按候选路径依次尝试，全部失败时降级为一个说明框，不留破图 */
  function figure(opts) {
    var fig = el('figure', 'figure');
    var frame = el('div', 'figure__frame');
    var badge = el('span', 'figure__badge figure__badge--' + (opts.then ? 'then' : 'now'), opts.badge);
    frame.appendChild(badge);

    var chain = opts.sources || [opts.src];
    var idx = 0;
    var img = new Image();
    img.alt = opts.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = function () {
      idx += 1;
      if (idx < chain.length) { img.src = chain[idx]; return; }
      if (img.parentNode) img.parentNode.removeChild(img);
      var miss = el('div', 'photo-missing');
      miss.appendChild(el('strong', null, opts.missingTitle || '图片待接入'));
      miss.appendChild(el('span', null, opts.missing || ''));
      frame.appendChild(miss);
    };
    img.src = chain[0];
    frame.appendChild(img);

    fig.appendChild(frame);
    var cap = el('figcaption', 'figure__cap');
    var span = el('span', null, opts.caption || '');
    cap.appendChild(span);
    fig.appendChild(cap);
    return fig;
  }

  function para(text) { var p = el('p'); p.textContent = text; return p; }

  /* ================================================================ 地图 */
  function buildPoi() { window.PARK_PINS({D:D,$:$,el:el,onPoiClick:onPoiClick,openStone:openStone}); }

  function onPoiClick(p) {
    if (p.kind === 'chapter') openChapter(p.id);
    else if (p.kind === 'sculpture') openSculpture(p.id);
    else if (p.kind === 'site') openSite(p);
    else openSite(p);
  }

  /* Scale the whole coordinate plane, so the SVG and buttons cannot drift. */
  var mapZoom = 1;
  var mapFit = window.innerWidth > 760;
  function resizeMap(center) {
    var scroll = $('#mapScroll'); var frame = $('#mapFrame');
    if (!scroll || !scroll.clientWidth) return;
    var oldWidth = frame.offsetWidth || 1;
    var bounds = scroll.getBoundingClientRect(), rect = frame.getBoundingClientRect();
    var mid = center ? .5 : (bounds.left + scroll.clientWidth / 2 - rect.left) / oldWidth;
    var midY = center ? .5 : (bounds.top + scroll.clientHeight / 2 - rect.top) / (frame.offsetHeight || 1);
    var extent = window.PARK_MAP.extent;
    var ratio = extent[2] / extent[3];
    var fitWidth = Math.min(scroll.clientWidth, scroll.clientHeight * ratio);
    var base = Math.max(fitWidth, window.innerWidth <= 760 ? 620 : scroll.clientWidth * .9);
    frame.style.aspectRatio = extent[2] + ' / ' + extent[3];
    frame.style.width = (mapFit ? fitWidth : base * mapZoom) + 'px';
    $('#mapCanvas').style.padding = mapFit ? '0' : scroll.clientHeight / 2 + 'px ' + scroll.clientWidth / 2 + 'px';
    frame.classList.toggle('is-overview', mapFit);
    rect = frame.getBoundingClientRect();
    scroll.scrollLeft = mapFit ? 0 : scroll.scrollLeft + rect.left - bounds.left + mid * frame.offsetWidth - scroll.clientWidth / 2;
    scroll.scrollTop = mapFit ? 0 : scroll.scrollTop + rect.top - bounds.top + midY * frame.offsetHeight - scroll.clientHeight / 2;
    $('#zoomIn').disabled = !mapFit && mapZoom >= 2.25;
    $('#zoomOut').disabled = mapFit;
    $('#zoomFit').setAttribute('aria-pressed', String(mapFit));
  }

  function focusStone(stone) {
    mapFit = false;
    mapZoom = Math.max(mapZoom, 1.25);
    resizeMap(false);
    var scroll = $('#mapScroll'), frame = $('#mapFrame');
    var bounds = scroll.getBoundingClientRect(), rect = frame.getBoundingClientRect();
    scroll.scrollTo({
      left: scroll.scrollLeft + rect.left - bounds.left + stone.x / 100 * frame.offsetWidth - scroll.clientWidth / 2,
      top: scroll.scrollTop + rect.top - bounds.top + stone.y / 100 * frame.offsetHeight - scroll.clientHeight / 2,
      behavior: 'auto'
    });
  }

  var cards = window.PARK_CARDS({ D: D, $: $, $$: $$, el: el, figure: figure,
    para: para, citeList: citeList, chapterById: chapterById,
    navOrder: navOrder, markVisited: markVisited, showView: showView });
  var dialog = cards.dialog, openChapter = cards.openChapter, openSculpture = cards.openSculpture;
  var openSite = cards.openSite, openStone = cards.openStone, closeDialog = cards.close;

  /* ============================================================ 时间轴 */
  function buildTimeline() {
    var host = $('#timeline');
    if (!host) return;
    host.innerHTML = '';
    D.timeline.forEach(function (it) {
      var li = el('div', 'tl__item');
      li.appendChild(el('span', 'tl__date', it.d));
      var p = el('p', 'tl__text', it.t);
      var sup = el('span', 'tl__src', '[' + it.s + ']');
      p.appendChild(sup);
      li.appendChild(p);
      host.appendChild(li);
    });
  }

  function buildParkTimeline() {
    var host = $('#parkTimeline');
    if (!host) return;
    host.innerHTML = '';
    D.park.forEach(function (it) {
      var li = el('div', 'tl__item');
      li.appendChild(el('span', 'tl__date', it.d));
      var p = el('p', 'tl__text', it.t);
      p.appendChild(el('span', 'tl__src', '[' + it.s + ']'));
      li.appendChild(p);
      host.appendChild(li);
    });
  }

  /* ============================================================== 终章 */
  function buildFinale() {
    var host = $('#finaleBody');
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(el('h2', 'finale__title', D.finale.title));
    D.finale.paras.forEach(function (text) { host.appendChild(el('p', null, text)); });
    var actions = el('div');
    actions.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:40px';
    var a1 = el('a', 'btn btn--primary', '自由探索');
    a1.href = '#/explore';
    var a2 = el('a', 'btn btn--ghost', '看资料来源');
    a2.href = '#/about';
    var restart = el('a', 'btn btn--ghost', '重新游览主线');
    restart.href = '#/restart';
    actions.appendChild(a1); actions.appendChild(restart); actions.appendChild(a2);
    host.appendChild(actions);
  }

  /* ============================================================== 说明页 */
  function buildAbout() {
    var mt = $('#mapTable');
    if (mt) {
      mt.innerHTML = '';
      D.chapters.forEach(function (c) {
        var li = document.createElement('li');
        li.appendChild(el('b', null, c.key));
        var subs = D.sculptures.filter(function (s) {
          return c.primary === s.id || (c.extra || []).indexOf(s.id) !== -1;
        }).map(function (s) { return s.name + '（' + s.ref + '）'; });
        li.appendChild(el('span', null, subs.join('、')));
        mt.appendChild(li);
      });
    }

    var st = $('#sourceTable');
    if (st) {
      st.innerHTML = '';
      Object.keys(D.sources).sort(function (a, b) {
        return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
      }).forEach(function (id) {
        var s = D.sources[id];
        var row = el('div', 'src-row' + (s.u || s.local ? '' : ' src-row--nolink'));
        row.appendChild(el('span', 'src-row__id', id));
        var title = el('span', 'src-row__title');
        title.appendChild(document.createTextNode(s.t));
        row.appendChild(title);
        var meta = el('span', 'src-row__meta');
        if (s.u) {
          var a = el('a', null, s.o + ' · ' + s.d + ' ↗');
          a.href = s.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
          meta.appendChild(a);
        } else {
          meta.textContent = s.o + ' · ' + s.d;
        }
        row.appendChild(meta);
        st.appendChild(row);
      });
    }
  }

  /* ============================================================== 路由 */
  var ROUTES = ['home', 'map', 'finale', 'about'];

  function showView(name) {
    window.PARK_PREVIEW.hide();
    document.body.dataset.view = name;
    ROUTES.forEach(function (r) {
      var v = document.getElementById('view-' + r);
      if (!v) return;
      v.classList.toggle('is-active', r === name);
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'map') window.PARK_JOURNEY.enter();
    else window.PARK_JOURNEY.cancel();
  }

  function route() {
    document.body.classList.toggle('is-intro', !introSeen);
    if (!introSeen) { showView('home'); return; }
    var h = location.hash.replace(/^#\/?/, '');
    if (h === 'explore') { window.PARK_JOURNEY.explore(); showView('map'); return; }
    if (h === 'restart') {
      window.PARK_JOURNEY.restart(); history.replaceState(null, '', '#/map'); showView('map'); return;
    }
    if (h.indexOf('node/') === 0) {
      var id = h.slice(5);
      if (chapterById[id]) {
        showView('map');
        if (!cards.currentChapter() || cards.currentChapter().id !== id) openChapter(id);
        return;
      }
      if (D.sculptureIndex[id]) {
        showView('map');
        openSculpture(id);
        return;
      }
    }
    if (h === 'node') { showView('map'); return; }
    var name = h === 'timeline' ? 'about' : ROUTES.indexOf(h) !== -1 && h !== 'home' ? h : 'map';
    if (h === 'timeline') $('#historyDetails').open = true;
    if (dialog && !dialog.hidden) closeDialog();
    showView(name);
  }

  /* ============================================================== 初始化 */
  function init() {
    buildPoi();
    buildTimeline();
    buildParkTimeline();
    buildFinale();
    buildAbout();
    paintProgress();
    window.PARK_JOURNEY.init({
      focus: focusStone,
      mapRoute: function () { history.replaceState(null, '', '#/map'); },
      open: function (stop) {
        if (stop.kind === 'stone') openStone(stop.stoneIndex);
        else onPoiClick(D.poi.find(function (p) { return p.id === stop.poiId; }));
      },
      overview: function () { mapFit = true; resizeMap(true); },
      finish: function () { closeDialog(); location.hash = '#/finale'; }
    });

    $('#enterMap').addEventListener('click', function () {
      introSeen = true;
      try { localStorage.setItem(LS_INTRO, 'yes'); } catch (e) {}
      history.replaceState(null, '', firstDestination);
      route();
    });

    $('#zoomIn').addEventListener('click', function () {
      if (mapFit) { mapFit = false; mapZoom = 1.25; }
      else mapZoom = Math.min(2.25, mapZoom + .25);
      resizeMap(false);
    });
    $('#zoomOut').addEventListener('click', function () {
      if (mapZoom <= 1) mapFit = true;
      else mapZoom = Math.max(1, mapZoom - .25);
      resizeMap(false);
    });
    $('#zoomFit').addEventListener('click', function () { mapFit = true; mapZoom = 1; resizeMap(true); });
      window.addEventListener('resize', function () { resizeMap(false); });

    $$('[data-close]', dialog).forEach(function (n) {
      n.addEventListener('click', closeDialog);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !dialog.hidden) closeDialog();
      if (e.key === 'Tab' && !dialog.hidden) {
        var focusable = Array.from(dialog.querySelectorAll('a[href], button, [tabindex="0"]')).filter(function (n) { return n.getClientRects().length; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var rst = $('#resetProgress');
    if (rst) rst.addEventListener('click', function () {
      resetVisited();
      rst.textContent = '已重置';
      setTimeout(function () { rst.textContent = '重置进度'; }, 1400);
    });

    var at = $('#animToggle');
    var animOff = false;
    try { animOff = localStorage.getItem(LS_ANIM) === 'off'; } catch (e) {}
    function applyAnim() {
      document.body.classList.toggle('no-anim', animOff);
      if (at) {
        at.setAttribute('aria-pressed', String(!animOff));
        at.textContent = animOff ? '动画 关' : '动画 开';
      }
    }
    applyAnim();
    if (at) at.addEventListener('click', function () {
      animOff = !animOff;
      try { localStorage.setItem(LS_ANIM, animOff ? 'off' : 'on'); } catch (e) {}
      applyAnim();
    });

    window.addEventListener('hashchange', route);
    route();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
