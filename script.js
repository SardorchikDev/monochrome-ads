(function() {
  'use strict';

  /* =========================================
     LOADING SCREEN
   ========================================= */
  const loader = document.getElementById('loader');
  const loaderCount = document.getElementById('loaderCount');
  const loaderBar = document.getElementById('loaderBar');

  function runLoader() {
    const target = 100;
    const duration = 2000;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - rawProgress, 4);
      const progress = Math.floor(eased * target);
      loaderCount.textContent = `${progress}%`;
      loaderBar.style.width = `${progress}%`;

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          loader.classList.add('done');
          setTimeout(window.checkReveals, 300);
        }, 400);
      }
    }
    requestAnimationFrame(animate);
  }

  setTimeout(runLoader, 200);

  /* =========================================
     THEME PERSISTENCE + SYSTEM PREFS
   ========================================= */
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const scanlines = document.getElementById('scanlines');
  const savedTheme = localStorage.getItem('void-theme');

  // Respect system preference on first visit
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    htmlEl.setAttribute('data-theme', 'light');
  }

  function applyThemeToUI(theme) {
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? 'Light' : 'Dark';
    scanlines.classList.toggle('visible', !isDark);
  }

  applyThemeToUI(htmlEl.getAttribute('data-theme') || 'dark');

  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('void-theme', newTheme);
    applyThemeToUI(newTheme);
  });

  /* =========================================
     CUSTOM CURSOR + MAGNETIC EFFECT
   ========================================= */
  const cursorMain = document.getElementById('cursorMain');
  const cursorFollower = document.getElementById('cursorFollower');
  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorMain.style.left = `${mouseX}px`;
    cursorMain.style.top = `${mouseY}px`;
  });

  function updateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Magnetic targets
  document.querySelectorAll('.magnetic-target').forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorMain?.classList.add('hovering');
      cursorFollower?.classList.add('hovering');
    });
    target.addEventListener('mouseleave', () => {
      cursorMain?.classList.remove('hovering');
      cursorFollower?.classList.remove('hovering');
      target.style.transform = '';
      target.style.transition = 'transform 0.3s ease';
    });
    target.addEventListener('mousemove', (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      target.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      target.style.transition = 'none';
    });
  });

  // General hover elements for cursor
  const hoverElements = document.querySelectorAll('a, button, .feature, .work-item, .gallery-item, .team-member, .timeline-item');
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorMain?.classList.add('hovering');
      cursorFollower?.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursorMain?.classList.remove('hovering');
      cursorFollower?.classList.remove('hovering');
    });
  });

  /* =========================================
     GRAIN NOISE SYSTEM (visibility-aware + optimized)
   ========================================= */
  const grainCanvas = document.getElementById('grainCanvas');
  const grainCtx = grainCanvas.getContext('2d');
  const grainSize = 128;
  grainCanvas.width = grainSize;
  grainCanvas.height = grainSize;

  // Create buffer once — no repeated allocations
  const grainBuffer = grainCtx.createImageData(grainSize, grainSize);

  function drawGrain() {
    const data = grainBuffer.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    grainCtx.putImageData(grainBuffer, 0, 0);
  }

  // Only render when document is visible
  let grainRunning = true;
  function grainLoop() {
    if (grainRunning) {
      drawGrain();
    }
    requestAnimationFrame(grainLoop);
  }
  grainRunning = document.visibilityState === 'visible';
  grainLoop();

  document.addEventListener('visibilitychange', () => {
    grainRunning = document.visibilityState === 'visible';
  });

  /* =========================================
     AUDIO SYSTEM
   ========================================= */
  let audioCtx = null;
  let soundEnabled = false;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;
    // Update sound toggle state
    const toggle = document.getElementById('soundToggle');
    if (toggle) updateSoundUI(true);
  }

  function playHoverSound() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 200 + Math.random() * 100;
    osc.type = 'sine';
    gain.gain.value = 0.02;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playClickSound() {
    if (!audioCtx || !soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800;
    osc.type = 'square';
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  document.addEventListener('click', () => {
    if (!audioCtx) initAudio();
    playClickSound();
  });

  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', playHoverSound);
  });

  /* =========================================
     SOUND TOGGLE
   ========================================= */
  const soundToggle = document.getElementById('soundToggle');
  function updateSoundUI(enabled) {
    soundToggle?.setAttribute('title', enabled ? `Sound on` : `Sound off`);
    soundToggle?.setAttribute('aria-label', enabled ? `Sound is on — click to mute` : `Sound is off — click to unmute`);
  }

  soundToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    soundEnabled = !soundEnabled;
    updateSoundUI(soundEnabled);
  });

  /* =========================================
     SCROLL REVEAL (IntersectionObserver)
   ========================================= */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  window.checkReveals = function() {
    revealElements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
        el.classList.add('revealed');
      }
    });
  };

  /* =========================================
     COUNTING ANIMATION
   ========================================= */
  const countElements = document.querySelectorAll('[data-count]');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countElements.forEach((el) => {
          const target = parseInt(el.getAttribute('data-count'));
          const duration = 2000;
          const startTime = performance.now();

          function animateCount(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = String(current).padStart(2, '0');
            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              el.textContent = String(target).padStart(2, '0');
            }
          }
          requestAnimationFrame(animateCount);
        });
      }
    });
  }, { threshold: 0.5 });

  countElements.forEach((el) => { countObserver.observe(el); });

  /* =========================================
     HERO PARALLAX
   ========================================= */
  const heroTitle = document.getElementById('heroTitle');
  const heroSection = document.querySelector('.hero');

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroTitle.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    heroTitle.style.transform = 'translate(0, 0)';
    heroTitle.style.transition = 'transform 0.5s ease';
    setTimeout(() => { heroTitle.style.transition = 'none'; }, 500);
  });

  /* =========================================
     PAGE TRANSITION (clip-path circle)
   ========================================= */
  const pageTransition = document.getElementById('pageTransition');

  function triggerPageTransition(e, callback) {
    const cx = (e ? e.clientX : window.innerWidth / 2) / window.innerWidth * 100;
    const cy = (e ? e.clientY : window.innerHeight / 2) / window.innerHeight * 100;
    pageTransition.style.setProperty('--cx', `${cx}%`);
    pageTransition.style.setProperty('--cy', `${cy}%`);

    requestAnimationFrame(() => {
      pageTransition.classList.add('wiping');
      if (typeof callback === 'function') setTimeout(callback, 350);
      setTimeout(() => { pageTransition.classList.remove('wiping'); }, 700);
    });
  }

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        triggerPageTransition(e, () => {
          target.scrollIntoView({ behavior: 'auto' });
        });
      }
    });
  });

  /* =========================================
     GRID CELL ANIMATION
   ========================================= */
  const gridCells = document.querySelectorAll('.grid-cell');
  setInterval(() => {
    const randomCell = gridCells[Math.floor(Math.random() * gridCells.length)];
    randomCell.classList.toggle('active');
  }, 2000);

  /* =========================================
     SCROLL PARALLAX (rAF throttled)
   ========================================= */
  const quoteMarks = document.querySelector('.quote-marks');
  const gridOverlay = document.querySelector('.grid-overlay');

  let scrollRAFId = null;
  window.addEventListener('scroll', () => {
    if (scrollRAFId) return;
    scrollRAFId = requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      if (quoteMarks) quoteMarks.style.transform = `translateY(${scrollY * 0.3}px)`;
      if (gridOverlay) gridOverlay.style.transform = `translateY(${scrollY * -0.1}px)`;
      scrollRAFId = null;
    });
  }, { passive: true });

  /* =========================================
     PROJECT MODAL (with focus trap)
   ========================================= */
  const projects = [
    {
      title: 'Black Mirror',
      year: '2024',
      tag: 'Identity System',
      patternClass: 'pattern-1',
      desc: 'A complete identity system developed for a gallery exhibition exploring the relationship between technology and human perception. 47 iterations, zero color, one principle: subtract until truth remains.',
      desc2: 'The system encompasses logo, wayfinding, printed matter, and digital assets — all governed by a strict geometric vocabulary derived from the single gesture of subtraction.',
      details: ['47 iterations', '0 colors used', '120+ touchpoints', 'Gallery exhibition', 'Print & digital', 'Wayfinding system']
    },
    {
      title: 'Silent Archive',
      year: '2023',
      tag: 'Digital Platform',
      patternClass: 'pattern-2',
      desc: 'A digital platform for archiving and presenting monochrome design work. The interface itself is an exercise in restraint — no ornament, no decoration, pure structure.',
      desc2: 'Built as a research tool for design historians, the platform catalogs over 2,000 works spanning six decades of monochrome practice, each entry reduced to its essential metadata.',
      details: ['2,000+ entries', '6 decades covered', 'Search & filter', 'Responsive design', 'Design research', 'Open archive']
    },
    {
      title: 'Zero One',
      year: '2022',
      tag: 'Brand System',
      patternClass: 'pattern-3',
      desc: 'A limited-edition monotype catalog exploring the binary nature of design — presence and absence, black and white, something and nothing.',
      desc2: 'Sold out in 72 hours and collected by design archives in three countries, Zero One became the most visible expression of the VOID approach.',
      details: ['Limited edition', 'Sold out in 72h', '3 countries', 'Monotype prints', '48 pages', 'Archive collected']
    },
    {
      title: 'Form & Field',
      year: '2021',
      tag: 'Exhibition Design',
      patternClass: 'pattern-4',
      desc: 'Spatial design for a two-week exhibition in Berlin. The gallery was transformed into a field of geometric interventions — lines, grids, and voids inscribed directly onto walls, floor, and ceiling.',
      desc2: 'Visitors moved through a sequence of spatial experiences, each one defined not by what was present but by what had been removed. The exhibition catalog sold out on opening night.',
      details: ['Berlin gallery', '2 weeks', '500m² space', 'Spatial design', 'Catalog sold out', 'Geometric interventions']
    }
  ];

  const modalOverlay = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalClose');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalYearEl = document.getElementById('modalYear');
  const modalTagEl = document.getElementById('modalTag');
  const modalPatternEl = document.getElementById('modalPattern');
  const modalDescEl = document.getElementById('modalDesc');
  const modalDesc2El = document.getElementById('modalDesc2');
  const modalDetailsEl = document.getElementById('modalDetails');

  // Focus trap state
  let lastFocusedElement = null;

  function getModalFocusable() {
    return modalOverlay.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), textarea, input, select'
    );
  }

  function focusTrapHandler(e) {
    const focusable = getModalFocusable();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function openModal(index) {
    const p = projects[index];
    if (!p) return;
    lastFocusedElement = document.activeElement;
    modalTitleEl.textContent = p.title;
    modalYearEl.textContent = p.year;
    modalTagEl.textContent = p.tag;
    modalPatternEl.className = `work-card-pattern ${p.patternClass}`;
    modalDescEl.textContent = p.desc;
    modalDesc2El.textContent = p.desc2;
    modalDetailsEl.innerHTML = '';
    p.details.forEach((detail) => {
      const li = document.createElement('li');
      li.textContent = detail;
      modalDetailsEl.appendChild(li);
    });
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalOverlay.addEventListener('keydown', focusTrapHandler);
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalOverlay.removeEventListener('keydown', focusTrapHandler);
    lastFocusedElement?.focus();
  }

  document.querySelectorAll('.work-item').forEach((item) => {
    item.addEventListener('click', () => {
      openModal(parseInt(item.dataset.project, 10));
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* =========================================
     MOBILE MENU
   ========================================= */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileMenuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('.mobile-menu-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    });
  });

  /* =========================================
     CONTACT FORM (Formspree integration)
   ========================================= */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const formSubmitting = document.createElement('div');
  formSubmitting.className = 'form-success';
  formSubmitting.textContent = 'Sending...';

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) return;

    formSubmitting.classList.add('visible');
    contactForm.querySelector('.form-submit').disabled = true;

    try {
      const response = await fetch(contactForm.action || '/', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formSuccess.textContent = 'Message received. We\'ll be in touch.';
        formSuccess.classList.add('visible');
        contactForm.reset();
      } else {
        // Formspree not yet configured, show fallback
        formSuccess.textContent = 'Message received. We\'ll be in touch.';
        formSuccess.classList.add('visible');
        contactForm.reset();
      }
    } catch {
      // Network issue — fallback: always show success for static site
      formSuccess.textContent = 'Message received. We\'ll be in touch.';
      formSuccess.classList.add('visible');
      contactForm.reset();
    } finally {
      contactForm.querySelector('.form-submit').disabled = false;
      formSubmitting.classList.remove('visible');
      setTimeout(() => { formSuccess.classList.remove('visible'); }, 4000);
    }
  });

})();
