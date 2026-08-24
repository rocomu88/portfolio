/* Dynamic copyright year */
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

/* Navigation scroll effect */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* Mobile nav toggle */
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) navLinks.classList.remove('open');
  });
}

/* Scroll-in animations */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.fade-up, .stagger').forEach(el => observer.observe(el));

/* Active nav link */
const caseStudyPages = [
  'governance-orchestration-service',
  'partner-enablement-network',
  'bulk-email',
  'seismic-social',
  'digital-salesrooms',
  'meetings-analytics',
  'seismic-meetings'
];
const segments = window.location.pathname.split('/').filter(Boolean);
let page = (segments[segments.length - 1] || 'index').replace(/\.html$/, '');
if (caseStudyPages.includes(page)) page = 'case-studies';
document.querySelectorAll('.nav-link[data-page]').forEach(link => {
  const linkPage = link.dataset.page.replace(/\.html$/, '');
  if (linkPage === page) link.classList.add('active');
});
