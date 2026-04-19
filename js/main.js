/* IdeaCraft — main.js */

// ── Theme Toggle ──────────────────────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('ideacraft-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
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
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCyZxK_SJgqL_bFL9h93yamzUNSi5IixLuIf7FNZxM2IM3pW-BTFmPi570SalG2ojfRg/exec';

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
