(function () {
  'use strict';
  window.PARK_CARDS = function (ctx) {
    var D = ctx.D, $ = ctx.$, $$ = ctx.$$, el = ctx.el, figure = ctx.figure;
    var layer = ctx.layer, para = ctx.para, citeList = ctx.citeList;
    var chapterById = ctx.chapterById, navOrder = ctx.navOrder;
    var markVisited = ctx.markVisited, showView = ctx.showView;
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

    return { dialog: dialog, openChapter: openChapter, openSculpture: openSculpture,
      openSite: openSite, openStone: openStone, close: closeDialog,
      currentChapter: function () { return currentCardChapter; } };
  };
})();
