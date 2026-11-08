(function () {
  'use strict';
  var graph = window.PARK_MAP.tour;
  var history = [graph.start];
  var hooks, timer;
  var title = document.getElementById('journeyTitle');
  var event = document.getElementById('journeyEvent');
  var count = document.getElementById('journeyCount');
  var prev = document.getElementById('journeyPrev');
  var next = document.getElementById('journeyNext');
  var choices = document.getElementById('journeyChoices');
  var details = document.getElementById('journeyDetails');
  var marker = document.getElementById('journeyMarker');
  function currentId() { return history[history.length - 1]; }
  function current() { return graph.nodes[currentId()]; }
  function cancel() { clearTimeout(timer); }
  function content(stop) {
    if (stop.kind === 'stone') return window.PARK_CONTENT.stone(window.SITE.stones[stop.stoneIndex]);
    if (stop.kind === 'place') return window.PARK_CONTENT.describe(window.SITE.poi.find(function (p) { return p.id === stop.poiId; }));
    var options = graph.next[currentId()];
    return { title: stop.title, event: options.length ? '前方可前往' + options.map(function (o) { return o.label; }).join('，或') + '。' : '抵达这条游览路线的出口。' };
  }
  function paint() {
    var stop = current(), summary = content(stop), options = graph.next[currentId()];
    title.textContent = summary.title;
    title.dataset.stop = currentId();
    event.textContent = summary.event;
    count.textContent = '已行 ' + history.length + ' 站';
    prev.disabled = history.length === 1;
    prev.textContent = '上一站';
    next.disabled = options.length > 1;
    next.textContent = options.length > 1 ? '请选择路线' : options.length ? '下一站' : '重新游览';
    details.hidden = stop.kind === 'junction';
    choices.replaceChildren();
    choices.hidden = options.length < 2;
    options.forEach(function (option) {
      if (options.length < 2) return;
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'ghost-btn';
      button.textContent = option.label; button.dataset.edge = option.edge;
      button.addEventListener('click', function () { advance(option); });
      choices.appendChild(button);
    });
    marker.hidden = false;
    marker.style.left = stop.x + '%'; marker.style.top = stop.y + '%';
    marker.classList.toggle('is-east', stop.x > 90);
    marker.setAttribute('aria-label', '当前位置：' + summary.title);
    marker.querySelector('span').textContent = summary.title;
    document.querySelectorAll('.poi').forEach(function (button) {
      var selected = stop.kind === 'stone' ? button.dataset.stoneIndex === String(stop.stoneIndex) : button.dataset.id === stop.poiId;
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function show(automatic) {
    cancel(); paint(); window.PARK_PREVIEW.hide();
    if (history.length === 1) hooks.overview(); else hooks.focus(current());
    if (automatic && graph.next[currentId()].length === 0) timer = setTimeout(hooks.finish, 1400);
  }
  function advance(option) {
    if (history.indexOf(option.to) !== -1) return;
    history.push(option.to); show(true);
  }
  function enter() {
    paint();
    requestAnimationFrame(function () {
      if (document.body.dataset.view !== 'map') return;
      if (history.length === 1) hooks.overview(); else hooks.focus(current(), true);
    });
  }
  function init(options) {
    hooks = options;
    prev.addEventListener('click', function () { if (history.length > 1) { history.pop(); show(false); } });
    next.addEventListener('click', function () {
      var options = graph.next[currentId()];
      if (options.length === 1) advance(options[0]);
      else if (!options.length) { history = [graph.start]; show(false); }
    });
    details.addEventListener('click', function () { hooks.open(current()); });
    paint();
  }
  window.PARK_JOURNEY = { init: init, enter: enter, cancel: cancel };
})();
