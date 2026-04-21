/**
 * Bubbles
 * Generates subtle floating bubbles that drift from top-right toward bottom-left.
 */

(function () {
  'use strict';

  var BUBBLE_COUNT = 18;
  var MIN_SIZE = 8;
  var MAX_SIZE = 48;
  var MIN_DURATION = 22;
  var MAX_DURATION = 48;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomize(bubble) {
    var size = rand(MIN_SIZE, MAX_SIZE);
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Spawn off-screen: either above the top edge (right half) or off the right edge (top half)
    var scale = size / MAX_SIZE;
    var spawnOnRight = Math.random() < 0.4;
    var startX, startY;
    if (spawnOnRight) {
      startX = vw + rand(0, size);
      startY = rand(-size, vh * 0.40);
    } else {
      startX = rand(vw * 0.40, vw + size);
      startY = -rand(size, size + 20);
    }

    // Travel left and down; bigger bubbles travel farther
    var dx = -rand(vw * (0.55 + scale * 0.25), vw * (0.85 + scale * 0.25));
    var dy = rand(vh * (0.45 + scale * 0.15), vh * (0.75 + scale * 0.15));

    // Opacity — slightly more visible than before
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

  function createBubble(container, delayOverride) {
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    randomize(bubble);

    if (delayOverride !== undefined) {
      bubble.style.setProperty('--bubble-delay', delayOverride + 's');
    } else {
      bubble.style.setProperty('--bubble-delay', '0s');
    }

    bubble.addEventListener('animationiteration', function () {
      randomize(bubble);
      bubble.style.setProperty('--bubble-delay', '0s');
    });

    container.appendChild(bubble);
  }

  function init() {
    var container = document.getElementById('bubbles');
    if (!container) return;

    // Stagger with positive delays so every bubble starts off-screen and enters naturally
    for (var i = 0; i < BUBBLE_COUNT; i++) {
      var staggerDelay = rand(0, MIN_DURATION);
      createBubble(container, staggerDelay);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
