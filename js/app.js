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
      var row = el('div', 'src-row' + (s.u ? '' : ' src-row--nolink'));
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
    if (opts.meta) {
      var m = el('div', null, opts.meta);
      m.style.marginTop = '4px';
      m.style.color = 'var(--muted)';
      m.style.fontSize = '12px';
      cap.appendChild(m);
    }
    fig.appendChild(cap);
    return fig;
  }

  function layer(label, node) {
    var s = el('div', 'layer');
    var l = el('div', 'layer__label');
    l.appendChild(document.createTextNode(label));
    s.appendChild(l);
    s.appendChild(node);
    return s;
  }

  function para(text) { var p = el('p'); p.textContent = text; return p; }

  /* ================================================================ 地图 */
  var mapLayer = 'all';

  function buildPoi() {
    var host = $('#poiLayer');
    if (!host) return;
    host.innerHTML = '';
    D.poi.forEach(function (p) {
      var btn = el('button', 'poi poi--' + p.kind);
      btn.type = 'button';
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.dataset.id = p.id;
      btn.dataset.kind = p.kind;

      if (p.kind === 'chapter') {
        var c = chapterById[p.id];
        btn.dataset.parent = p.id;
        btn.setAttribute('aria-label', '第 ' + c.no + ' 章 ' + c.key + ' · ' + c.sub);
        var dot = el('span', 'poi__dot');
        dot.textContent = String(c.no);
        btn.appendChild(dot);
        btn.appendChild(el('span', 'poi__label', c.key));
      } else if (p.kind === 'sculpture') {
        var sc = D.sculptureIndex[p.id];
        var owner = D.chapters.filter(function (c) {
          return c.primary === p.id || (c.extra || []).indexOf(p.id) !== -1;
        })[0];
        btn.dataset.parent = owner ? owner.id : '';
        btn.setAttribute('aria-label', '雕塑：' + p.label);
        btn.appendChild(el('span', 'poi__dot'));
        btn.appendChild(el('span', 'poi__label', sc ? sc.name : p.label));
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
      b.setAttribute('aria-label', '西迁之路地名石刻第 ' + (i + 1) + ' 站：' + s.n);
      b.appendChild(el('span', 'poi__dot'));
      b.appendChild(el('span', 'poi__label', s.n));
      b.addEventListener('click', function () { openStone(i); });
      window.PARK_PREVIEW.bind(b, window.PARK_CONTENT.stone(s), function () { openStone(i); });
      host.appendChild(b);
    });

    applyLayer();
  }

  function applyLayer() {
    window.PARK_PREVIEW.hide();
    $('#mapFrame').dataset.layer = mapLayer;
    $$('.poi').forEach(function (btn) {
      var k = btn.dataset.kind;
      var show;
      if (mapLayer === 'all') {
        show = (k === 'chapter' || k === 'anchor' || k === 'site' || k === 'stone');
      } else if (mapLayer === 'chapter') {
        show = (k === 'chapter' || k === 'anchor');
      } else if (mapLayer === 'sculpture') {
        show = (k === 'sculpture');
      } else {
        show = (k === 'stone');
      }
      btn.hidden = !show;
    });
  }

  function onPoiClick(p) {
    if (p.kind === 'chapter') openChapter(p.id);
    else if (p.kind === 'sculpture') openSculpture(p.id);
    else if (p.kind === 'site') openSite(p);
    else openChapter(D.prologue ? D.prologue.id : 'N01');
  }

  function openSite(p) {
    currentCardChapter = null;
    $('#dlgNo').textContent = '北山漫游';
    $('#dlgTitle').textContent = p.label;
    $('#dlgSub').textContent = '今日北山 · 园区纪念景观';
    $('#dlgFacts').innerHTML = '';
    var body = $('#dlgBody'); body.innerHTML = '';
    body.appendChild(layer('沿路看见', para(window.PARK_CONTENT.describe(p).event)));
    $('#dlgNav').innerHTML = '<button type="button" class="btn btn--primary" data-return-map>回到地图</button>';
    $('[data-return-map]').addEventListener('click', closeDialog);
    openDialog();
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

  function focusStone(stone, instant) {
    mapFit = false;
    mapZoom = Math.max(mapZoom, 1.25);
    resizeMap(false);
    var scroll = $('#mapScroll'), frame = $('#mapFrame');
    var bounds = scroll.getBoundingClientRect(), rect = frame.getBoundingClientRect();
    scroll.scrollTo({
      left: scroll.scrollLeft + rect.left - bounds.left + stone.x / 100 * frame.offsetWidth - scroll.clientWidth / 2,
      top: scroll.scrollTop + rect.top - bounds.top + stone.y / 100 * frame.offsetHeight - scroll.clientHeight / 2,
      behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('no-anim') ? 'auto' : 'smooth'
    });
  }

  /* ============================================================ 节点卡片 */
  var dialog = $('#nodeDialog');
  var lastFocus = null;
  var currentCardChapter = null;

  function openDialog() {
    window.PARK_PREVIEW.hide();
    lastFocus = document.activeElement;
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    var panel = $('.dialog__panel', dialog);
    if (panel) panel.scrollTop = 0;
    setTimeout(function () {
      var btn = $('.dialog__close', dialog);
      if (btn) btn.focus();
    }, 30);
  }

  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = '';
    currentCardChapter = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (location.hash.indexOf('#/node/') === 0) {
      history.replaceState(null, '', '#/map');
      showView('map');
    }
  }

  function openChapter(id) {
    var c = chapterById[id];
    if (!c) return;
    currentCardChapter = c;
    var isPrologue = !c.no;
    if (!isPrologue) markVisited(c);

    var subIds = c.primary ? [c.primary].concat(c.extra || []) : (c.sculptures || []);
    var subs = D.sculptures.filter(function (s) { return subIds.indexOf(s.id) !== -1; });

    $('#dlgNo').textContent = isPrologue
      ? '序章'
      : '第 ' + String(c.no).padStart(2, '0') + ' 章';
    $('#dlgTitle').textContent = c.key;
    $('#dlgSub').textContent = c.sub;

    var facts = $('#dlgFacts');
    facts.innerHTML = '';
    var rows = [
      ['历史时间', c.year],
      ['历史地点', c.place],
      ['园区景观', c.relic]
    ];
    if (subs.length) {
      rows.push(['对应雕塑', subs.map(function (s) { return s.name; }).join('、')]);
    }
    rows.forEach(function (pair) {
      var li = document.createElement('li');
      li.appendChild(el('b', null, pair[0]));
      li.appendChild(el('span', null, pair[1]));
      facts.appendChild(li);
    });

    var body = $('#dlgBody');
    body.innerHTML = '';

    /* --- 双图 --- */
    var dual = el('div', 'dual');
    dual.appendChild(figure({
      then: false, badge: '现代实拍',
      src: 'assets/current/' + (c.imgKey || c.id) + '.jpg',
      alt: c.currentCaption,
      caption: c.currentCaption,
      missingTitle: '实拍图待接入',
      missing: '请将现场照片命名为 ' + (c.imgKey || c.id) + '.jpg 放入 assets/current/ 目录。'
    }));
    dual.appendChild(figure({
      then: true, badge: c.history.type,
      sources: ['assets/history/' + c.id + '.svg', 'assets/history/' + c.id + '.jpg'],
      alt: c.history.desc,
      caption: c.history.desc,
      meta: '依据：' + c.history.basis,
      missingTitle: '历史示意图待生成',
      missing: '请将画面命名为 ' + c.id + '.svg 或 ' + c.id + '.jpg 放入 assets/history/ 目录，并在图注标注依据史料与核查人。'
    }));
    body.appendChild(dual);

    /* --- 一、快速了解 --- */
    var quick = document.createElement('div');
    quick.appendChild(para(c.intro));
    quick.className = 'chapter-intro';
    body.appendChild(quick);

    /* --- 二、深入历史 --- */
    var deep = document.createElement('div');
    c.body.forEach(function (t) { deep.appendChild(para(t)); });
    body.appendChild(layer('深入历史', deep));

    /* --- 三、参与体验 --- */
    var play = document.createElement('div');
    var co = el('div', 'callout');
    co.textContent = c.interaction;
    play.appendChild(co);

    var subs = D.sculptures.filter(function (s) { return subIds.indexOf(s.id) !== -1; });
    if (subs.length) {
      var list = el('div', 'sub-list');
      subs.forEach(function (s) {
        var item = el('div', 'sub-item');
        var top = el('div', 'sub-item__top');
        top.appendChild(el('span', 'sub-item__tag', s.id));
        top.appendChild(el('span', 'sub-item__name', s.name));
        top.appendChild(el('span', 'sub-item__meta', s.year + '　·　' + s.site));
        item.appendChild(top);
        item.appendChild(para(s.brief));
        item.className += ' sub-item--link';
        item.style.cursor = 'pointer';
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.addEventListener('click', function () { openSculpture(s.id); });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSculpture(s.id); }
        });
        list.appendChild(item);
      });
      play.appendChild(list);
    }
    if (/P1|预留|当前版本/.test(c.interaction)) {
      co.remove();
      if (subs.length) body.appendChild(layer('相关雕塑', play));
    } else body.appendChild(layer('参与体验', play));

    /* --- 四、回到今日 --- */
    var today = document.createElement('div');
    today.className = 'layer--quote';
    today.appendChild(para(c.today));
    body.appendChild(layer('回到今日', today));

    /* --- 五、资料来源 --- */
    var srcBox = document.createElement('div');
    srcBox.appendChild(citeList(c.src));
    var sourceDetails = el('details', 'source-details');
    sourceDetails.appendChild(el('summary', null, '资料来源'));
    sourceDetails.appendChild(srcBox);
    body.appendChild(sourceDetails);

    /* --- 导航 --- */
    var nav = $('#dlgNav');
    nav.innerHTML = '';
    var pos = navOrder.indexOf(c);
    var prev = pos > 0 ? navOrder[pos - 1] : null;
    var next = pos >= 0 && pos < navOrder.length - 1 ? navOrder[pos + 1] : null;
    if (prev) {
      var b1 = el('button', 'ghost-btn', (prev.no ? '第 ' + prev.no + ' 章 ' : '序章 ') + prev.key);
      b1.type = 'button';
      b1.addEventListener('click', function () { openChapter(prev.id); });
      nav.appendChild(b1);
    }
    var spacer = el('span', 'spacer');
    nav.appendChild(spacer);
    if (next) {
      var b2 = el('button', 'btn btn--primary', (next.no ? '第 ' + next.no + ' 章 ' : '') + next.key);
      b2.type = 'button';
      b2.style.padding = '10px 20px';
      b2.style.fontSize = '14px';
      b2.addEventListener('click', function () { openChapter(next.id); });
      nav.appendChild(b2);
    } else {
      var b3 = el('a', 'btn btn--primary', '读终章 · 山外有路');
      b3.href = '#/finale';
      b3.style.padding = '10px 20px';
      b3.style.fontSize = '14px';
      b3.addEventListener('click', function () { closeDialog(); });
      nav.appendChild(b3);
    }

    openDialog();
    if (location.hash !== '#/node/' + c.id) {
      history.replaceState(null, '', '#/node/' + c.id);
    }
  }

  function openSculpture(id) {
    var s = D.sculptureIndex[id];
    if (!s) return;
    var owner = D.chapters.filter(function (c) {
      return c.primary === s.id || (c.extra || []).indexOf(s.id) !== -1;
    })[0];
    if (owner) markVisited(owner);
    currentCardChapter = owner || null;

    $('#dlgNo').textContent = '雕塑 / SCULPTURE　' + s.id + '　（资料底本 ' + s.ref + '）';
    $('#dlgTitle').textContent = s.name;
    $('#dlgSub').textContent = s.year + '　·　' + s.site;

    var facts = $('#dlgFacts');
    facts.innerHTML = '';
    [
      ['所属章节', owner ? '第 ' + owner.no + ' 章 · ' + owner.key : '—'],
      ['落成时间', '2017 年 5 月（六座同期完成）'],
      ['园区位置', s.site],
      ['资料来源', s.src.join('、')]
    ].forEach(function (pair) {
      var li = document.createElement('li');
      li.appendChild(el('b', null, pair[0]));
      li.appendChild(el('span', null, pair[1]));
      facts.appendChild(li);
    });

    var body = $('#dlgBody');
    body.innerHTML = '';

    var dual = el('div', 'dual');
    var imgKey = s.img || (owner ? (owner.imgKey || owner.id) : 'N01');
    dual.appendChild(figure({
      then: false, badge: '现代实拍',
      src: 'assets/current/' + imgKey + '.jpg',
      alt: s.imgCaption || (s.name + ' 雕塑现状'),
      caption: s.imgCaption || (s.site + '，《' + s.name + '》雕塑现状。'),
      missingTitle: '实拍图待接入',
      missing: '请将现场照片命名为 ' + imgKey + '.jpg 放入 assets/current/ 目录。'
    }));
    if (owner) {
      dual.appendChild(figure({
        then: true, badge: owner.history.type,
        sources: ['assets/history/' + owner.id + '.svg', 'assets/history/' + owner.id + '.jpg'],
        alt: owner.history.desc,
        caption: '与本章同一张历史示意图：' + owner.history.desc,
        meta: '依据：' + owner.history.basis,
        missingTitle: '历史示意图待生成',
        missing: '请将画面命名为 ' + owner.id + '.svg 或 ' + owner.id + '.jpg 放入 assets/history/ 目录。'
      }));
    }
    body.appendChild(dual);

    var q = document.createElement('div');
    q.appendChild(para(s.brief));
    body.appendChild(layer('快速了解', q));

    var d = document.createElement('div');
    d.appendChild(para(s.story));
    body.appendChild(layer('深入历史', d));

    var t = document.createElement('div');
    var co = el('div', 'callout callout--gold');
    co.textContent = '这六座雕塑的铭牌上都装有二维码，扫描可以了解该场景的完整故事。园区里「线下扫牌」与这张地图上的「线上定位」指向的是同一段史实。';
    t.appendChild(co);
    body.appendChild(layer('回到今日', t));

    var sb = document.createElement('div');
    sb.appendChild(citeList(s.src));
    body.appendChild(layer('资料来源', sb));

    var nav = $('#dlgNav');
    nav.innerHTML = '';
    if (owner) {
      var b = el('button', 'btn btn--primary', '读完整章节：第 ' + owner.no + ' 章 ' + owner.key);
      b.type = 'button';
      b.style.padding = '10px 20px';
      b.style.fontSize = '14px';
      b.addEventListener('click', function () { openChapter(owner.id); });
      nav.appendChild(b);
    }
    var sp = el('span', 'spacer');
    nav.appendChild(sp);
    var back = el('button', 'ghost-btn', '返回地图');
    back.type = 'button';
    back.addEventListener('click', closeDialog);
    nav.appendChild(back);

    openDialog();
  }

  /* 地名石刻：信息量小，卡片也做轻 */
  function openStone(idx) {
    var s = D.stones[idx];
    if (!s) return;
    window.PARK_JOURNEY.select(idx, false);
    currentCardChapter = null;

    $('#dlgNo').textContent = '西迁之路 · 地名石刻　第 ' + (idx + 1) + ' / ' + D.stones.length + ' 站';
    $('#dlgTitle').textContent = s.n;
    $('#dlgSub').textContent = '北山游步道 · 地面石刻';

    var facts = $('#dlgFacts');
    facts.innerHTML = '';
    [
      ['所在', '北山游步道沿线（西迁之路文化园）'],
      ['形制', '地面石刻 / 二维码铜牌'],
      ['资料来源', 'S5、S12']
    ].forEach(function (pair) {
      var li = document.createElement('li');
      li.appendChild(el('b', null, pair[0]));
      li.appendChild(el('span', null, pair[1]));
      facts.appendChild(li);
    });

    var body = $('#dlgBody');
    body.innerHTML = '';

    body.appendChild(para(window.PARK_CONTENT.stone(s).event));
    var sourceDetails = el('details', 'source-details');
    sourceDetails.appendChild(el('summary', null, '资料来源'));
    sourceDetails.appendChild(citeList(['S5', 'S12']));
    body.appendChild(sourceDetails);

    var nav = $('#dlgNav');
    nav.innerHTML = '';
    var back = el('button', 'ghost-btn', '返回地图');
    back.type = 'button';
    back.addEventListener('click', closeDialog);
    nav.appendChild(back);

    openDialog();
  }

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
    var lead = el('p');
    lead.style.textAlign = 'center';
    lead.style.textIndent = '0';
    lead.style.fontFamily = 'var(--serif)';
    lead.style.color = 'var(--gold-2)';
    lead.style.letterSpacing = '.18em';
    lead.style.marginBottom = '30px';
    lead.textContent = D.finale.lead;
    host.appendChild(lead);
    D.finale.paras.forEach(function (t, i) {
      if (i === D.finale.paras.length - 1) { host.appendChild(el('p', 'finale__closing', t)); return; }
      host.appendChild(el('p', null, t));
    });
    var actions = el('div');
    actions.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:40px';
    var a1 = el('a', 'btn btn--primary', '返回地图');
    a1.href = '#/map';
    var a2 = el('a', 'btn btn--ghost', '看资料来源');
    a2.href = '#/about';
    actions.appendChild(a1); actions.appendChild(a2);
    host.appendChild(actions);
  }

  /* ============================================================== 说明页 */
  function buildAbout() {
    var mt = $('#mapTable');
    if (mt) {
      mt.innerHTML = '';
      D.chapters.forEach(function (c) {
        var li = document.createElement('li');
        li.appendChild(el('b', null, '第 ' + c.no + ' 章'));
        var subs = D.sculptures.filter(function (s) {
          return c.primary === s.id || (c.extra || []).indexOf(s.id) !== -1;
        }).map(function (s) { return s.name + '（' + s.ref + '）'; });
        li.appendChild(el('span', null, c.key + ' · ' + c.sub + '　←　' + subs.join('、')));
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
        var row = el('div', 'src-row' + (s.u ? '' : ' src-row--nolink'));
        row.appendChild(el('span', 'src-row__id', id));
        var title = el('span', 'src-row__title');
        var badge = el('span', 'badge-lv badge-lv--' + s.lv, s.lv);
        title.appendChild(badge);
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
    if (h.indexOf('node/') === 0) {
      var id = h.slice(5);
      if (chapterById[id]) {
        showView('map');
        if (!currentCardChapter || currentCardChapter.id !== id) openChapter(id);
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

    $$('.map-layers button').forEach(function (b) {
      b.addEventListener('click', function () {
        mapLayer = b.dataset.layer;
        $$('.map-layers button').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        applyLayer();
      });
    });

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
