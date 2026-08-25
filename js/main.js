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

/* Image lightbox — only runs on pages that have a zoomable image */
(function () {
  const triggers = document.querySelectorAll('.case-image-zoom');
  if (!triggers.length) return;

  let box, stage, img, caption, zoomBtn, lastFocused;

  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML =
      '<div class="lightbox-bar">' +
        '<p class="lightbox-caption"></p>' +
        '<div class="lightbox-actions">' +
          '<button type="button" class="lightbox-btn" data-act="zoom">Zoom in</button>' +
          '<button type="button" class="lightbox-btn" data-act="close">Close</button>' +
        '</div>' +
      '</div>' +
      '<div class="lightbox-stage"><img class="lightbox-img" alt="" /></div>';
    document.body.appendChild(box);

    stage = box.querySelector('.lightbox-stage');
    img = box.querySelector('.lightbox-img');
    caption = box.querySelector('.lightbox-caption');
    zoomBtn = box.querySelector('[data-act="zoom"]');

    box.querySelector('[data-act="close"]').addEventListener('click', close);
    zoomBtn.addEventListener('click', toggleZoom);
    img.addEventListener('click', toggleZoom);
    // Click the backdrop (but not the image or the bar) to close
    stage.addEventListener('click', e => { if (e.target === stage) close(); });
    box.addEventListener('click', e => { if (e.target === box) close(); });

    enableDragPan();
  }

  function canZoom() {
    // Only offer zoom when the natural size is actually larger than the fitted size
    return img.naturalWidth > img.clientWidth + 4;
  }

  function syncZoomBtn() {
    const zoomed = box.classList.contains('zoomed');
    zoomBtn.textContent = zoomed ? 'Fit to screen' : 'Zoom in';
    zoomBtn.hidden = !zoomed && !canZoom();
    img.style.cursor = zoomBtn.hidden ? 'default' : (zoomed ? 'grab' : 'zoom-in');
  }

  function toggleZoom() {
    const zoomed = box.classList.toggle('zoomed');
    if (zoomed) {
      // Center the horizontal scroll on open so the middle of the flow is visible
      requestAnimationFrame(() => {
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      });
    }
    syncZoomBtn();
  }

  function enableDragPan() {
    let down = false, sx = 0, sy = 0, sl = 0, st = 0;
    img.addEventListener('pointerdown', e => {
      if (!box.classList.contains('zoomed')) return;
      down = true; sx = e.clientX; sy = e.clientY;
      sl = stage.scrollLeft; st = stage.scrollTop;
      box.classList.add('dragging');
      img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointermove', e => {
      if (!down) return;
      stage.scrollLeft = sl - (e.clientX - sx);
      stage.scrollTop = st - (e.clientY - sy);
    });
    ['pointerup', 'pointercancel'].forEach(ev =>
      img.addEventListener(ev, e => {
        if (!down) return;
        down = false;
        box.classList.remove('dragging');
        // Suppress the click that follows a real drag, so it doesn't toggle zoom
        if (Math.abs(e.clientX - sx) > 4 || Math.abs(e.clientY - sy) > 4) {
          img.addEventListener('click', ev2 => {
            ev2.stopImmediatePropagation();
          }, { capture: true, once: true });
        }
      })
    );
  }

  function open(trigger) {
    if (!box) build();
    const src = trigger.querySelector('img');
    lastFocused = trigger;
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || '';
    const cap = trigger.closest('.case-image-wide, .case-section');
    const capEl = cap && cap.querySelector('.case-image-wide-caption');
    caption.textContent = capEl ? capEl.textContent.trim() : (src.alt || '');
    box.classList.remove('zoomed');

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('open'));

    const ready = () => { syncZoomBtn(); };
    if (img.complete) ready(); else img.addEventListener('load', ready, { once: true });

    document.addEventListener('keydown', onKey);
    box.querySelector('[data-act="close"]').focus();
  }

  function close() {
    if (!box) return;
    box.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    const done = () => {
      box.classList.remove('zoomed');
      img.removeAttribute('src');
      if (lastFocused) lastFocused.focus();
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) done(); else setTimeout(done, 220);
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      // Keep focus inside the dialog
      const f = [...box.querySelectorAll('button:not([hidden])')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  triggers.forEach(t => t.addEventListener('click', () => open(t)));
})();
