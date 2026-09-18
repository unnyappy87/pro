const navLinks = Array.from(document.querySelectorAll(".site-nav__link"));
const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));
const sections = sectionIds
  .map((id) => document.querySelector(`[data-nav-section="${id}"]`) || document.getElementById(id))
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const interactiveSelector = "a, button, input, textarea, select, label, [data-static-action]";
let pendingNavTarget = null;
let pendingNavTimer = 0;

function getNavTarget(targetId) {
  return document.querySelector(`[data-nav-section="${targetId}"]`) || document.getElementById(targetId);
}

function settleNavScroll(target, targetId, attempt = 0) {
  const delta = target.getBoundingClientRect().top;

  if (Math.abs(delta) > 4) {
    window.scrollTo({
      top: window.scrollY + delta,
      behavior: "auto",
    });
  }

  if (attempt < 18) {
    window.setTimeout(() => settleNavScroll(target, targetId, attempt + 1), 90);
    return;
  }

  setActiveNavLink(targetId);
  window.clearTimeout(pendingNavTimer);
  pendingNavTimer = window.setTimeout(() => {
    if (pendingNavTarget === targetId) {
      pendingNavTarget = null;
    }
  }, 500);
}

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
  const target = getNavTarget(targetId);

  if (!target) {
    return;
  }

  if (window.ScrollTrigger && typeof ScrollTrigger.refresh === "function") {
    ScrollTrigger.refresh();
  }

  pendingNavTarget = targetId;
  setActiveNavLink(targetId);

  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY,
    behavior: "auto",
  });

  window.clearTimeout(pendingNavTimer);
  pendingNavTimer = window.setTimeout(() => settleNavScroll(target, targetId), 90);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").slice(1);

    if (!getNavTarget(targetId)) {
      return;
    }

    event.preventDefault();
    scrollToTarget(targetId);
    history.pushState(null, "", `#${targetId}`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    if (pendingNavTarget) {
      setActiveNavLink(pendingNavTarget);
      return;
    }

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
const searchDialog = document.getElementById("site-search");
const searchInput = document.getElementById("site-search-input");
const searchResults = searchDialog ? searchDialog.querySelector("[data-search-results]") : null;
const searchCloseButton = searchDialog ? searchDialog.querySelector(".site-search__close") : null;
const searchItems = [
  { title: "Home", meta: "첫 화면", targetId: "home", keywords: "home intro portfolio main" },
  { title: "About Me", meta: "인적사항과 교육사항", targetId: "about", keywords: "about profile education personal" },
  { title: "Skills", meta: "디자인, 퍼블리싱, 모션 역량", targetId: "skills", keywords: "skills design web publishing motion figma html css javascript" },
  { title: "Team Projects", meta: "팀 프로젝트 섹션", targetId: "projects", keywords: "projects team pulmuone redesign ui ux website" },
  { title: "풀무원 웹사이트 리디자인", meta: "팀 프로젝트 01", targetId: "projects", keywords: "pulmuone website redesign site team" },
  { title: "풀무원 UI/UX 리디자인", meta: "팀 프로젝트 02", targetId: "projects", keywords: "pulmuone ui ux redesign figma team" },
  { title: "Gallery", meta: "작업 이미지 모음", targetId: "gallery", keywords: "gallery images pictures portfolio" },
  { title: "Contact", meta: "연락처와 문의 폼", targetId: "contact", keywords: "contact email phone message" },
];

function renderSearchResults(query = "") {
  if (!searchResults) {
    return;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const matchedItems = normalizedQuery
    ? searchItems.filter((item) => {
        const haystack = `${item.title} ${item.meta} ${item.keywords}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : searchItems.slice(0, 6);

  searchResults.replaceChildren();

  if (!matchedItems.length) {
    const empty = document.createElement("span");
    empty.className = "site-search__empty";
    empty.textContent = "검색 결과가 없습니다.";
    searchResults.append(empty);
    return;
  }

  matchedItems.forEach((item) => {
    const resultButton = document.createElement("button");
    const title = document.createElement("span");
    const meta = document.createElement("span");

    resultButton.className = "site-search__result";
    resultButton.type = "button";
    title.className = "site-search__result-title";
    meta.className = "site-search__result-meta";
    title.textContent = item.title;
    meta.textContent = item.meta;

    resultButton.append(title, meta);
    resultButton.addEventListener("click", () => {
      closeSearch();
      scrollToTarget(item.targetId);
      history.pushState(null, "", `#${item.targetId}`);
    });

    searchResults.append(resultButton);
  });
}

function openSearch() {
  if (!searchDialog || !searchInput) {
    return;
  }

  searchDialog.classList.add("is-open");
  searchDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-search-open");
  renderSearchResults(searchInput.value);

  window.setTimeout(() => {
    searchInput.focus();
    searchInput.select();
  }, 40);
}

function closeSearch() {
  if (!searchDialog) {
    return;
  }

  searchDialog.classList.remove("is-open");
  searchDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-search-open");
  if (searchButton) {
    searchButton.focus();
  }
}

if (searchButton && searchDialog && searchInput) {
  searchButton.addEventListener("click", () => {
    openSearch();
  });

  searchCloseButton.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) {
      closeSearch();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchDialog.classList.contains("is-open")) {
      closeSearch();
    }
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
