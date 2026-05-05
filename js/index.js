const books = typeof BookStoreData !== "undefined" && Array.isArray(BookStoreData) ? BookStoreData : [];
const sliderBookIds = [2, 8, 6];
const discountIds = [1, 3, 4, 11, 12];

function addBookToCart(bookId, button) {
  window.BookUi?.addToCartOnce(bookId, 1);
  updateCartCounter();
  window.BookUi?.markAdded(button);
}

function getBookId(el) {
  return window.BookUi ? window.BookUi.getNumberAttr(el, "data-book-id") : Number(el?.getAttribute("data-book-id"));
}

function renderDiscountBooks() {
  const grid = document.querySelector(".js-discount-grid");
  if (!grid) return;

  const visibleBooks = discountIds.map((id) => books.find((book) => book.id === id)).filter(Boolean);

  grid.innerHTML = visibleBooks
    .map(
      (book) => {
        const added = window.BookUi ? window.BookUi.isInCart(book.id) : Cart.load().some((item) => item.id === book.id);
        const finalPrice = window.BookPricing ? window.BookPricing.getBookPrice(book) : book.price * 0.8;
        const oldPrice = window.BookPricing ? window.BookPricing.getBookOldPrice(book) : book.price;
        return `
      <article class="book-card js-book-card" data-book-id="${book.id}">
        <a class="book-card__cover-link" href="pages/book.html?id=${book.id}" style="display:block">
          <div class="book-card__cover">
            <span class="book-card__badge book-card__badge--sale">-20%</span>
            <img src="${book.image}" alt="${book.title}" onerror="this.src='svg/placeholder.svg'">
          </div>
        </a>
        <div class="book-card__info">
          <span class="book-card__genre">${book.genre}</span>
          <h3 class="book-card__title"><a href="pages/book.html?id=${book.id}">${book.title}</a></h3>
          <p class="book-card__author">${book.author}</p>
        </div>
        <div class="book-card__footer">
          <div class="book-card__rating">
            <span class="book-card__rating-value">${book.rating.toFixed(1)}</span>
            <span class="book-card__rating-count">(${Math.floor(book.rating * 1000)})</span>
          </div>
          <div class="book-card__price">
            <span class="book-card__price-current">${formatBynHtml(finalPrice)}</span>
            <span class="book-card__price-old">${formatBynHtml(oldPrice)}</span>
          </div>
          <button class="book-card__btn js-add-to-cart ${added ? "book-card__btn--added" : ""}" type="button" data-book-id="${book.id}">
            ${added ? "ДОБАВЛЕНО" : "В КОРЗИНУ"}
          </button>
        </div>
      </article>
    `;
      }
    )
    .join("");
}

function initSlider() {
  const sliderBooks = sliderBookIds.map((id) => books.find((book) => book.id === id)).filter(Boolean);
  if (sliderBooks.length === 0) return;

  const genreEl = document.querySelector(".js-hero-genre");
  const titleEl = document.querySelector(".js-hero-title");
  const authorEl = document.querySelector(".js-hero-author");
  const priceEl = document.querySelector(".js-hero-price");
  const addBtn = document.querySelector(".js-hero-add");
  const dotsRoot = document.querySelector(".js-hero-dots");
  const prevBtn = document.querySelector(".js-hero-prev");
  const nextBtn = document.querySelector(".js-hero-next");
  const bg = document.querySelector(".hero__slide-bg");
  const bgImg = document.querySelector(".js-hero-bg-img");

  if (!genreEl || !titleEl || !authorEl || !priceEl || !addBtn || !dotsRoot || !bg || !bgImg) return;

  let current = 0;
  const gradients = [
    "linear-gradient(135deg,#0d0800 0%,#1a1200 40%,#0d0d0d 100%)",
    "linear-gradient(135deg,#090d14 0%,#101d2a 40%,#0d0d0d 100%)",
    "linear-gradient(135deg,#160a00 0%,#2d1400 40%,#0d0d0d 100%)",
    "linear-gradient(135deg,#0b0e0c 0%,#132018 40%,#0d0d0d 100%)"
  ];

  function renderDots() {
    dotsRoot.innerHTML = sliderBooks
      .map(
        (_, index) =>
          `<button type="button" class="hero__dot ${index === current ? "hero__dot--active" : ""}" data-slide="${index}" aria-label="Слайд ${index + 1}"></button>`
      )
      .join("");
  }

  function getHeroSliderImage(book) {
    const id = Number(book?.id);
    if (id === 2) return "images/covers/slider-rytsar.jpg";
    if (id === 8) return "images/covers/slider-hobbit.jpg";
    if (id === 6) return "images/covers/slider-fightclub.jpg";
    return book?.image || "svg/placeholder.svg";
  }

  function renderSlide() {
    const book = sliderBooks[current];
    genreEl.textContent = book.genre;
    titleEl.innerHTML = book.title.replace(" и ", " и<br>");
    authorEl.textContent = `— ${book.author}`;
    const finalPrice = window.BookPricing ? window.BookPricing.getBookPrice(book) : book.price;
    priceEl.innerHTML = formatBynHtml(finalPrice);
    addBtn.setAttribute("data-book-id", String(book.id));
    bg.setAttribute("style", `background:${gradients[current % gradients.length]}`);
    bgImg.alt = book.title;
    bgImg.src = getHeroSliderImage(book);
    bgImg.onerror = () => {
      bgImg.src = "svg/placeholder.svg";
    };
    renderDots();
  }

  function move(direction) {
    current = (current + direction + sliderBooks.length) % sliderBooks.length;
    renderSlide();
  }

  dotsRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const dot = target.closest(".hero__dot");
    if (!dot) return;
    const next = Number(dot.dataset.slide);
    if (Number.isNaN(next)) return;
    current = next;
    renderSlide();
  });

  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));
  renderSlide();
  setInterval(() => move(1), 5000);
}

function initAddToCart() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".js-add-to-cart, .js-hero-add");
    if (!button) return;

    const bookId = getBookId(button);
    if (Number.isNaN(bookId)) return;
    addBookToCart(bookId, button);
  });
}

function initBookOpenHandlers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".js-add-to-cart, .js-hero-add, a, button")) return;
    const card = target.closest(".js-book-card");
    if (!card) return;
    const bookId = getBookId(card);
    if (Number.isNaN(bookId)) return;
    window.location.href = `pages/book.html?id=${bookId}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onBookStoreReady(() => {
    updateCartCounter();
    renderDiscountBooks();
    initSlider();
    initAddToCart();
    initBookOpenHandlers();
  });
});
