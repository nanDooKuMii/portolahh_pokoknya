(function () {

  var routes = {
    home:    'https://nanDooEruu.design/portfolio',
    about:   'https://nanDooEruu.design/portfolio/about',
    work:    'https://nanDooEruu.design/portfolio/work',
    contact: 'https://nanDooEruu.design/portfolio/contact'
  };

  var tabBar      = document.querySelector('.tab-bar');
  var newTabBtn   = document.querySelector('.new-tab-btn');
  var tabToast    = document.getElementById('tabToast');
  var container   = document.querySelector('.viewport-container');
  var addressInput = document.querySelector('.address-input');
  var MAX_TABS    = 5;
  var tabIdCounter = 1;

  // ── Rotating Text config ───────────────────

  var rotatingWords = ['trainer', 'student', 'tomic'];
  var SWAP_MS = 3500;
  var ANIM_MS = 500;

  // ── Helpers ────────────────────────────────

  function showToast(msg) {
    tabToast.textContent = msg;
    tabToast.classList.add('show');
    setTimeout(function () {
      tabToast.classList.remove('show');
    }, 2500);
  }

  function showSectionInViewport(viewport, sectionName) {
    var secs = viewport.querySelectorAll('.section');
    var navLinks = viewport.querySelectorAll('.nav-list a');

    secs.forEach(function (s) { s.classList.remove('active'); });
    navLinks.forEach(function (l) { l.classList.remove('active'); });

    var target = viewport.querySelector('#' + sectionName);
    if (target) {
      target.classList.add('active');
      viewport.querySelector('.main-content').scrollTop = 0;

      // Staggered entry animation for skill cards
      if (sectionName === 'about') {
        var skillCards = target.querySelectorAll('.skill-card');
        skillCards.forEach(function (card, i) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(function () {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100 + i * 80);
        });
      }

      // Staggered entry animation for work cards
      if (sectionName === 'work') {
        var workCards = target.querySelectorAll('.work-card');
        workCards.forEach(function (card, i) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px) scale(0.96)';
          setTimeout(function () {
            card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 120 + i * 100);
        });
      }
    }

    navLinks.forEach(function (l) {
      if (l.getAttribute('data-section') === sectionName) {
        l.classList.add('active');
      }
    });

    viewport.dataset.activeSection = sectionName;
    if (addressInput && routes[sectionName]) {
      addressInput.value = routes[sectionName];
    }
  }

  function bindViewportNav(viewport) {
    var navLinks = viewport.querySelectorAll('.nav-list a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showSectionInViewport(viewport, this.getAttribute('data-section'));
      });
    });

    var portfolioBtn = viewport.querySelector('.btn-primary');
    if (portfolioBtn) {
      portfolioBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showSectionInViewport(viewport, this.getAttribute('data-nav'));
      });
    }
  }

  function bindViewportForm(viewport) {
    var form = viewport.querySelector('.contact-form');
    var success = viewport.querySelector('.form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-submit');
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          form.style.display = 'none';
          success.classList.add('visible');
        } else {
          throw new Error('Failed');
        }
      })
      .catch(function () {
        alert('Something went wrong. Please try again later.');
      })
      .finally(function () {
        btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
        btn.disabled = false;
      });
    });
  }

  // ── Tab Management ─────────────────────────

  function getActiveTab() {
    return tabBar.querySelector('.tab.active');
  }

  function getActiveViewport() {
    return container.querySelector('.browser-viewport.active');
  }

  function activateTab(tab) {
    var allTabs = tabBar.querySelectorAll('.tab');
    allTabs.forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');

    var allVPs = container.querySelectorAll('.browser-viewport');
    allVPs.forEach(function (vp) { vp.classList.remove('active'); });

    var vp = container.querySelector('[data-tab-id="' + tab.dataset.tabId + '"]');
    if (vp) {
      vp.classList.add('active');
      var section = vp.dataset.activeSection || 'home';
      if (addressInput && routes[section]) {
        addressInput.value = routes[section];
      }
    }
  }

  function createTab() {
    var tabs = tabBar.querySelectorAll('.tab');
    if (tabs.length >= MAX_TABS) {
      showToast('Maximum 5 tabs allowed');
      return;
    }

    tabIdCounter++;

    var template = container.querySelector('.browser-viewport');
    var clone = template.cloneNode(true);
    clone.dataset.tabId = tabIdCounter;
    clone.classList.add('active');

    var secs = clone.querySelectorAll('.section');
    secs.forEach(function (s) { s.classList.remove('active'); });
    var homeSec = clone.querySelector('#home');
    if (homeSec) homeSec.classList.add('active');
    clone.dataset.activeSection = 'home';

    var navLinks = clone.querySelectorAll('.nav-list a');
    navLinks.forEach(function (l) {
      l.classList.remove('active');
      if (l.getAttribute('data-section') === 'home') l.classList.add('active');
    });

    var form = clone.querySelector('.contact-form');
    var success = clone.querySelector('.form-success');
    if (form) {
      form.style.display = '';
      form.reset();
    }
    if (success) success.classList.remove('visible');

    // Reset transient classes on cloned rotating text
    var cloneRotating = clone.querySelector('.rotating-text');
    if (cloneRotating) {
      cloneRotating.classList.remove('anim-out', 'anim-in');
    }

    container.appendChild(clone);

    var tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.tabId = tabIdCounter;
    tab.innerHTML =
      '<div class="tab-favicon"></div>' +
      '<span class="tab-title">nanDooEruu — Portfolio</span>' +
      '<span class="tab-close">&times;</span>';

    tabBar.insertBefore(tab, newTabBtn);

    var prevActive = getActiveTab();
    if (prevActive) prevActive.classList.remove('active');
    var prevVP = getActiveViewport();
    if (prevVP) prevVP.classList.remove('active');

    tab.classList.add('active');
    clone.classList.add('active');

    if (addressInput) addressInput.value = routes.home;

    bindViewportNav(clone);
    bindViewportForm(clone);
    bindRotatingText(clone.querySelector('.rotating-text'));
    bindParallax(clone);
    bindTilt(clone);

    tab.querySelector('.tab-title').addEventListener('click', function () {
      activateTab(tab);
    });

    tab.querySelector('.tab-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closeTab(tab);
    });
  }

  function closeTab(tab) {
    var tabs = tabBar.querySelectorAll('.tab');
    if (tabs.length <= 1) {
      showToast('Cannot close the last tab');
      return;
    }

    var wasActive = tab.classList.contains('active');
    var tabId = tab.dataset.tabId;

    var next = tab.nextElementSibling;
    if (!next || next.classList.contains('new-tab-btn')) {
      next = tab.previousElementSibling;
    }

    var vp = container.querySelector('[data-tab-id="' + tabId + '"]');
    if (vp) {
      var vpRotating = vp.querySelector('.rotating-text');
      if (vpRotating && vpRotating._rotatingInterval) {
        clearInterval(vpRotating._rotatingInterval);
      }
      vp.remove();
    }
    tab.remove();

    if (wasActive && next && next.classList.contains('tab')) {
      activateTab(next);
    }
  }

  // ── Init ───────────────────────────────────

  var firstViewport = container.querySelector('.browser-viewport');
  if (firstViewport) {
    firstViewport.dataset.tabId = '1';
    firstViewport.dataset.activeSection = 'home';
    firstViewport.classList.add('active');
    bindViewportNav(firstViewport);
    bindViewportForm(firstViewport);
    bindRotatingText(firstViewport.querySelector('.rotating-text'));
    bindParallax(firstViewport);
    bindTilt(firstViewport);

    // Trigger staggered animation on first load
    setTimeout(function () {
      showSectionInViewport(firstViewport, 'home');
    }, 300);
  }

  var firstTab = tabBar.querySelector('.tab');
  if (firstTab) {
    firstTab.dataset.tabId = '1';
    firstTab.querySelector('.tab-title').addEventListener('click', function () {
      activateTab(firstTab);
    });
    firstTab.querySelector('.tab-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closeTab(firstTab);
    });
  }

  if (newTabBtn) {
    newTabBtn.addEventListener('click', createTab);
  }

  // ── Cursor-Following Dot Glow ──────────────

  var dotCursor = document.querySelector('.bg-dot-cursor');

  if (dotCursor) {
    document.addEventListener('mousemove', function (e) {
      dotCursor.style.setProperty('--mx', e.clientX + 'px');
      dotCursor.style.setProperty('--my', e.clientY + 'px');
    });
  }

  // ── Rotating Text (Home Headline) ─────────

  function bindRotatingText(el) {
    if (!el || el._rotatingBound) return;
    el._rotatingBound = true;

    var wordIndex = 0;

    el._rotatingInterval = setInterval(function () {
      if (!document.body.contains(el)) {
        clearInterval(el._rotatingInterval);
        return;
      }

      wordIndex = (wordIndex + 1) % rotatingWords.length;
      el.classList.add('anim-out');

      setTimeout(function () {
        if (!document.body.contains(el)) return;
        el.textContent = rotatingWords[wordIndex];
        el.classList.remove('anim-out');
        void el.offsetWidth;
        el.classList.add('anim-in');
        setTimeout(function () {
          el.classList.remove('anim-in');
        }, ANIM_MS);
      }, ANIM_MS);
    }, SWAP_MS);
  }

  // ── Bookmark Heart ─────────────────────────

  var bookmarkHeart = document.getElementById('bookmarkHeart');
  if (bookmarkHeart) {
    bookmarkHeart.addEventListener('click', function () {
      var isLiked = bookmarkHeart.classList.toggle('liked');
      bookmarkHeart.innerHTML = isLiked ? '&#9829;' : '&#9825;';
      bookmarkHeart.classList.remove('pop');
      void bookmarkHeart.offsetWidth;
      bookmarkHeart.classList.add('pop');
    });
  }

  // ── Parallax Mouse on Hero ─────────────────

  function bindParallax(viewport) {
    var heroImage = viewport.querySelector('.hero-image');
    var heroGlow = viewport.querySelector('.hero-glow');
    var mc = viewport.querySelector('.main-content');
    if (!mc || !heroImage) return;

    mc.addEventListener('mousemove', function (e) {
      var rect = mc.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      heroImage.style.transform = 'translate(' + (x * 12) + 'px, ' + (y * 12) + 'px)';
      if (heroGlow) {
        heroGlow.style.transform = 'translate(' + (x * -20) + 'px, ' + (y * -20) + 'px)';
      }
    });

    mc.addEventListener('mouseleave', function () {
      heroImage.style.transform = 'translate(0, 0)';
      if (heroGlow) {
        heroGlow.style.transform = 'translate(0, 0)';
      }
    });
  }

  // ── 3D Tilt on Work Cards ───────────────────

  function bindTilt(viewport) {
    var cards = viewport.querySelectorAll('.work-card:not(.card-delta)');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'translateY(-6px) perspective(700px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

})();
