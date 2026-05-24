/**
 * Bubbles
 * Subtle floating bubbles, anchored to the document so they scroll away with the
 * page. Each one enters from just off the top edge or right edge of the *current*
 * viewport, drifts diagonally toward the bottom-left, fades out, then re-enters
 * off an edge again. Bubbles never appear inside the visible area — they only
 * ever slide in from the edges (so after load the screen fills in from the edges
 * over ~20s).
 */

(function () {
  'use strict';

  var MIN_BUBBLE_COUNT = 20;
  var MAX_BUBBLE_COUNT = 64;
  var BUBBLES_PER_VIEWPORT = 16;
  var RIGHT_EDGE_SHARE = 0.4; // fraction that enter from the right edge vs the top edge
  var RIGHT_EDGE_VERTICAL_SPAN = 2.4; // also seeds bubbles below the viewport for scrolling
  var MIN_SIZE = 8;
  var MAX_SIZE = 48;
  var MIN_DURATION = 22000;
  var MAX_DURATION = 48000;
  var INITIAL_STAGGER = 22000;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Full scrollable height — the layer spans this so document-anchored bubbles
  // deep in the page aren't clipped by the layer's overflow:hidden.
  function docHeight() {
    var d = document.documentElement;
    var b = document.body;
    return Math.max(
      d.scrollHeight, d.offsetHeight,
      b ? b.scrollHeight : 0, b ? b.offsetHeight : 0,
      window.innerHeight
    );
  }

  var timers = [];
  var animations = [];

  function viewportBounds() {
    var scrollX = window.scrollX || window.pageXOffset || 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var viewport = window.visualViewport;

    if (viewport) {
      return {
        left: scrollX + viewport.offsetLeft,
        top: scrollY + viewport.offsetTop,
        width: viewport.width,
        height: viewport.height
      };
    }

    return {
      left: scrollX,
      top: scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  function bubbleCount() {
    var viewport = viewportBounds();
    var viewportHeight = Math.max(viewport.height, 1);
    var count = Math.ceil((docHeight() / viewportHeight) * BUBBLES_PER_VIEWPORT);

    return Math.max(MIN_BUBBLE_COUNT, Math.min(MAX_BUBBLE_COUNT, count));
  }

  function randomize(bubble) {
    var size = rand(MIN_SIZE, MAX_SIZE);
    var viewport = viewportBounds();
    var scale = size / MAX_SIZE;

    // Enter from just OFF the top or right edge of the CURRENT viewport, in document
    // coordinates (so the bubble then scrolls with the page). Never inside the view.
    var startX, startY;
    if (Math.random() < RIGHT_EDGE_SHARE) {
      var spawnTop = viewport.top - size;
      var spawnBottom = Math.min(
        docHeight() - size,
        viewport.top + viewport.height * RIGHT_EDGE_VERTICAL_SPAN
      );

      startX = viewport.left + viewport.width + rand(0, size); // off the right edge
      startY = rand(spawnTop, Math.max(spawnTop, spawnBottom));
    } else {
      startX = viewport.left + rand(-size, viewport.width);    // anywhere across the width
      startY = viewport.top - rand(size, size + 20);           // just above the visible top
    }

    // Diagonal drift toward the bottom-left; bigger bubbles travel farther.
    var dx = -rand(viewport.width * (0.55 + scale * 0.25), viewport.width * (0.85 + scale * 0.25));
    var dy = rand(viewport.height * (0.45 + scale * 0.15), viewport.height * (0.75 + scale * 0.15));

    var borderOpacity = rand(0.18, 0.30) * (0.6 + scale * 0.4);
    var fillOpacity = rand(0.04, 0.09) * (0.6 + scale * 0.4);

    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = startX + 'px';
    bubble.style.top = startY + 'px';
    bubble.style.setProperty('--bubble-border-opacity', borderOpacity.toFixed(3));
    bubble.style.setProperty('--bubble-fill-opacity', fillOpacity.toFixed(3));

    return {
      dx: dx,
      dy: dy,
      duration: rand(MIN_DURATION, MAX_DURATION)
    };
  }

  function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index !== -1) animations.splice(index, 1);
  }

  function animateBubble(container, bubble) {
    var path = randomize(bubble);

    var animation = bubble.animate([
      { transform: 'translate3d(0, 0, 0)', opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.08 },
      { opacity: 1, offset: 0.92 },
      {
        transform: 'translate3d(' + path.dx + 'px, ' + path.dy + 'px, 0)',
        opacity: 0,
        offset: 1
      }
    ], {
      duration: path.duration,
      easing: 'linear',
      fill: 'none'
    });

    animation.onfinish = function () {
      removeAnimation(animation);
      bubble.remove();
      scheduleBubble(container, 0);
    };

    animation.oncancel = function () {
      removeAnimation(animation);
      bubble.remove();
    };

    animations.push(animation);
  }

  function createBubble(container) {
    if (document.hidden) return;

    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    container.appendChild(bubble);
    animateBubble(container, bubble);
  }

  function scheduleBubble(container, delay) {
    var timer = window.setTimeout(function () {
      var index = timers.indexOf(timer);
      if (index !== -1) timers.splice(index, 1);
      createBubble(container);
    }, delay);

    timers.push(timer);
  }

  function clearBubbles(container) {
    timers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    timers = [];

    animations.slice().forEach(function (animation) {
      animation.cancel();
    });
    animations = [];

    container.innerHTML = '';
  }

  function startBubbles(container) {
    clearBubbles(container);

    for (var i = 0, count = bubbleCount(); i < count; i++) {
      // Positive stagger keeps the initial viewport empty of mid-screen spawns; each
      // bubble becomes visible only after it starts sliding in from an edge.
      scheduleBubble(container, rand(0, INITIAL_STAGGER));
    }
  }

  function init() {
    var container = document.getElementById('bubbles');
    if (!container) return;

    var sizeLayer = function () { container.style.height = docHeight() + 'px'; };
    sizeLayer();
    window.addEventListener('load', function () {
      sizeLayer();     // height may grow once fonts/images load
      startBubbles(container);
    });
    window.addEventListener('resize', sizeLayer);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', sizeLayer);

    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) return;

      sizeLayer();
      startBubbles(container);
    });

    startBubbles(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
