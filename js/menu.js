const THEME_STORAGE_KEY = "bookstore-theme";

function getSavedTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" ? "light" : "dark";
  } catch (error) {
    return "dark";
  }
}

function applyTheme(theme) {
  const normalizedTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    //storage
  }
  return normalizedTheme;
}

function updateThemeButton(button, theme) {
  const isLight = theme === "light";
  button.classList.toggle("header__theme-btn--light", isLight);
  button.setAttribute("aria-label", isLight ? "Включить темную тему" : "Включить светлую тему");
  button.title = isLight ? "Темная тема" : "Светлая тема";
}

function initThemeToggle() {
  const actions = document.querySelector(".header__actions");
  if (!actions || actions.querySelector(".js-theme-toggle")) return;
  const iconPrefix = window.location.pathname.toLowerCase().includes("/pages/") ? "../" : "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "header__theme-btn js-theme-toggle";
  button.innerHTML =
    `<span class="header__theme-icon header__theme-icon--sun" aria-hidden="true"><img src="${iconPrefix}svg/icon-theme-sun.svg" alt="" width="18" height="18"></span>` +
    `<span class="header__theme-icon header__theme-icon--moon" aria-hidden="true"><img src="${iconPrefix}svg/icon-theme-moon.svg" alt="" width="18" height="18"></span>`;

  const initialTheme = applyTheme(getSavedTheme());
  updateThemeButton(button, initialTheme);

  button.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    const appliedTheme = applyTheme(nextTheme);
    updateThemeButton(button, appliedTheme);
  });

  actions.prepend(button);
}

function initHeaderMenu() {
  initThemeToggle();
  const headers = Array.from(document.querySelectorAll(".header"));
  if (!headers.length) return;

  const closeHandlers = [];

  function setBurgerState(burger, nav, isOpen) {
    nav.classList.toggle("header__nav--open", isOpen);
    burger.classList.toggle("header__burger--active", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    burger.title = isOpen ? "Закрыть меню" : "Открыть меню";
  }

  headers.forEach((header) => {
    const burger = header.querySelector(".js-header-burger");
    const nav = header.querySelector(".header__nav");
    if (!(burger instanceof HTMLElement) || !(nav instanceof HTMLElement)) return;

    function closeMenu() {
      setBurgerState(burger, nav, false);
    }

    setBurgerState(burger, nav, false);
    closeHandlers.push(closeMenu);

    burger.addEventListener("click", () => {
      const isOpen = !nav.classList.contains("header__nav--open");
      setBurgerState(burger, nav, isOpen);
    });

    nav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest(".header__nav-link")) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!header.contains(target)) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeHandlers.forEach((closeMenu) => closeMenu());
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHandlers.forEach((closeMenu) => closeMenu());
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderMenu);
} else {
  initHeaderMenu();
}
