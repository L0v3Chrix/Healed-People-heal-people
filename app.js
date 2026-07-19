// StickerPass Infinity Page — progress bar, scroll reveals, metric counters, active nav.

const bar = document.getElementById("progressBar");
const updateProgress = () => {
  const root = document.documentElement;
  const distance = root.scrollHeight - root.clientHeight;
  const value = distance > 0 ? Math.min(1, root.scrollTop / distance) : 0;
  bar.style.transform = `scaleX(${value})`;
};
document.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveal
const revealTargets = document.querySelectorAll(".reveal, .readiness-list > div");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("in"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// Metric count-up
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  if (reduceMotion) { el.textContent = String(target); return; }
  const duration = 1100;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const counters = document.querySelectorAll(".count");
if (!("IntersectionObserver" in window)) {
  counters.forEach((el) => { el.textContent = el.dataset.count; });
} else {
  const countObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObserver.observe(el));
}

// Active nav link tracking
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sectionsById = navLinks
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);
if ("IntersectionObserver" in window && sectionsById.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  sectionsById.forEach((section) => navObserver.observe(section));
}

// Deep-link preview mode (?section=<id>) used by the planning package
const requestedSection = new URLSearchParams(window.location.search).get("section");
if (requestedSection) {
  const target = document.getElementById(requestedSection);
  if (target) {
    document.body.classList.add("section-preview");
    target.classList.add("section-preview-target");
  }
}
