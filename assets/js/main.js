const navLinks = Array.from(document.querySelectorAll(".site-nav__link"));
const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const interactiveSelector = "a, button, input, textarea, select, label, [data-static-action]";

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

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");

  if (!form || !status || !window.emailjs) {
    return;
  }

  emailjs.init({
    publicKey: "b_mwkjFC0p5-rWj1_",
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(".contact-form__submit");

    status.textContent = "전송 중 입니다";
    if (submitButton) {
      submitButton.disabled = true;
    }

    emailjs.sendForm("service_dal8y14", "template_5fad5k7", form).then(
      () => {
        status.textContent = "메일을 전송했습니다";
        form.reset();
      },
      () => {
        status.textContent = "메일 전송을 실패했습니다. 잠시후 다시 전송해주세요";
      }
    ).finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
      }
    });
  });
}

if (window.location.hash) {
  const targetId = window.location.hash.slice(1);

  window.requestAnimationFrame(() => {
    scrollToTarget(targetId);
  });
} else {
  setActiveNavLink("home");
}

initContactForm();

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
    ".projects-section .section-container",
    ".project-panel",
    "projects-section__viewport",
    "projects-section__track"
  );

  const groups = [
    {
      section: document.querySelector(".projects-section"),
      viewport: document.querySelector(".projects-section__viewport"),
      track: document.querySelector(".projects-section__track"),
    },
    {
      section: document.querySelector(".pictures-section"),
      viewport: document.querySelector(".pictures-section__viewport"),
      track: document.querySelector(".pictures-section__grid"),
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
  let resizeFrame = 0;

  const setupScroll = ({ section, viewport, track }) => {
    if (!section || !viewport || !track) {
      return;
    }

    if (track.horizontalScrollTween && track.horizontalScrollTween.scrollTrigger) {
      track.horizontalScrollTween.scrollTrigger.kill();
      track.horizontalScrollTween.kill();
      track.horizontalScrollTween = null;
    }

    const moveDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);

    if (moveDistance <= 0 || window.matchMedia("(max-width: 720px)").matches) {
      gsap.set(track, { clearProps: "transform" });
      viewport.style.overflowX = "auto";
      return;
    }

    viewport.style.overflowX = "hidden";

    track.horizontalScrollTween = gsap.to(track, {
      x: -moveDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 8%",
        end: () => `+=${moveDistance + viewport.clientWidth * 0.25}`,
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  };

  const refreshScroll = () => {
    groups.forEach(setupScroll);
    ScrollTrigger.refresh();
  };

  window.addEventListener("load", () => {
    refreshScroll();
    window.setTimeout(refreshScroll, 350);
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(refreshScroll);
  });

  document.querySelectorAll("img").forEach((image) => {
    if (image.complete) {
      return;
    }

    image.addEventListener("load", refreshScroll, { once: true });
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
        ".project-panel, .personal-card, .pictures-section__grid figure, .gallery-section__grid figure"
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

  const openModal = (card, event) => {
    if (event && event.target.closest(interactiveSelector)) {
      return;
    }

    if (isAnimating || activeCard || prefersReducedMotion.matches) {
      return;
    }

    activeCard = card;
    activeParent = card.parentElement;
    activeNextSibling = card.nextSibling;
    activeViewport = card.closest(".horizontal-scroll, .pictures-section__viewport, .gallery-section__viewport");

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
    card.addEventListener("click", (event) => openModal(card, event));
    card.addEventListener("keydown", (event) => {
      if (event.target.closest(interactiveSelector)) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card, event);
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

      if (lottie.ready && typeof lottie.ready.then === "function") {
        lottie.ready.then(() => {
          if (typeof lottie.play === "function") {
            lottie.play();
          }
        });
      }
    });
  };

  if (window.customElements && window.customElements.whenDefined) {
    window.customElements.whenDefined("dotlottie-wc").then(startAnimation);
  } else {
    window.addEventListener("load", startAnimation, { once: true });
  }

  window.addEventListener("load", startAnimation, { once: true });
  window.setTimeout(startAnimation, 500);
}

function initSkillCardMotion() {
  const cards = Array.from(document.querySelectorAll(".skill-card"));

  if (!cards.length) {
    return;
  }

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        skillObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.2,
    }
  );

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 90}ms`;
    skillObserver.observe(card);
  });
}

function initRevealMotion() {
  const revealItems = Array.from(
    document.querySelectorAll(
      [
        ".section-heading",
        ".profile-card",
        ".project-panel",
        ".personal-card",
        ".pictures-section h2",
        ".pictures-section p",
        ".pictures-section__grid figure",
        ".gallery-section h2",
        ".gallery-section p",
        ".gallery-section__grid figure",
        ".contact-panel__eyebrow",
        ".contact-panel__title",
        ".contact-panel__description",
        ".contact-form",
        ".contact-panel__labels",
      ].join(", ")
    )
  );

  if (!revealItems.length) {
    return;
  }

  revealItems.forEach((item, index) => {
    item.classList.add("motion-enter");
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  });

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (window.gsap && window.ScrollTrigger && window.Flip) {
  gsap.registerPlugin(ScrollTrigger, Flip);
} else if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

initHorizontalSections();
initFlipModal();
initLotties();
initRevealMotion();
initSkillCardMotion();
