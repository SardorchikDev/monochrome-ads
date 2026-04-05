(function() {
  'use strict';

  /* =========================================
     LOADING SCREEN
   ========================================= */
  var loader = document.getElementById('loader');
  var loaderCount = document.getElementById('loaderCount');
  var loaderBar = document.getElementById('loaderBar');

  function runLoader() {
    var target = 100;
    var duration = 2000;
    var startTime = performance.now();

    function animate(now) {
      var elapsed = now - startTime;
      var rawProgress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - rawProgress, 4);
      var progress = Math.floor(eased * target);
      loaderCount.textContent = progress + '%';
      loaderBar.style.width = progress + '%';

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(function() {
          loader.classList.add('done');
          setTimeout(checkReveals, 300);
        }, 400);
      }
    }
    requestAnimationFrame(animate);
  }

  setTimeout(runLoader, 200);

  /* =========================================
     THEME PERSISTENCE (localStorage)
   ========================================= */
  var htmlEl = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var scanlines = document.getElementById('scanlines');

  var savedTheme = localStorage.getItem('void-theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
      themeToggle.textContent = 'Dark';
      scanlines.classList.add('visible');
    } else {
      themeToggle.textContent = 'Light';
    }
  }

  themeToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    initAudio();
    var isDark = htmlEl.getAttribute('data-theme') === 'dark';
    var newTheme = isDark ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Light' : 'Dark';
    scanlines.classList.toggle('visible', !isDark);
    localStorage.setItem('void-theme', newTheme);
  });

  /* =========================================
     CUSTOM CURSOR + MAGNETIC EFFECT
   ========================================= */
  var cursorMain = document.getElementById('cursorMain');
  var cursorFollower = document.getElementById('cursorFollower');
  var mouseX = -100, mouseY = -100;
  var followerX = -100, followerY = -100;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorMain.style.left = mouseX + 'px';
    cursorMain.style.top = mouseY + 'px';
  });

  function updateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Magnetic targets
  var magneticTargets = document.querySelectorAll('.magnetic-target');
  magneticTargets.forEach(function(target) {
    target.addEventListener('mouseenter', function() {
      cursorMain.classList.add('hovering');
      cursorFollower.classList.add('hovering');
    });
    target.addEventListener('mouseleave', function() {
      cursorMain.classList.remove('hovering');
      cursorFollower.classList.remove('hovering');
      target.style.transform = '';
      target.style.transition = 'transform 0.3s ease';
    });
    target.addEventListener('mousemove', function(e) {
      var rect = target.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      target.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      target.style.transition = 'none';
    });
  });

  // General hover elements for cursor
  var hoverElements = document.querySelectorAll('a, button, .feature, .work-item, .gallery-item, .team-member, .timeline-item');
  hoverElements.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      cursorMain.classList.add('hovering');
      cursorFollower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', function() {
      cursorMain.classList.remove('hovering');
      cursorFollower.classList.remove('hovering');
    });
  });

  /* =========================================
     GRAIN NOISE SYSTEM (optimized)
   ========================================= */
  var grainCanvas = document.getElementById('grainCanvas');
  var grainCtx = grainCanvas.getContext('2d');
  var grainSize = 128;
  grainCanvas.width = grainSize;
  grainCanvas.height = grainSize;

  var grainFrame = 0;
  function drawGrain() {
    grainFrame++;
    if (grainFrame % 2 === 0) {
      var imageData = grainCtx.createImageData(grainSize, grainSize);
      var data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        var v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      grainCtx.putImageData(imageData, 0, 0);
    }
    requestAnimationFrame(drawGrain);
  }
  drawGrain();

  /* =========================================
     AUDIO SYSTEM
   ========================================= */
  var audioCtx = null;
  var soundEnabled = false;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;
  }

  function playHoverSound() {
    if (!audioCtx || !soundEnabled) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
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
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800;
    osc.type = 'square';
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  document.addEventListener('click', function() {
    if (!audioCtx) { initAudio(); }
    playClickSound();
  });

  hoverElements.forEach(function(el) {
    el.addEventListener('mouseenter', playHoverSound);
  });

  /* =========================================
     SCROLL REVEAL (IntersectionObserver)
   ========================================= */
  var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(function(el) {
    revealObserver.observe(el);
  });

  // Expose for loader to trigger initial check
  window.checkReveals = function() {
    revealElements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add('revealed');
      }
    });
  };

  /* =========================================
     COUNTING ANIMATION
   ========================================= */
  var countElements = document.querySelectorAll('[data-count]');
  var counted = false;

  var countObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countElements.forEach(function(el) {
          var target = parseInt(el.getAttribute('data-count'));
          var duration = 2000;
          var startTime = performance.now();

          function animateCount(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
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

  countElements.forEach(function(el) { countObserver.observe(el); });

  /* =========================================
     HERO PARALLAX
   ========================================= */
  var heroTitle = document.getElementById('heroTitle');
  var heroSection = document.querySelector('.hero');

  heroSection.addEventListener('mousemove', function(e) {
    var rect = heroSection.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    heroTitle.style.transform = 'translate(' + (x * -8) + 'px, ' + (y * -8) + 'px)';
  });

  heroSection.addEventListener('mouseleave', function() {
    heroTitle.style.transform = 'translate(0, 0)';
    heroTitle.style.transition = 'transform 0.5s ease';
    setTimeout(function() {
      heroTitle.style.transition = 'none';
    }, 500);
  });

  /* =========================================
     PAGE TRANSITION (clip-path circle)
   ========================================= */
  var pageTransition = document.getElementById('pageTransition');

  function triggerPageTransition(e, callback) {
    var cx = (e ? e.clientX : window.innerWidth / 2) / window.innerWidth * 100;
    var cy = (e ? e.clientY : window.innerHeight / 2) / window.innerHeight * 100;
    pageTransition.style.setProperty('--cx', cx + '%');
    pageTransition.style.setProperty('--cy', cy + '%');

    requestAnimationFrame(function() {
      pageTransition.classList.add('wiping');
      if (typeof callback === 'function') {
        setTimeout(callback, 350);
      }
      setTimeout(function() {
        pageTransition.classList.remove('wiping');
      }, 700);
    });
  }

  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        triggerPageTransition(e, function() {
          target.scrollIntoView({ behavior: 'auto' });
        });
      }
    });
  });

  /* =========================================
     GRID CELL ANIMATION
   ========================================= */
  var gridCells = document.querySelectorAll('.grid-cell');
  setInterval(function() {
    var randomCell = gridCells[Math.floor(Math.random() * gridCells.length)];
    randomCell.classList.toggle('active');
  }, 2000);

  /* =========================================
     SCROLL PARALLAX
   ========================================= */
  var quoteMarks = document.querySelector('.quote-marks');
  var gridOverlay = document.querySelector('.grid-overlay');

  window.addEventListener('scroll', function() {
    var scrollY = window.pageYOffset;
    if (quoteMarks) {
      quoteMarks.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
    }
    if (gridOverlay) {
      gridOverlay.style.transform = 'translateY(' + (scrollY * -0.1) + 'px)';
    }
  });

  /* =========================================
     PROJECT MODAL
   ========================================= */
  var projects = [
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

  var modalOverlay = document.getElementById('projectModal');
  var modalCloseBtn = document.getElementById('modalClose');
  var modalTitleEl = document.getElementById('modalTitle');
  var modalYearEl = document.getElementById('modalYear');
  var modalTagEl = document.getElementById('modalTag');
  var modalPatternEl = document.getElementById('modalPattern');
  var modalDescEl = document.getElementById('modalDesc');
  var modalDesc2El = document.getElementById('modalDesc2');
  var modalDetailsEl = document.getElementById('modalDetails');

  function openModal(index) {
    var p = projects[index];
    if (!p) return;
    modalTitleEl.textContent = p.title;
    modalYearEl.textContent = p.year;
    modalTagEl.textContent = p.tag;
    modalPatternEl.className = 'work-card-pattern ' + p.patternClass;
    modalDescEl.textContent = p.desc;
    modalDesc2El.textContent = p.desc2;
    modalDetailsEl.innerHTML = '';
    p.details.forEach(function(d) {
      var li = document.createElement('li');
      li.textContent = d;
      modalDetailsEl.appendChild(li);
    });
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.work-item').forEach(function(item) {
    item.addEventListener('click', function() {
      openModal(parseInt(item.dataset.project));
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  /* =========================================
     CONTACT FORM
   ========================================= */
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('contactName').value;
    var email = document.getElementById('contactEmail').value;
    var message = document.getElementById('contactMessage').value;

    if (!name || !email || !message) return;

    formSuccess.classList.add('visible');
    contactForm.reset();

    setTimeout(function() {
      formSuccess.classList.remove('visible');
    }, 4000);
  });

})();
