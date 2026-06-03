/**
 * SMAI — Sistema de Monitoreo Ambiental Inteligente
 * script.js · Edwin Alonso García Fuentes · 2026
 * -------------------------------------------------------
 * Modules:
 *  1. Particle Canvas (Hero background)
 *  2. Navbar (scroll + mobile toggle)
 *  3. Scroll Reveal (IntersectionObserver)
 *  4. Active Nav Link (scroll spy)
 *  5. Budget Bars Animation
 *  6. Staggered card delays
 */

'use strict';

/* =====================================================
   1. PARTICLE CANVAS
   ===================================================== */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const CONFIG = {
    count:       window.innerWidth < 768 ? 40 : 80,
    speed:       0.35,
    minR:        1,
    maxR:        2.5,
    lineDistance: 120,
    nodeColor:   'rgba(59,130,246,',
    lineColor:   'rgba(59,130,246,',
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    return {
      x:  rand(0, W),
      y:  rand(0, H),
      vx: rand(-CONFIG.speed, CONFIG.speed),
      vy: rand(-CONFIG.speed, CONFIG.speed),
      r:  rand(CONFIG.minR, CONFIG.maxR),
      o:  rand(0.2, 0.7),
    };
  }

  function initParticlesList() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.nodeColor + p.o + ')';
    ctx.fill();
  }

  function drawLine(p1, p2, dist) {
    const opacity = (1 - dist / CONFIG.lineDistance) * 0.18;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = CONFIG.lineColor + opacity + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function update() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      drawParticle(p);

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineDistance) {
          drawLine(p, q, dist);
        }
      }
    }

    animId = requestAnimationFrame(update);
  }

  function start() {
    resize();
    initParticlesList();
    update();
  }

  // Pause when tab is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      update();
    }
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initParticlesList();
    update();
  });

  start();
})();


/* =====================================================
   2. NAVBAR — scroll behavior + mobile toggle
   ===================================================== */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  // Scroll: add .scrolled class
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* =====================================================
   3. SCROLL REVEAL — IntersectionObserver
   ===================================================== */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Apply staggered delays declared via data-delay attribute
  items.forEach(el => {
    const delay = el.dataset.delay;
    if (delay) {
      el.style.transitionDelay = delay + 'ms';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  items.forEach(el => observer.observe(el));
})();


/* =====================================================
   4. ACTIVE NAV LINK — scroll spy
   ===================================================== */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + id
          );
        });
      }
    });
  }, {
    threshold: 0.3,
  });

  sections.forEach(s => observer.observe(s));
})();


/* =====================================================
   5. BUDGET BARS — animate fill on scroll
   ===================================================== */
(function initBudgetBars() {
  const fills = document.querySelectorAll('.bb-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger each bar slightly
        fills.forEach((fill, i) => {
          setTimeout(() => {
            fill.classList.add('animated');
          }, i * 120);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const container = document.querySelector('.budget-bars');
  if (container) observer.observe(container);
})();


/* =====================================================
   6. HERO ACRONYM — staggered letter reveal
   ===================================================== */
(function initAcronym() {
  const letters = document.querySelectorAll('.hero-acronym span');
  letters.forEach((letter, i) => {
    letter.style.opacity = '0';
    letter.style.transform = 'translateY(20px)';
    letter.style.transition = `opacity 0.5s ease ${0.8 + i * 0.1}s, transform 0.5s ease ${0.8 + i * 0.1}s`;

    // Trigger after a short paint delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0)';
      });
    });
  });
})();


/* =====================================================
   7. HERO STATS — count-up animation
   ===================================================== */
(function initCountUp() {
  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;

  // Already visible immediately in hero — just animate on load
  const nums = [
    { el: statsSection.querySelectorAll('.stat-number')[0], target: 4,   suffix: '',   decimals: 0 },
    { el: statsSection.querySelectorAll('.stat-number')[2], target: 369, suffix: 'K',  decimals: 0 },
    { el: statsSection.querySelectorAll('.stat-number')[3], target: 22,  suffix: '',   decimals: 0 },
  ];

  function countUp(el, target, suffix, decimals, duration) {
    if (!el) return;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = (decimals > 0 ? value.toFixed(decimals) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Trigger after hero elements appear (1.5s)
  setTimeout(() => {
    nums.forEach(({ el, target, suffix, decimals }) => {
      countUp(el, target, suffix, decimals, 1400);
    });
  }, 1500);
})();


/* =====================================================
   8. SMOOTH ANCHOR SCROLL (fallback for older browsers)
   ===================================================== */
(function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight ?? 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* =====================================================
   9. ARCHITECTURE DIAGRAM — animated data flow
   ===================================================== */
(function initArchAnimation() {
  const nodes = document.querySelectorAll('.arch-node');
  if (!nodes.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        nodes.forEach((node, i) => {
          node.style.opacity = '0';
          node.style.transform = 'translateY(16px)';
          node.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s, box-shadow 0.3s ease`;
          setTimeout(() => {
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
          }, 200 + i * 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const arch = document.getElementById('arquitectura');
  if (arch) observer.observe(arch);
})();


/* =====================================================
   10. GANTT — highlight row on hover (accessibility)
   ===================================================== */
(function initGantt() {
  const rows = document.querySelectorAll('.gantt-row');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.background = 'var(--bg-light)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.background = '';
    });
    // Keyboard accessibility
    row.setAttribute('tabindex', '0');
    row.addEventListener('focus', () => row.style.outline = '2px solid var(--blue)');
    row.addEventListener('blur',  () => row.style.outline = '');
  });
})();


/* =====================================================
   11. TECH CARDS — tilt effect on hover (desktop only)
   ===================================================== */
(function initTechTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.tech-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* =====================================================
   12. LAZY LOADING — images with data-src (future use)
   ===================================================== */
(function initLazyLoad() {
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if (!lazyImgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  lazyImgs.forEach(img => observer.observe(img));
})();


/* =====================================================
   13. CURRENT YEAR in footer (defensive)
   ===================================================== */
(function setYear() {
  const yearEls = document.querySelectorAll('.footer-copy');
  // Already hardcoded in HTML as 2026; this keeps it dynamic if reused
  yearEls.forEach(el => {
    el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, `© ${new Date().getFullYear()}`);
  });
})();
