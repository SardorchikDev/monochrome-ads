(function() {
  'use strict';

  /* =========================================
     CUSTOM CURSOR - SINGLE DOT
  ========================================= */
  const cursor = document.getElementById('cursor');
  let x = 0, y = 0;
  
  document.addEventListener('mousemove', e => {
    x = e.clientX;
    y = e.clientY;
    if (cursor) {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    }
  });

  // Hover effects
  const links = document.querySelectorAll('a, button, input, textarea');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (cursor) cursor.classList.add('hovering');
    });
    link.addEventListener('mouseleave', () => {
      if (cursor) cursor.classList.remove('hovering');
    });
  });

  /* =========================================
     LOADING
  ========================================= */
  const loader = document.getElementById('loader');
  const loaderCount = document.getElementById('loaderCount');
  const loaderBar = document.getElementById('loaderBar');

  function runLoader() {
    let progress = 0;
    const duration = 600;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      progress = Math.min((elapsed / duration) * 100, 100);
      loaderCount.textContent = Math.floor(progress) + '%';
      loaderBar.style.width = progress + '%';

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        loader.classList.add('done');
        checkReveals();
      }
    }
    requestAnimationFrame(animate);
  }
  setTimeout(runLoader, 50);

  /* =========================================
     SCROLL REVEAL
  ========================================= */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => obs.observe(el));

  window.checkReveals = function() {
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
    });
  };

  /* =========================================
     STATS COUNT
  ========================================= */
  const countEls = document.querySelectorAll('[data-count]');
  let counted = false;
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !counted) {
        counted = true;
        countEls.forEach(el => {
          const target = parseInt(el.dataset.count);
          let current = 0;
          const timer = setInterval(() => {
            current += 1;
            el.textContent = current < 10 ? '0' + current : current;
            if (current >= target) clearInterval(timer);
          }, 30);
        });
      }
    });
  }, { threshold: 0.5 });
  countEls.forEach(el => countObs.observe(el));

  /* =========================================
     SCROLL PROGRESS
  ========================================= */
  window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const prog = (scroll / docH) * 100;
    const bar = document.getElementById('scrollProgress');
    if (bar) bar.style.width = prog + '%';
  }, { passive: true });

  /* =========================================
     MODAL
  ========================================= */
  const projects = [
    { title: 'Black Mirror', year: '2024', tag: 'Identity', desc: 'Identity system for Black Mirror gallery.' },
    { title: 'Silent Archive', year: '2023', tag: 'Digital', desc: 'Digital archive platform.' },
    { title: 'Zero One', year: '2022', tag: 'Editorial', desc: 'Monotype catalog.' },
    { title: 'Form & Field', year: '2021', tag: 'Spatial', desc: 'Exhibition design.' }
  ];

  const modal = document.getElementById('projectModal');
  
  document.querySelectorAll('.work-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      if (!modal || !projects[i]) return;
      document.getElementById('modalTitle').textContent = projects[i].title;
      document.getElementById('modalYear').textContent = projects[i].year;
      document.getElementById('modalTag').textContent = projects[i].tag;
      document.getElementById('modalDesc').textContent = projects[i].desc;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('modalClose')?.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal?.classList.remove('active'); });

  /* =========================================
     MOBILE MENU
  ========================================= */
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  menuBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  });

  mobileMenu?.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* =========================================
     CONTACT FORM
  ========================================= */
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try { await fetch(form.action, { method: 'POST', body: new FormData(form) }); } catch {}
    form.reset();
    document.getElementById('formSuccess').classList.add('visible');
    btn.textContent = 'Send';
    btn.disabled = false;
    setTimeout(() => document.getElementById('formSuccess').classList.remove('visible'), 3000);
  });

  /* =========================================
     KINETIC TITLE
  ========================================= */
  const kineticTitle = document.querySelector('.kinetic-title');
  if (kineticTitle) {
    const text = kineticTitle.textContent.trim();
    kineticTitle.innerHTML = '';
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'kinetic-letter';
      if (char === ' ') span.innerHTML = '&nbsp;';
      else span.textContent = char;
      kineticTitle.appendChild(span);
    });

    kineticTitle.addEventListener('mousemove', e => {
      const { left, top, width, height } = kineticTitle.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      kineticTitle.querySelectorAll('.kinetic-letter').forEach(letter => {
        const dx = (letter.offsetLeft + letter.offsetWidth / 2) - x;
        const dy = (letter.offsetTop + letter.offsetHeight / 2) - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - dist / (width / 2)) * 20;
        
        const angle = Math.atan2(dy, dx);
        const tx = Math.cos(angle) * force;
        const ty = Math.sin(angle) * force;
        
        letter.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    });

    kineticTitle.addEventListener('mouseleave', () => {
      kineticTitle.querySelectorAll('.kinetic-letter').forEach(letter => {
        letter.style.transform = `translate(0,0)`;
      });
    });
  }

})();