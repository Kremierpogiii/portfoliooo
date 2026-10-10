const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const links = [...nav.querySelectorAll("a")];
const mobileLayout = window.matchMedia("(max-width: 960px)");

document.documentElement.classList.add("js-ready");

const syncMenu = () => {
  const open = nav.classList.contains("open");
  nav.inert = mobileLayout.matches && !open;
  document.body.classList.toggle("menu-open", mobileLayout.matches && open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
};

const closeMenu = () => {
  nav.classList.remove("open");
  syncMenu();
};

menu.addEventListener("click", () => {
  nav.classList.toggle("open");
  syncMenu();
});

links.forEach((link) => link.addEventListener("click", closeMenu));
mobileLayout.addEventListener("change", closeMenu);
syncMenu();

// Keep keyboard focus in the mobile navigation while it is open.
document.addEventListener("keydown", (event) => {
  if (!mobileLayout.matches || !nav.classList.contains("open")) return;
  if (event.key === "Escape") {
    closeMenu();
    menu.focus();
  } else if (event.key === "Tab") {
    const focusable = [menu, ...links];
    const current = focusable.indexOf(document.activeElement);
    if (event.shiftKey && current <= 0) {
      event.preventDefault();
      focusable.at(-1).focus();
    } else if (!event.shiftKey && (current === focusable.length - 1 || current === -1)) {
      event.preventDefault();
      menu.focus();
    }
  }
});

// Preserve scroll reveals, with readable content if JavaScript or observers are unavailable.
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("seen");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  // Only watch sections represented by primary navigation links.
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isActive = link.getAttribute("href") === "#" + entry.target.id;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-25% 0px -65%" });
  sections.forEach((section) => activeSectionObserver.observe(section));
}

const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Reuse the existing dialog for all case studies. Native dialog behavior traps focus and supports Escape.
const modal = document.querySelector(".project-modal");
const modalImage = modal?.querySelector("img");
const modalTitle = modal?.querySelector("h2");
const modalCloseButton = modal?.querySelector(".modal-close");
const modalPreview = modal?.querySelector(".modal-preview");
const fullImageLink = modal?.querySelector(".modal-full-image");
const caseContent = modal?.querySelector(".case-content");
let projectTrigger = null;

document.querySelectorAll(".open-project").forEach((button) => {
  button.addEventListener("click", () => {
    const template = document.querySelector("#case-" + button.dataset.project);
    if (!modal || !template) return;
    projectTrigger = button;
    modalTitle.textContent = button.dataset.title;
    caseContent.replaceChildren(template.content.cloneNode(true));
    modalPreview.hidden = !button.dataset.image;
    if (button.dataset.image) {
      modalImage.src = button.dataset.image;
      modalImage.alt = button.dataset.title + " — project screenshot";
      fullImageLink.href = button.dataset.image;
    }
    modal.showModal();
    modal.scrollTop = 0;
    document.body.classList.add("modal-open");
  });
});

// Cycle focus inside the dialog, including case studies with only a close button.
modal?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [...modal.querySelectorAll('button, a[href], summary, [tabindex="0"]')]
    .filter((element) => element.getClientRects().length && !element.closest("[hidden]"));
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

modalCloseButton?.addEventListener("click", () => modal.close());
modal?.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const bounds = modal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
});
modal?.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  modalImage.removeAttribute("src");
  fullImageLink.removeAttribute("href");
  caseContent.replaceChildren();
  projectTrigger?.focus({ preventScroll: true });
});

// Avoid overlapping audio when previewing more than one video.
const videos = [...document.querySelectorAll("video")];
videos.forEach((video) => video.addEventListener("play", () => {
  videos.forEach((other) => { if (other !== video) other.pause(); });
}));
