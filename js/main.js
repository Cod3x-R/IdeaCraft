/* IdeaCraft — main.js */

// ── Theme Toggle ──────────────────────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('ideacraft-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  const logoSrc = theme === 'dark' ? 'images/logo_ts_dark.png' : 'images/logo_ts_light.png';
  document.querySelectorAll('.site-logo').forEach(img => img.src = logoSrc);
}

// Load saved theme or system preference
const saved = localStorage.getItem('ideacraft-theme');
if (saved) {
  setTheme(saved);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ── Sticky Nav ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile Nav ────────────────────────────────────────────────
const navToggle  = document.getElementById('navToggle');
const navMobile  = document.getElementById('navMobile');
const navClose   = document.getElementById('navClose');

navToggle.addEventListener('click', () => navMobile.classList.add('open'));
navClose.addEventListener('click',  () => navMobile.classList.remove('open'));

function closeMobileNav() {
  navMobile.classList.remove('open');
}
window.closeMobileNav = closeMobileNav;

// Close on outside click
navMobile.addEventListener('click', (e) => {
  if (e.target === navMobile) closeMobileNav();
});

// ── Scroll Reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── Portfolio Filter ──────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.opacity    = match ? '1' : '0.2';
      item.style.transform  = match ? 'scale(1)' : 'scale(0.97)';
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      item.style.pointerEvents = match ? 'auto' : 'none';
    });
  });
});

// ── Form — Google Apps Script submission ──────────────────────
// 1) After you deploy the automation engine (see automation/SETUP-GUIDE.md),
//    paste your Web App "/exec" URL below.
// 2) Set SHARED_SECRET to the SAME value as CONFIG.SHARED_SECRET in 01_Config.gs.
const SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbyCyZxK_SJgqL_bFL9h93yamzUNSi5IixLuIf7FNZxM2IM3pW-BTFmPi570SalG2ojfRg/exec';
const SHARED_SECRET = 'CHANGE-ME-to-a-long-random-string-2026';

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formSubmitBtn = document.getElementById('formSubmitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#EF4444';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    formSubmitBtn.disabled = true;
    formSubmitBtn.textContent = 'Sending…';

    const data = {
      name:     contactForm.querySelector('#name').value,
      business: contactForm.querySelector('#business').value,
      email:    contactForm.querySelector('#email').value,
      phone:    contactForm.querySelector('#phone').value,
      service:  contactForm.querySelector('#service').value,
      message:  contactForm.querySelector('#message').value,
      secret:   SHARED_SECRET,
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      contactForm.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
    } catch {
      formSubmitBtn.disabled = false;
      formSubmitBtn.textContent = 'Send Enquiry →';
      alert('Something went wrong. Please email us directly or try again.');
    }
  });
}

// ── Scroll progress bar ──────────────────────────────────────
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    scrollProgress.style.width = (scrolled * 100) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── Animated stat counters ───────────────────────────────────
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));
}

// ── Cursor spotlight on cards ────────────────────────────────
const spotlightCards = document.querySelectorAll('.service-card, .package-card:not(.package-custom), .process-step');
spotlightCards.forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ── Active nav link on scroll ────────────────────────────────
const navLinkEls = document.querySelectorAll('.nav-links a');
const sections = [...navLinkEls]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
if (sections.length) {
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spyObserver.observe(s));
}

// ── Magnetic primary buttons ─────────────────────────────────
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// ── Smooth scroll for anchor links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
