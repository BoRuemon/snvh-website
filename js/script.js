/* SNVH — site interactions
   Vanilla ES2017+. No libraries. No console.log.
   Responsibilities:
     1. Gate class (js-enabled) on <html>
     2. Scroll reveal via IntersectionObserver
     3. Mobile nav toggle (nav-open on <body>)
     4. Active nav link tracking via IntersectionObserver
*/

// 1. Gate class — must be first so CSS transitions apply immediately
document.documentElement.classList.add('js-enabled');

(function () {
  'use strict';

  /* ── Scroll reveal ──────────────────────────────────────────────────── */

  const revealElements = document.querySelectorAll('.reveal');

  function revealAll() {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    revealAll();
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // reveal once
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ── Mobile nav ─────────────────────────────────────────────────────── */

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav-menu');

  function isNavOpen() {
    return document.body.classList.contains('nav-open');
  }

  function openNav() {
    document.body.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      isNavOpen() ? closeNav() : openNav();
    });

    // Close when any nav link is clicked (smooth scroll + keeps menu tidy)
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isNavOpen()) closeNav();
      });
    });

    // Escape key closes the menu and returns focus to the toggle button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isNavOpen()) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ── Active nav link tracking ───────────────────────────────────────── */

  const sections   = document.querySelectorAll('main [id]');
  const navLinks   = document.querySelectorAll('.nav-menu a');

  if (sections.length && navLinks.length && typeof IntersectionObserver !== 'undefined') {
    // Track which sections are currently intersecting; pick the first visible one
    const visibleSections = new Set();

    function updateActiveLink() {
      // Walk sections in DOM order and pick the first currently intersecting
      let activeId = null;
      sections.forEach(function (section) {
        if (activeId === null && visibleSections.has(section.id)) {
          activeId = section.id;
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (activeId && link.getAttribute('href') === '#' + activeId) {
          link.classList.add('active');
        }
      });
    }

    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });
        updateActiveLink();
      },
      // A section counts as "in view" once 20% of its own height is visible
      { threshold: 0.2 }
    );

    sections.forEach(el => sectionObserver.observe(el));
  }
}());
