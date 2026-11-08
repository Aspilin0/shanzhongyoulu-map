(function () {
  'use strict';
  var stops = window.PARK_MAP.tour.stops;
  var index = 0;
  var hooks, timer;
  var title = document.getElementById('journeyTitle');
  var event = document.getElementById('journeyEvent');
  var count = document.getElementById('journeyCount');
  var prev = document.getElementById('journeyPrev');
  var next = document.getElementById('journeyNext');
  var details = document.getElementById('journeyDetails');
  var marker = document.getElementById('journeyMarker');
  function currentId() { return stops[index].id; }
  function current() { return stops[index]; }
  function cancel() { clearTimeout(timer); }
  function content(stop) {
    if (stop.kind === 'stone') return window.PARK_CONTENT.stone(window.SITE.stones[stop.stoneIndex]);
    if (stop.kind === 'place') return window.PARK_CONTENT.describe(window.SITE.poi.find(function (p) { return p.id === stop.poiId; }));

  }
  function paint() {
    var stop = current(), summary = content(stop);
    title.textContent = summary.title;
    title.dataset.stop = currentId();
    event.textContent = summary.event;
    count.textContent = (index + 1) + ' / ' + stops.length + ' 站';
    prev.disabled = index === 0;
    prev.textContent = '上一站';
    next.disabled = false;
    next.textContent = index < stops.length - 1 ? '下一站' : '重新游览';
    details.hidden = false;
    marker.hidden = false;
    marker.style.left = stop.x + '%'; marker.style.top = stop.y + '%';
    marker.classList.toggle('is-east', stop.x > 90);
    marker.setAttribute('aria-label', '当前位置：' + summary.title);
    marker.querySelector('span').textContent = summary.title;
    document.querySelectorAll('.poi').forEach(function (button) {
      var selected = stop.kind === 'stone' ? button.dataset.stoneIndex === String(stop.stoneIndex) : button.dataset.id === stop.poiId || (button.dataset.relatedIds || '').split(',').indexOf(stop.poiId)!==-1;
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function show(automatic) {
    cancel(); paint(); window.PARK_PREVIEW.hide();
    if (index === 0) hooks.overview(); else hooks.focus(current());
    if (automatic && index === stops.length - 1) timer = setTimeout(hooks.finish, 1400);
  }
  function move(to, automatic) {
    if (to < 0 || to >= stops.length) return;
    index = to; show(automatic);
  }
  function enter() {
    paint();
    requestAnimationFrame(function () {
      if (document.body.dataset.view !== 'map') return;
      if (index === 0) hooks.overview(); else hooks.focus(current(), true);
    });
  }
  function init(options) {
    hooks = options;
    prev.addEventListener('click', function () { move(index - 1, false); });
    next.addEventListener('click', function () { move(index === stops.length - 1 ? 0 : index + 1, true); });
    details.addEventListener('click', function () { hooks.open(current()); });
    paint();
  }
  window.PARK_JOURNEY = { init: init, enter: enter, cancel: cancel };
})();
