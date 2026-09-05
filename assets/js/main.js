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

function initHorizontalSections() {
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
        start: "top top",
        end: () => `+=${moveDistance}`,
        pin: true,
        scrub: 1.15,
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

function initFlipModal() {
  if (!window.gsap || !window.Flip) {
    return;
  }

  gsap.registerPlugin(Flip);

  const modal = document.createElement("div");
  const modalContent = document.createElement("div");
  let activeCard = null;
  let activePlaceholder = null;
  let activeParent = null;
  let activeNextSibling = null;
  let activeViewport = null;
  let isAnimating = false;

  modal.className = "flip-modal";
  modal.setAttribute("aria-hidden", "true");
  modalContent.className = "flip-modal__content";
  modal.append(modalContent);
  document.body.append(modal);

  const getInteractiveCards = () =>
    Array.from(
      document.querySelectorAll(
        ".projects-section__track .project-panel, .personal-section__track .personal-card, .gallery-section__grid img"
      )
    );

  const setScrollLocked = (isLocked) => {
    document.body.classList.toggle("is-flip-modal-open", isLocked);

    if (activeViewport) {
      activeViewport.classList.toggle("is-scroll-locked", isLocked);
    }

  };

  const makePlaceholder = (card, rect) => {
    const placeholder = document.createElement(card.tagName === "IMG" ? "span" : "div");

    placeholder.className = "flip-placeholder";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;

    return placeholder;
  };

  const openModal = (card) => {
    if (isAnimating || activeCard || prefersReducedMotion.matches) {
      return;
    }

    activeCard = card;
    activeParent = card.parentElement;
    activeNextSibling = card.nextSibling;
    activeViewport = card.closest(".horizontal-scroll, .gallery-section__viewport");

    const firstRect = card.getBoundingClientRect();
    const state = Flip.getState(card);

    activePlaceholder = makePlaceholder(card, firstRect);
    card.classList.add("is-flip-active");
    card.after(activePlaceholder);
    modalContent.append(card);
    card.getBoundingClientRect();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setScrollLocked(true);
    document.body.classList.add("is-frame-dimmed");
    isAnimating = true;

    gsap.to(modal, {
      opacity: 1,
      duration: 0.34,
      ease: "power3.out",
    });

    Flip.from(state, {
      duration: 0.78,
      ease: "power4.inOut",
      absolute: true,
      scale: true,
      nested: true,
      onComplete: () => {
        isAnimating = false;
      },
    });
  };

  const closeModal = () => {
    if (isAnimating || !activeCard || !activePlaceholder || !activeParent) {
      return;
    }

    const state = Flip.getState(activeCard);

    if (activeNextSibling && activeNextSibling.parentElement === activeParent) {
      activeParent.insertBefore(activeCard, activeNextSibling);
    } else {
      activeParent.append(activeCard);
    }

    activePlaceholder.remove();
    document.body.classList.remove("is-frame-dimmed");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    isAnimating = true;

    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      ease: "power3.out",
    });

    Flip.from(state, {
      duration: 0.86,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      nested: true,
      onComplete: () => {
        activeCard.classList.remove("is-flip-active");
        setScrollLocked(false);
        activeCard = null;
        activePlaceholder = null;
        activeParent = null;
        activeNextSibling = null;
        activeViewport = null;
        isAnimating = false;

        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
      },
    });
  };

  getInteractiveCards().forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
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

if (window.gsap && window.ScrollTrigger && window.Flip) {
  gsap.registerPlugin(ScrollTrigger, Flip);
} else if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

initHorizontalSections();
initFlipModal();
initLotties();
