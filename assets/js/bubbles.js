/**
 * Bubbles
 * Subtle floating bubbles, anchored to the document so they scroll away with the
 * page. Each one enters from just off the top edge or right edge of the *current*
 * viewport, drifts diagonally toward the bottom-left, fades out, then re-enters off
 * an edge again. Bubbles never appear inside the visible area — they only ever slide
 * in from the edges (so after load the screen fills in from the edges over ~20s).
 */

(function () {
  'use strict';

  var BUBBLE_COUNT = 24;   // how many bubbles are kept in flight around the viewport
  var RIGHT_EDGE_SHARE = 0.4; // fraction that enter from the right edge vs the top edge
  var MIN_SIZE = 8;
  var MAX_SIZE = 48;
  var MIN_DURATION = 22;
  var MAX_DURATION = 48;

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

  function randomize(bubble) {
    var size = rand(MIN_SIZE, MAX_SIZE);
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var scale = size / MAX_SIZE;

    // Enter from just OFF the top or right edge of the CURRENT viewport, in document
    // coordinates (so the bubble then scrolls with the page). Never inside the view.
    var startX, startY;
    if (Math.random() < RIGHT_EDGE_SHARE) {
      startX = vw + rand(0, size);              // off the right edge
      startY = scrollY + rand(-size, vh);       // somewhere down the visible band
    } else {
      startX = rand(-size, vw);                 // anywhere across the width
      startY = scrollY - rand(size, size + 20); // just above the visible top
    }

    // Diagonal drift toward the bottom-left; bigger bubbles travel farther.
    var dx = -rand(vw * (0.55 + scale * 0.25), vw * (0.85 + scale * 0.25));
    var dy = rand(vh * (0.45 + scale * 0.15), vh * (0.75 + scale * 0.15));

    var borderOpacity = rand(0.18, 0.30) * (0.6 + scale * 0.4);
    var fillOpacity = rand(0.04, 0.09) * (0.6 + scale * 0.4);

    bubble.style.setProperty('--bubble-size', size + 'px');
    bubble.style.setProperty('--bubble-start-x', startX + 'px');
    bubble.style.setProperty('--bubble-start-y', startY + 'px');
    bubble.style.setProperty('--bubble-dx', dx + 'px');
    bubble.style.setProperty('--bubble-dy', dy + 'px');
    bubble.style.setProperty('--bubble-duration', rand(MIN_DURATION, MAX_DURATION) + 's');
    bubble.style.setProperty('--bubble-border-opacity', borderOpacity.toFixed(3));
    bubble.style.setProperty('--bubble-fill-opacity', fillOpacity.toFixed(3));
  }

  function createBubble(container) {
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    randomize(bubble);

    // Positive stagger + the CSS 'backwards' fill keep each bubble invisible and
    // off-screen during its delay, so it only ever slides in from an edge — never
    // appearing mid-screen, even at load.
    bubble.style.setProperty('--bubble-delay', rand(0, MIN_DURATION).toFixed(2) + 's');

    // Every subsequent loop re-enters cleanly from an edge of the current viewport.
    bubble.addEventListener('animationiteration', function () {
      randomize(bubble);
      bubble.style.setProperty('--bubble-delay', '0s');
    });

    container.appendChild(bubble);
  }

  function init() {
    var container = document.getElementById('bubbles');
    if (!container) return;

    var sizeLayer = function () { container.style.height = docHeight() + 'px'; };
    sizeLayer();
    window.addEventListener('load', sizeLayer);     // height may grow once fonts/images load
    window.addEventListener('resize', sizeLayer);

    for (var i = 0; i < BUBBLE_COUNT; i++) createBubble(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
