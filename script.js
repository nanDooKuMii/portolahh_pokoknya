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

  // ── Helpers ────────────────────────────────

  function showToast(msg) {
    tabToast.textContent = msg;
    tabToast.classList.add('show');
    setTimeout(function () {
      tabToast.classList.remove('show');
    }, 2500);
  }

  // Show a section inside a specific viewport
  function showSectionInViewport(viewport, sectionName) {
    var secs = viewport.querySelectorAll('.section');
    var navLinks = viewport.querySelectorAll('.nav-list a');

    secs.forEach(function (s) { s.classList.remove('active'); });
    navLinks.forEach(function (l) { l.classList.remove('active'); });

    var target = viewport.querySelector('#' + sectionName);
    if (target) {
      target.classList.add('active');
      viewport.querySelector('.main-content').scrollTop = 0;
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

  // Bind nav clicks inside a viewport
  function bindViewportNav(viewport) {
    var navLinks = viewport.querySelectorAll('.nav-list a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showSectionInViewport(viewport, this.getAttribute('data-section'));
      });
    });

    var portfolioBtn = viewport.querySelector('.btn-outline');
    if (portfolioBtn) {
      portfolioBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showSectionInViewport(viewport, this.getAttribute('data-nav'));
      });
    }
  }

  // Bind form submit inside a viewport
  function bindViewportForm(viewport) {
    var form = viewport.querySelector('.contact-form');
    var success = viewport.querySelector('.form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-submit');
      btn.textContent = 'Sending...';
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
        btn.textContent = 'Submit';
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

    // Clone the first viewport as template
    var template = container.querySelector('.browser-viewport');
    var clone = template.cloneNode(true);
    clone.dataset.tabId = tabIdCounter;
    clone.classList.add('active');

    // Reset clone to home section
    var secs = clone.querySelectorAll('.section');
    secs.forEach(function (s) { s.classList.remove('active'); });
    var homeSec = clone.querySelector('#home');
    if (homeSec) homeSec.classList.add('active');
    clone.dataset.activeSection = 'home';

    // Reset nav active state
    var navLinks = clone.querySelectorAll('.nav-list a');
    navLinks.forEach(function (l) {
      l.classList.remove('active');
      if (l.getAttribute('data-section') === 'home') l.classList.add('active');
    });

    // Reset form if present
    var form = clone.querySelector('.contact-form');
    var success = clone.querySelector('.form-success');
    if (form) {
      form.style.display = '';
      form.reset();
    }
    if (success) success.classList.remove('visible');

    container.appendChild(clone);

    // Create tab button
    var tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.tabId = tabIdCounter;
    tab.innerHTML =
      '<div class="tab-favicon"></div>' +
      '<span class="tab-title">nanDooEruu — Portfolio</span>' +
      '<span class="tab-close">&times;</span>';

    tabBar.insertBefore(tab, newTabBtn);

    // Switch to new tab
    var prevActive = getActiveTab();
    if (prevActive) prevActive.classList.remove('active');
    var prevVP = getActiveViewport();
    if (prevVP) prevVP.classList.remove('active');

    tab.classList.add('active');
    clone.classList.add('active');

    if (addressInput) addressInput.value = routes.home;

    // Bind events on cloned viewport
    bindViewportNav(clone);
    bindViewportForm(clone);

    // Tab click
    tab.querySelector('.tab-title').addEventListener('click', function () {
      activateTab(tab);
    });

    // Close click
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

    // Determine next tab to activate
    var next = tab.nextElementSibling;
    if (!next || next.classList.contains('new-tab-btn')) {
      next = tab.previousElementSibling;
    }

    // Remove viewport
    var vp = container.querySelector('[data-tab-id="' + tabId + '"]');
    if (vp) vp.remove();

    // Remove tab
    tab.remove();

    // Activate next if needed
    if (wasActive && next && next.classList.contains('tab')) {
      activateTab(next);
    }
  }

  // ── Init first tab ─────────────────────────

  var firstViewport = container.querySelector('.browser-viewport');
  if (firstViewport) {
    firstViewport.dataset.tabId = '1';
    firstViewport.dataset.activeSection = 'home';
    firstViewport.classList.add('active');
    bindViewportNav(firstViewport);
    bindViewportForm(firstViewport);
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

  // ── Bookmark heart toggle ──────────────────

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

})();
