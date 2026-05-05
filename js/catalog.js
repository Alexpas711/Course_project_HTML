const books = typeof BookStoreData !== "undefined" && Array.isArray(BookStoreData) ? BookStoreData : [];

function getBookId(el) {
  return window.BookUi ? window.BookUi.getNumberAttr(el, "data-book-id") : Number(el?.getAttribute("data-book-id"));
}

function markAdded(button) {
  if (window.BookUi) {
    window.BookUi.markAdded(button);
    return;
  }
  button.textContent = "ДОБАВЛЕНО";
  button.classList.add("book-card__btn--added");
}

function cardTemplate(book) {
  const added = window.BookUi ? window.BookUi.isInCart(book.id) : Cart.load().some((item) => item.id === book.id);
  const isDiscounted = window.BookPricing ? window.BookPricing.isDiscountedBook(book.id) : false;
  const finalPrice = window.BookPricing ? window.BookPricing.getBookPrice(book) : book.price;
  const oldPrice = window.BookPricing ? window.BookPricing.getBookOldPrice(book) : book.price;
  return `
    <article class="book-card js-book-card" data-book-id="${book.id}">
      <a class="book-card__cover-link" href="book.html?id=${book.id}" style="display:block">
        <div class="book-card__cover">
          ${isDiscounted ? '<span class="book-card__badge book-card__badge--sale">-20%</span>' : ""}
          <img src="../${book.image}" alt="${book.title}" onerror="this.src='../svg/placeholder.svg'">
        </div>
      </a>
      <div class="book-card__info">
        <span class="book-card__genre">${book.genre}</span>
        <h3 class="book-card__title"><a href="book.html?id=${book.id}">${book.title}</a></h3>
        <p class="book-card__author">${book.author}</p>
      </div>
      <div class="book-card__footer">
        <div class="book-card__rating">
          <span class="book-card__rating-value">${book.rating.toFixed(1)}</span>
          <span class="book-card__rating-count">(${Math.floor(book.rating * 1000)})</span>
        </div>
        <div class="book-card__price">
          <span class="book-card__price-current">${formatBynHtml(finalPrice)}</span>
          ${isDiscounted ? `<span class="book-card__price-old">${formatBynHtml(oldPrice)}</span>` : ""}
        </div>
        <button class="book-card__btn js-add-to-cart ${added ? "book-card__btn--added" : ""}" type="button" data-book-id="${book.id}">
          ${added ? "ДОБАВЛЕНО" : "В КОРЗИНУ"}
        </button>
      </div>
    </article>
  `;
}

function initCatalog() {
  const filterRoot = document.querySelector(".js-genre-filter");
  const grid = document.querySelector(".js-catalog-grid");
  if (!filterRoot || !grid) return;

  const getGenre = (book) => (typeof book.genre === "string" ? book.genre.trim() : "");
  const genres = ["Все", ...new Set(books.map(getGenre).filter(Boolean))];
  let activeGenre = "Все";
  const filteredBooks = () => (activeGenre === "Все" ? books : books.filter((book) => getGenre(book) === activeGenre));

  function renderFilters() {
    filterRoot.innerHTML = genres
      .map(
        (genre) =>
          `<button class="genre-chip ${genre === activeGenre ? "genre-chip--active" : ""}" type="button" data-genre="${genre}">${genre}</button>`
      )
      .join("");
  }

  function renderBooks() {
    grid.innerHTML = filteredBooks().map(cardTemplate).join("");
  }

  filterRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".genre-chip");
    if (!button) return;
    const genre = (button.dataset.genre || "").trim();
    activeGenre = genre || "Все";
    renderFilters();
    renderBooks();
  });

  renderFilters();
  renderBooks();
}

function initAddToCart() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".js-add-to-cart");
    if (!button) return;

    const bookId = getBookId(button);
    if (Number.isNaN(bookId)) return;

    if (window.BookUi) {
      window.BookUi.addToCartOnce(bookId, 1);
    } else if (!Cart.load().some((item) => item.id === bookId)) {
      Cart.add(bookId, 1);
    }
    updateCartCounter();
    markAdded(button);
  });
}

function initBookOpenHandlers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".js-add-to-cart, a, button")) return;
    const card = target.closest(".js-book-card");
    if (!card) return;
    const bookId = getBookId(card);
    if (Number.isNaN(bookId)) return;
    window.location.href = `book.html?id=${bookId}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onBookStoreReady(() => {
    updateCartCounter();
    initCatalog();
    initAddToCart();
    initBookOpenHandlers();
  });
});
