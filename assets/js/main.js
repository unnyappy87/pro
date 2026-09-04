const navLinks = Array.from(document.querySelectorAll(".site-nav__link"));
const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setActiveNavLink(activeId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;

    link.classList.toggle("site-nav__link--active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function scrollToTarget(targetId) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    block: "start",
  });
  setActiveNavLink(targetId);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").slice(1);

    if (!document.getElementById(targetId)) {
      return;
    }

    event.preventDefault();
    scrollToTarget(targetId);
    history.pushState(null, "", `#${targetId}`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
      setActiveNavLink(visibleEntry.target.id);
    }
  },
  {
    root: null,
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.1, 0.25, 0.5],
  }
);

sections.forEach((section) => observer.observe(section));

const searchButton = document.querySelector(".site-nav__search");

if (searchButton) {
  searchButton.addEventListener("click", () => {
    searchButton.blur();
  });
}

document.querySelectorAll("[data-static-action]").forEach((control) => {
  control.addEventListener("click", () => {
    control.blur();
  });
});

if (window.location.hash) {
  const targetId = window.location.hash.slice(1);

  window.requestAnimationFrame(() => {
    scrollToTarget(targetId);
  });
} else {
  setActiveNavLink("home");
}

function initHorizontalGallery() {
  const section = document.querySelector(".gallery-section");
  const viewport = document.querySelector(".gallery-section__viewport");
  const track = document.querySelector(".gallery-section__grid");

  if (!section || !viewport || !track || prefersReducedMotion.matches) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    viewport.style.overflowX = "auto";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const setupScroll = () => {
    const moveDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);

    if (moveDistance <= 0 || window.matchMedia("(max-width: 720px)").matches) {
      gsap.set(track, { clearProps: "transform" });
      return;
    }

    gsap.to(track, {
      x: -moveDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${moveDistance}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  };

  window.addEventListener("load", () => {
    setupScroll();
    ScrollTrigger.refresh();
  });
}

initHorizontalGallery();
