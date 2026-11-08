(function () {
  'use strict';
  var panel = document.getElementById('poiPreview');
  var stage = document.querySelector('.map-stage');
  var active = null;
  var pinned = false;
  var timer;
  function hide() { clearTimeout(timer); panel.hidden = true; active = null; pinned = false; }
  function show(button, content, open, related, keepOpen) {
    clearTimeout(timer);
    active = button;
    pinned = !!keepOpen;
    document.getElementById('poiPreviewTitle').textContent = content.title;
    document.getElementById('poiPreviewEvent').textContent = content.event;
    document.getElementById('previewDetails').onclick = function () { hide(); open(); };
    var links=document.getElementById('previewRelated');
    links.replaceChildren();
    (related || []).forEach(function(item){
      var link=document.createElement('button'); link.type='button';link.className='ghost-btn';link.textContent=item.title;
      link.addEventListener('click',function(){hide();item.open();}); links.appendChild(link);
    });
    panel.hidden = false;
    position();
  }
  function position() {
    if (!active || panel.hidden) return;
    var point = active.getBoundingClientRect(), bounds = stage.getBoundingClientRect();
    var left = point.right - bounds.left + 12;
    if (left + panel.offsetWidth > bounds.width - 12) left = point.left - bounds.left - panel.offsetWidth - 12;
    panel.style.left = Math.max(12, left) + 'px';
    var top = point.top - bounds.top;
    if (innerWidth <= 760) {
      top = point.bottom - bounds.top + 12;
      if (top + panel.offsetHeight > bounds.height - 12) top = point.top - bounds.top - panel.offsetHeight - 12;
    }
    panel.style.top = Math.max(12, Math.min(bounds.height - panel.offsetHeight - 12, top)) + 'px';
  }
  function leave() {
    if (pinned) return;
    timer = setTimeout(function () {
      if (!panel.matches(':hover') && !panel.contains(document.activeElement) && active !== document.activeElement) hide();
    }, 180);
  }
  function bind(button, content, open, related) {
    button.addEventListener('mouseenter', function () {
      if (innerWidth > 760 && !matchMedia('(pointer: coarse)').matches) show(button, content, open, related);
    });
    button.addEventListener('focus', function () { show(button, content, open, related); });
    button.addEventListener('mouseleave', leave);
    button.addEventListener('blur', leave);
    button.addEventListener('click', function (event) {
      if (innerWidth <= 760 || matchMedia('(pointer: coarse)').matches) {
        event.stopImmediatePropagation();
        show(button, content, open, related);
      }
    }, true);
  }
  panel.addEventListener('mouseenter', function () { clearTimeout(timer); });
  panel.addEventListener('mouseleave', leave);
  document.getElementById('previewClose').addEventListener('click', hide);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); });
  document.addEventListener('click', function (event) {
    if (!panel.contains(event.target) && !event.target.closest('.poi')) hide();
  });
  document.getElementById('mapScroll').addEventListener('scroll', function () { if (pinned) position(); else hide(); });
  window.addEventListener('resize', function () { if (pinned) position(); else hide(); });
  window.PARK_PREVIEW = { bind: bind, hide: hide, arrive: function (anchor, content, open) { show(anchor, content, open, [], true); } };
})();
