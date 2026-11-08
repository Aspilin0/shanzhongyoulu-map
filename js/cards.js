(function () {
  'use strict';
  window.PARK_CARDS = function (ctx) {
    var D = ctx.D, $ = ctx.$, $$ = ctx.$$, el = ctx.el, figure = ctx.figure;
    var para = ctx.para, citeList = ctx.citeList;
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

    $('#dlgTitle').textContent = c.key;
    $('#dlgSub').textContent = '';

    var facts = $('#dlgFacts');
    facts.innerHTML = '';
    var rows = [
      ['历史时间', c.year],
      ['历史地点', c.place],
      ['园区景观', c.relic]
    ];
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
      missingTitle: '历史示意图待生成',
      missing: '请将画面命名为 ' + c.id + '.svg 或 ' + c.id + '.jpg 放入 assets/history/ 目录。'
    }));
    body.appendChild(dual);

    c.body.forEach(function (text) { body.appendChild(para(text)); });
    (c.extra || []).forEach(function (id) {
      var sculpture = D.sculptureIndex[id];
      var button = el('button', 'ghost-btn', '查看' + sculpture.name);
      button.type = 'button';
      button.addEventListener('click', function () { openSculpture(id); });
      body.appendChild(button);
    });

    /* --- 五、资料来源 --- */
    var srcBox = document.createElement('div');
    srcBox.appendChild(citeList(c.src.concat(['R01'])));
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
      var b1 = el('button', 'ghost-btn', prev.key);
      b1.type = 'button';
      b1.addEventListener('click', function () { openChapter(prev.id); });
      nav.appendChild(b1);
    }
    var spacer = el('span', 'spacer');
    nav.appendChild(spacer);
    if (next) {
      var b2 = el('button', 'btn btn--primary', next.key);
      b2.type = 'button';
      b2.style.padding = '10px 20px';
      b2.style.fontSize = '14px';
      b2.addEventListener('click', function () { openChapter(next.id); });
      nav.appendChild(b2);
    } else {
      var b3 = el('a', 'btn btn--primary', '查看终章');
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

    $('#dlgTitle').textContent = s.name;
    $('#dlgSub').textContent = s.year + '　·　' + s.site;

    var facts = $('#dlgFacts');
    facts.innerHTML = '';
    [
      ['落成时间', '2017 年 5 月（六座同期完成）'],
      ['园区位置', s.site]
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
        caption: owner.history.desc,
        missingTitle: '历史示意图待生成',
        missing: '请将画面命名为 ' + owner.id + '.svg 或 ' + owner.id + '.jpg 放入 assets/history/ 目录。'
      }));
    }
    body.appendChild(dual);

    body.appendChild(para(s.story));
    var sources = el('details', 'source-details');
    sources.appendChild(el('summary', null, '资料来源'));
    sources.appendChild(citeList(s.src.concat(['R01'])));
    body.appendChild(sources);

    var nav = $('#dlgNav');
    nav.innerHTML = '';
    if (owner) {
      var b = el('button', 'btn btn--primary', '查看故事：' + owner.key);
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
    currentCardChapter = null;

    var content = window.PARK_CONTENT.stone(s);
    $('#dlgTitle').textContent = s.n;
    $('#dlgSub').textContent = content.category;
    $('#dlgFacts').innerHTML = '';

    var body = $('#dlgBody');
    body.innerHTML = '';

    body.appendChild(para(content.intro || content.event));
    if (content.detail) body.appendChild(para(content.detail));
    var sourceDetails = el('details', 'source-details');
    sourceDetails.appendChild(el('summary', null, '资料来源'));
    sourceDetails.appendChild(citeList(content.sources));
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
    $('#dlgTitle').textContent = p.label;
    $('#dlgSub').textContent = '今日北山 · 园区纪念景观';
    $('#dlgFacts').innerHTML = '';
    var body = $('#dlgBody'); body.innerHTML = '';
    var content = window.PARK_CONTENT.describe(p);
    body.appendChild(para(content.intro || content.event));
    if (content.detail) body.appendChild(para(content.detail));
    var sources = el('details', 'source-details');
    sources.appendChild(el('summary', null, '资料来源'));
    sources.appendChild(citeList(content.sources));
    body.appendChild(sources);
    $('#dlgNav').innerHTML = '<button type="button" class="btn btn--primary" data-return-map>回到地图</button>';
    $('[data-return-map]').addEventListener('click', closeDialog);
    openDialog();
  }

    return { dialog: dialog, openChapter: openChapter, openSculpture: openSculpture,
      openSite: openSite, openStone: openStone, close: closeDialog,
      currentChapter: function () { return currentCardChapter; } };
  };
})();
