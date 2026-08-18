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

      if (typeof gsap !== 'undefined') {
        gsap.from(target, { rotateY: -60, perspective: 1000, duration: 0.6, ease: 'power2.out' });
      }

      if (sectionName === 'about' && typeof gsap !== 'undefined') {
        var skillCards = target.querySelectorAll('.skill-card');
        gsap.from(skillCards, { rotateY: -80, perspective: 600, stagger: 0.08, duration: 0.5, ease: 'back.out(1.4)' });
      }

      if (sectionName === 'work' && typeof gsap !== 'undefined') {
        bindCardFan(viewport);
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
    createWaterParticles(clone);

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
    createWaterParticles(firstViewport);

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

  // ── P3R Card Fan System ─────────────────────

  function bindCardFan(viewport) {
    var fan = viewport.querySelector('.card-fan');
    if (!fan || fan._bound) return;
    fan._bound = true;

    var slots = fan.querySelectorAll('.card-slot');
    var total = slots.length;
    var floatTweens = [];
    var isReturning = false;
    var resumeTimer = null;
    var idleTimer = null;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function startFloating() {
      floatTweens = [];
      slots.forEach(function (slot) {
        var card = slot.querySelector('.p3r-card');
        if (!card || card.classList.contains('card-delta') || card.classList.contains('is-flipped')) return;

        var dx = rand(-15, 15);
        var dy = rand(-10, 10);
        var dz = rand(-12, 12);
        var rx = rand(-3, 3);
        var ry = rand(-5, 5);
        var dur = rand(3, 5.5);

        var t = gsap.to(card, {
          x: '+=' + dx,
          y: '+=' + dy,
          z: '+=' + dz,
          rotateX: '+=' + rx,
          rotateY: '+=' + ry,
          duration: dur,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
        card._floatTween = t;
        floatTweens.push(t);
      });
      startIdleLoop();
    }

    function restartFloatForSlot(slot) {
      var card = slot.querySelector('.p3r-card');
      if (!card || card.classList.contains('card-delta') || card.classList.contains('is-flipped') || card.classList.contains('is-hovered')) return;

      var dx = rand(-15, 15);
      var dy = rand(-10, 10);
      var dz = rand(-12, 12);
      var rx = rand(-3, 3);
      var ry = rand(-5, 5);
      var dur = rand(3, 5.5);

      var t = gsap.to(card, {
        x: '+=' + dx,
        y: '+=' + dy,
        z: '+=' + dz,
        rotateX: '+=' + rx,
        rotateY: '+=' + ry,
        duration: dur,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      card._floatTween = t;
      floatTweens.push(t);
    }

    function killAllFloats() {
      floatTweens.forEach(function (t) { t.kill(); });
      floatTweens = [];
      slots.forEach(function (slot) {
        var card = slot.querySelector('.p3r-card');
        if (card) card._floatTween = null;
      });
    }

    function startIdleLoop() {
      stopIdleLoop();
      idleTimer = setInterval(function () {
        var candidates = [];
        slots.forEach(function (slot) {
          var card = slot.querySelector('.p3r-card');
          if (card && !card.classList.contains('card-delta') &&
              !card.classList.contains('is-flipped') &&
              !card.classList.contains('is-hovered') &&
              !card.classList.contains('is-idle-flipping')) {
            candidates.push({ slot: slot, card: card });
          }
        });
        if (candidates.length === 0) return;

        var pick = candidates[Math.floor(Math.random() * candidates.length)];
        var card = pick.card;
        var slot = pick.slot;

        if (card._floatTween) {
          card._floatTween.kill();
          card._floatTween = null;
        }

        card.classList.add('is-idle-flipping');
        slot.style.zIndex = 80;

        gsap.set(card, { x: 0, y: 0, z: 0, rotateX: 0 });

        card._idleFlipTween = gsap.to(card, {
          rotateY: '+=360',
          translateZ: 30,
          scale: 1.06,
          duration: 1.5,
          ease: 'power2.inOut',
          onComplete: function () {
            card._idleFlipTween = null;
            card.classList.remove('is-idle-flipping');
            var idx = Array.prototype.indexOf.call(slots, slot);
            slot.style.zIndex = idx + 1;
            gsap.to(card, {
              rotateY: 0,
              translateZ: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: function () {
                restartFloatForSlot(slot);
              }
            });
          }
        });
      }, rand(3000, 5000));
    }

    function stopIdleLoop() {
      clearInterval(idleTimer);
      idleTimer = null;
      slots.forEach(function (slot) {
        var card = slot.querySelector('.p3r-card');
        if (card && card._idleFlipTween) {
          card._idleFlipTween.kill();
          card._idleFlipTween = null;
          card.classList.remove('is-idle-flipping');
        }
      });
    }

    function returnToFan() {
      if (isReturning) return;
      isReturning = true;
      killAllFloats();
      stopIdleLoop();
      clearTimeout(resumeTimer);

      slots.forEach(function (slot, i) {
        var card = slot.querySelector('.p3r-card');
        if (!card) return;
        card.classList.remove('is-hovered');
        card.classList.remove('is-flipped');
        card.classList.remove('is-idle-flipping');
        slot.style.zIndex = i + 1;
        gsap.killTweensOf(card);
        gsap.to(card, {
          x: 0, y: 0, z: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          opacity: 1,
          translateZ: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(0,188,212,0.08)',
          duration: 0.6,
          ease: 'back.out(1.3)',
          delay: i * 0.05
        });
      });

      resumeTimer = setTimeout(function () {
        isReturning = false;
        startFloating();
      }, 1500);
    }

    slots.forEach(function (slot, i) {
      slot.style.zIndex = i + 1;

      var card = slot.querySelector('.p3r-card');
      if (!card) return;

      slot.addEventListener('mouseenter', function () {
        if (card.classList.contains('is-flipped') || isReturning) return;

        if (card._idleFlipTween) {
          card._idleFlipTween.kill();
          card._idleFlipTween = null;
          card.classList.remove('is-idle-flipping');
        }
        if (card._floatTween) {
          card._floatTween.kill();
          card._floatTween = null;
        }
        gsap.killTweensOf(card);

        card.classList.add('is-hovered');
        gsap.set(card, { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0 });
        gsap.to(card, {
          translateZ: 60,
          scale: 1.05,
          boxShadow: '0 24px 60px rgba(0,188,212,0.35), 0 0 30px rgba(0,188,212,0.15)',
          duration: 0.4,
          ease: 'back.out(2)'
        });
        slot.style.zIndex = 100;
        slots.forEach(function (other, j) {
          if (other === slot) return;
          var dist = Math.abs(i - j);
          gsap.to(other, {
            translateZ: -10 * dist,
            scale: 0.96,
            opacity: 0.65,
            duration: 0.35
          });
        });
      });

      slot.addEventListener('mouseleave', function () {
        if (card.classList.contains('is-flipped') || isReturning) return;
        card.classList.remove('is-hovered');
        gsap.to(card, {
          x: 0, y: 0, z: 0,
          rotateX: 0,
          rotateY: 0,
          translateZ: 0,
          scale: 1,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(0,188,212,0.08)',
          duration: 0.45,
          ease: 'power2.out'
        });
        slot.style.zIndex = i + 1;
        slots.forEach(function (other) {
          gsap.to(other, {
            translateZ: 0,
            scale: 1,
            opacity: 1,
            duration: 0.4
          });
        });
      });

      slot.addEventListener('click', function (e) {
        if (card.classList.contains('card-delta') || isReturning) return;

        if (card._idleFlipTween) {
          card._idleFlipTween.kill();
          card._idleFlipTween = null;
          card.classList.remove('is-idle-flipping');
        }

        var isFlipped = card.classList.contains('is-flipped');

        if (!isFlipped) {
          e.preventDefault();
          e.stopPropagation();

          if (card._floatTween) {
            card._floatTween.kill();
            card._floatTween = null;
          }
          gsap.killTweensOf(card);

          card.classList.add('is-flipped');
          card.classList.remove('is-hovered');
          slot.style.zIndex = 200;

          gsap.set(card, { x: 0, y: 0, z: 0, rotateX: 0, scale: 1 });
          gsap.to(card, {
            rotateY: 180,
            translateZ: 80,
            scale: 1.12,
            duration: 0.6,
            ease: 'back.out(1.4)'
          });

          slots.forEach(function (other) {
            if (other !== slot) {
              gsap.to(other, { opacity: 0.15, translateZ: -30, duration: 0.3 });
            }
          });
        } else {
          var link = slot.querySelector('.card-link');
          if (link) link.click();
        }
      });
    });

    viewport.addEventListener('click', function (e) {
      if (e.target.closest('.card-slot')) return;
      returnToFan();
    });

    gsap.from(slots, {
      opacity: 0,
      y: 40,
      scale: 0.85,
      stagger: 0.07,
      duration: 0.6,
      ease: 'back.out(1.3)',
      onStart: function () {
        slots.forEach(function (slot, i) {
          slot.style.zIndex = i + 1;
        });
      },
      onComplete: function () {
        startFloating();
      }
    });
  }

  // ── Water Particles ──────────────────────────

  function createWaterParticles(viewport) {
    var mainContent = viewport.querySelector('.main-content');
    if (!mainContent || mainContent._particlesBound) return;
    mainContent._particlesBound = true;

    var particleContainer = document.createElement('div');
    particleContainer.className = 'water-particles';
    particleContainer.setAttribute('aria-hidden', 'true');
    particleContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;';
    mainContent.appendChild(particleContainer);

    setInterval(function () {
      if (!document.body.contains(particleContainer)) return;
      var p = document.createElement('div');
      var size = 2 + Math.random() * 3;
      var startX = Math.random() * 100;
      p.style.cssText =
        'position:absolute;bottom:-10px;left:' + startX + '%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'background:rgba(0,188,212,0.3);border-radius:50%;' +
        'animation:particleRise ' + (4 + Math.random() * 6) + 's linear forwards;';
      particleContainer.appendChild(p);
      setTimeout(function () { p.remove(); }, 10000);
    }, 800);
  }

  // ── Water Cursor Trail ─────────────────────

  var lastTrailTime = 0;
  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastTrailTime < 50) return;
    lastTrailTime = now;
    if (Math.random() > 0.7) return;

    var trail = document.createElement('div');
    trail.style.cssText =
      'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
      'width:4px;height:4px;border-radius:50%;pointer-events:none;z-index:9999;' +
      'background:rgba(0,188,212,0.4);';
    document.body.appendChild(trail);

    if (typeof gsap !== 'undefined') {
      gsap.to(trail, { y: -40, scale: 3, opacity: 0, duration: 1.5, ease: 'power2.out', onComplete: function () { trail.remove(); } });
    } else {
      setTimeout(function () { trail.remove(); }, 1600);
    }
  });

})();
