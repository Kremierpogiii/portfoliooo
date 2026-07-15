const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const links = [...nav.querySelectorAll("a")];

const closeMenu = () => {
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
  menu.setAttribute("aria-expanded", "false");
};

menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");

  document.body.classList.toggle("menu-open", open);
  menu.setAttribute("aria-expanded", String(open));
});

links.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Reveal elements when they enter the screen
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("seen");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

// Update the active navigation link
const sections = [...document.querySelectorAll("main section[id]")];

const activeSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((link) => {
          const isActive =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", isActive);
        });
      }
    });
  },
  {
    rootMargin: "-25% 0px -65%",
  }
);

sections.forEach((section) => {
  activeSectionObserver.observe(section);
});

// Change the header after scrolling
window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  },
  {
    passive: true,
  }
);

// Automatically update the copyright year
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Project preview modal
const modal = document.querySelector(".project-modal");
const modalImage = modal?.querySelector("img");
const modalTitle = modal?.querySelector("h2");
const modalCloseButton = modal?.querySelector(".modal-close");

document.querySelectorAll(".open-project").forEach((button) => {
  button.addEventListener("click", () => {
    modalImage.src = button.dataset.image;
    modalImage.alt = button.dataset.title;
    modalTitle.textContent = button.dataset.title;

    modal.showModal();
  });
});

modalCloseButton?.addEventListener("click", () => {
  modal.close();
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.close();
  }
});