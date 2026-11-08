(function () {
  'use strict';
  var stops = window.PARK_MAP.tour.stops;
  var index = 0;
  var free = false;
  var hooks, timer;
  var title = document.getElementById('journeyTitle');
  var event = document.getElementById('journeyEvent');
  var count = document.getElementById('journeyCount');
  var prev = document.getElementById('journeyPrev');
  var next = document.getElementById('journeyNext');
  var details = document.getElementById('journeyDetails');
  var marker = document.getElementById('journeyMarker');
  var panel = document.querySelector('.journey');
  var exploreControls = document.getElementById('exploreControls');
  function currentId() { return stops[index].id; }
  function current() { return stops[index]; }
  function cancel() { clearTimeout(timer); }
  function content(stop) {
    if (stop.kind === 'stone') return window.PARK_CONTENT.stone(window.SITE.stones[stop.stoneIndex]);
    if (stop.kind === 'place') return window.PARK_CONTENT.describe(window.SITE.poi.find(function (p) { return p.id === stop.poiId; }));

  }
  function paint() {
    var stop = current(), summary = content(stop);
    panel.hidden = free;
    exploreControls.hidden = !free;
    title.textContent = summary.title;
    title.dataset.stop = currentId();
    event.textContent = summary.event;
    count.textContent = (index + 1) + ' / ' + stops.length + ' 站';
    prev.disabled = index === 0;
    prev.textContent = '上一站';
    next.disabled = false;
    next.textContent = index < stops.length - 1 ? '下一站' : '播放终章';
    details.hidden = false;
    marker.hidden = free;
    marker.style.left = stop.x + '%'; marker.style.top = stop.y + '%';
    marker.classList.toggle('is-east', stop.x > 90);
    marker.setAttribute('aria-label', '当前位置：' + summary.title);
    marker.querySelector('span').textContent = summary.title;
    document.querySelectorAll('.poi').forEach(function (button) {
      var selected = !free && (stop.kind === 'stone' ? button.dataset.stoneIndex === String(stop.stoneIndex) : button.dataset.id === stop.poiId || (button.dataset.relatedIds || '').split(',').indexOf(stop.poiId)!==-1);
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function show(automatic) {
    cancel(); paint(); window.PARK_PREVIEW.hide();
    if (index === 0) hooks.overview(); else hooks.focus(current());
    if (!free && automatic && index === stops.length - 1) timer = setTimeout(hooks.finish, 1400);
  }
  function move(to, automatic) {
    if (to < 0 || to >= stops.length) return;
    index = to; show(automatic);
  }
  function enter() {
    paint();
    requestAnimationFrame(function () {
      if (document.body.dataset.view !== 'map') return;
      if (free) { hooks.overview(); return; }
      if (index === 0) hooks.overview(); else hooks.focus(current(), true);
    });
  }
  function explore() { cancel(); free = true; paint(); hooks.overview(); }
  function restart() { free = false; index = 0; show(false); }
  function init(options) {
    hooks = options;
    prev.addEventListener('click', function () { move(index - 1, false); });
    next.addEventListener('click', function () {
      if (index === stops.length - 1) { cancel(); hooks.finish(); }
      else move(index + 1, true);
    });
    document.getElementById('resumeJourney').addEventListener('click', function () {
      free = false; show(false); hooks.mapRoute();
    });
    details.addEventListener('click', function () { hooks.open(current()); });
    paint();
  }
  window.PARK_JOURNEY = { init: init, enter: enter, cancel: cancel, explore: explore, restart: restart };
})();
