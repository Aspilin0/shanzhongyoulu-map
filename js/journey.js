(function () {
  'use strict';
  var stones = window.SITE.stones;
  var index = 0;
  var hooks;
  var timer;
  var title = document.getElementById('journeyTitle');
  var event = document.getElementById('journeyEvent');
  var count = document.getElementById('journeyCount');
  var prev = document.getElementById('journeyPrev');
  var next = document.getElementById('journeyNext');
  var marker = document.getElementById('journeyMarker');
  function cancel() { clearTimeout(timer); }
  function paint() {
    var s = stones[index];
    var content = window.PARK_CONTENT.stone(s);
    title.textContent = content.title;
    event.textContent = content.event;
    count.textContent = (index + 1) + ' / ' + stones.length + ' 站';
    prev.disabled = index === 0;
    prev.textContent = index ? '上一站 ' + stones[index - 1].n : '上一站';
    next.textContent = index < stones.length - 1 ? '下一站 ' + stones[index + 1].n : '重新游览';
    marker.hidden = false;
    marker.style.left = s.x + '%';
    marker.style.top = s.y + '%';
    marker.classList.toggle('is-east', s.x > 90);
    marker.setAttribute('aria-label', '当前位置：' + s.n);
    marker.querySelector('span').textContent = s.n;
    document.querySelectorAll('.poi--stone').forEach(function (button, i) {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }
  function select(i, automatic) {
    cancel();
    if (i < 0 || i >= stones.length) return;
    index = i;
    paint();
    window.PARK_PREVIEW.hide();
    if (index === 0) hooks.overview();
    else hooks.focus(stones[index]);
    if (automatic && index === stones.length - 1) {
      timer = setTimeout(hooks.finish, 1400);
    }
  }
  function enter() {
    paint();
    requestAnimationFrame(function () {
      if (document.body.dataset.view === 'map') {
        if (index === 0) hooks.overview();
        else hooks.focus(stones[index], true);
      }
    });
  }
  function init(options) {
    hooks = options;
    prev.addEventListener('click', function () { select(index - 1, true); });
    next.addEventListener('click', function () { select(index === stones.length - 1 ? 0 : index + 1, true); });
    paint();
  }
  window.PARK_JOURNEY = { init: init, enter: enter, select: select, cancel: cancel };
})();
