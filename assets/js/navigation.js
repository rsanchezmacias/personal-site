/**
 * Navigation System
 * Handles modal-based navigation with hash routing
 */

class Navigation {
  constructor() {
    this.wrapper = document.getElementById('wrapper');
    this.header = document.getElementById('header');
    this.footer = document.getElementById('footer');
    this.main = document.getElementById('main');
    this.articles = Array.from(this.main.querySelectorAll('article'));
    this.body = document.body;
    this.locked = false;
    this.delay = 325; // Animation delay in ms

    this.init();
  }

  init() {
    // Add close buttons to articles
    this.articles.forEach(article => {
      this.addCloseButton(article);
      this.preventBubble(article);
    });

    // Handle clicks outside articles
    this.body.addEventListener('click', (e) => {
      if (this.body.classList.contains('is-article-visible')) {
        // Only hide if clicking on the wrapper (not inside an article)
        if (e.target === this.wrapper || e.target === this.main) {
          this.hide(true);
        }
      }
    });

    // Handle keyboard navigation
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && this.body.classList.contains('is-article-visible')) {
        this.hide(true);
      }
    });

    // Handle hash changes
    window.addEventListener('hashchange', (e) => {
      this.handleHashChange();
    });

    // Handle initial hash
    if (window.location.hash && window.location.hash !== '#') {
      window.addEventListener('load', () => {
        this.show(window.location.hash.substring(1), true);
      });
    }

    // Hide main initially
    this.main.style.display = 'none';
    this.articles.forEach(article => {
      article.style.display = 'none';
    });

    // Handle navigation middle item
    this.handleNavMiddleItem();
  }

  addCloseButton(article) {
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close';
    closeBtn.textContent = 'Close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => {
      window.location.hash = '';
    });
    article.appendChild(closeBtn);
  }

  preventBubble(article) {
    article.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  handleNavMiddleItem() {
    const nav = this.header.querySelector('nav');
    const navItems = nav.querySelectorAll('li');
    
    if (navItems.length % 2 === 0) {
      nav.classList.add('use-middle');
      const middleIndex = navItems.length / 2;
      navItems[middleIndex].classList.add('is-middle');
    }
  }

  handleHashChange() {
    const hash = window.location.hash;

    if (!hash || hash === '#') {
      this.hide();
      return;
    }

    const articleId = hash.substring(1);
    const article = this.articles.find(a => a.id === articleId);

    if (article) {
      this.show(articleId);
    }
  }

  show(id, initial = false) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return;

    // Handle lock - if locked or initial, skip delays
    if (this.locked || initial) {
      this.body.classList.add('is-switching');
      this.body.classList.add('is-article-visible');
      this.articles.forEach(a => a.classList.remove('active'));
      this.header.style.display = 'none';
      this.footer.style.display = 'none';
      this.main.style.display = 'flex';
      article.style.display = 'block';
      article.classList.add('active');
      this.locked = false;

      setTimeout(() => {
        this.body.classList.remove('is-switching');
      }, initial ? 1000 : 0);

      // Scroll to top
      window.scrollTo(0, 0);
      return;
    }

    // Lock
    this.locked = true;

    // If article already visible, just swap
    if (this.body.classList.contains('is-article-visible')) {
      const currentArticle = this.articles.find(a => a.classList.contains('active'));
      if (currentArticle) {
        currentArticle.classList.remove('active');
      }

      setTimeout(() => {
        if (currentArticle) {
          currentArticle.style.display = 'none';
        }
        article.style.display = 'block';

        setTimeout(() => {
          article.classList.add('active');
          window.scrollTo(0, 0);
          this.locked = false;
        }, 25);
      }, this.delay);
    } else {
      // Show article for first time
      this.body.classList.add('is-article-visible');

      setTimeout(() => {
        this.header.style.display = 'none';
        this.footer.style.display = 'none';
        this.main.style.display = 'flex';
        article.style.display = 'block';

        setTimeout(() => {
          article.classList.add('active');
          window.scrollTo(0, 0);
          this.locked = false;
        }, 25);
      }, this.delay);
    }
  }

  hide(addState = false) {
    if (!this.body.classList.contains('is-article-visible')) {
      return;
    }

    const activeArticle = this.articles.find(a => a.classList.contains('active'));
    if (!activeArticle) return;

    // Add state if requested
    if (addState) {
      history.pushState(null, null, '#');
    }

    // Handle lock
    if (this.locked) {
      this.body.classList.add('is-switching');
      activeArticle.classList.remove('active');
      activeArticle.style.display = 'none';
      this.main.style.display = 'none';
      this.footer.style.removeProperty('display');
      this.header.style.removeProperty('display');
      this.body.classList.remove('is-article-visible');
      this.locked = false;
      this.body.classList.remove('is-switching');
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('resize'));
      return;
    }

    // Lock
    this.locked = true;

    activeArticle.classList.remove('active');

    setTimeout(() => {
      activeArticle.style.display = 'none';
      this.main.style.display = 'none';
      this.footer.style.removeProperty('display');
      this.header.style.removeProperty('display');

      setTimeout(() => {
        this.body.classList.remove('is-article-visible');
        window.scrollTo(0, 0);
        this.locked = false;
        window.dispatchEvent(new Event('resize'));
      }, 25);
    }, this.delay);
  }
}

// Make Navigation available globally
window.Navigation = Navigation;
