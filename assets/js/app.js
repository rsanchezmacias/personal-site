/**
 * Main Application
 * Initializes the site and handles page load
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  function domReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // Initialize navigation
  let navigation;

  domReady(function() {
    // Remove preload class after page loads
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.body.classList.remove('is-preload');
      }, 100);
    });

    // Initialize navigation system
    if (typeof Navigation !== 'undefined') {
      navigation = new Navigation();
      window.siteNavigation = navigation;
    }

    // Prevent scroll restoration on hash change
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  });
})();
