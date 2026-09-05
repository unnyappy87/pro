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

function createHorizontalTrack(sectionSelector, itemSelector, viewportClass, trackClass) {
  const section = document.querySelector(sectionSelector);

  if (!section || section.querySelector(`.${viewportClass}`)) {
    return section;
  }

  const items = Array.from(section.querySelectorAll(itemSelector));

  if (items.length < 2) {
    return section;
  }

  const viewport = document.createElement("div");
  const track = document.createElement("div");

  viewport.className = `horizontal-scroll ${viewportClass}`;
  track.className = `horizontal-scroll__track ${trackClass}`;

  items[0].before(viewport);
  viewport.append(track);
  items.forEach((item) => track.append(item));

  return section;
}

function initSmoothScroll() {
  const scrollContainer = document.querySelector("[data-scroll-container]");

  if (!scrollContainer || prefersReducedMotion.matches || !window.LocomotiveScroll) {
    return null;
  }

  const locomotive = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    tablet: { smooth: false },
    smartphone: { smooth: false },
  });

  locomotive.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      if (arguments.length) {
        locomotive.scrollTo(value, { duration: 0, disableLerp: true });
      }

      return locomotive.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: scrollContainer.style.transform ? "transform" : "fixed",
  });

  ScrollTrigger.addEventListener("refresh", () => locomotive.update());

  return { locomotive, scrollContainer };
}

function initHorizontalSections(scrollContext) {
  createHorizontalTrack(
    ".projects-section",
    ".project-panel",
    "projects-section__viewport",
    "projects-section__track"
  );
  createHorizontalTrack(
    ".personal-section",
    ".personal-card",
    "personal-section__viewport",
    "personal-section__track"
  );

  const groups = [
    {
      section: document.querySelector(".projects-section"),
      viewport: document.querySelector(".projects-section__viewport"),
      track: document.querySelector(".projects-section__track"),
    },
    {
      section: document.querySelector(".personal-section"),
      viewport: document.querySelector(".personal-section__viewport"),
      track: document.querySelector(".personal-section__track"),
    },
    {
      section: document.querySelector(".gallery-section"),
      viewport: document.querySelector(".gallery-section__viewport"),
      track: document.querySelector(".gallery-section__grid"),
    },
  ];

  if (prefersReducedMotion.matches) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    groups.forEach(({ viewport }) => {
      if (viewport) {
        viewport.style.overflowX = "auto";
      }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const setupScroll = ({ section, viewport, track }) => {
    if (!section || !viewport || !track) {
      return;
    }

    const moveDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);

    if (moveDistance <= 0 || window.matchMedia("(max-width: 720px)").matches) {
      gsap.set(track, { clearProps: "transform" });
      viewport.style.overflowX = "auto";
      return;
    }

    viewport.style.overflowX = "hidden";

    gsap.to(track, {
      x: -moveDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        scroller: scrollContext ? scrollContext.scrollContainer : undefined,
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
    groups.forEach(setupScroll);
    ScrollTrigger.refresh();
  });
}

function initLotties() {
  const lotties = Array.from(document.querySelectorAll("dotlottie-wc"));

  if (!lotties.length) {
    return;
  }

  const startAnimation = () => {
    lotties.forEach((lottie) => {
      lottie.setAttribute("autoplay", "");
      lottie.setAttribute("loop", "");

      if (typeof lottie.play === "function") {
        lottie.play();
      }
    });
  };

  if (window.customElements && window.customElements.whenDefined) {
    window.customElements.whenDefined("dotlottie-wc").then(startAnimation);
  } else {
    window.addEventListener("load", startAnimation, { once: true });
  }
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const scrollContext = window.ScrollTrigger ? initSmoothScroll() : null;

initHorizontalSections(scrollContext);
initLotties();
