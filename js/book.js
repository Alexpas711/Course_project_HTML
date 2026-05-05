function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isNaN(id) ? 1 : id;
}

function getBookById(bookId) {
  if (!Array.isArray(BookStoreData)) return null;
  return BookStoreData.find((book) => book.id === bookId) || null;
}

function isInCart(bookId) {
  return window.BookUi ? window.BookUi.isInCart(bookId) : Cart.load().some((item) => item.id === bookId);
}

function fillBookPage(book) {
  const title = book?.title || "Книга";
  const author = book?.author || "Автор";
  const genre = book?.genre || "";
  const effectivePrice = window.BookPricing ? window.BookPricing.getBookPrice(book) : book?.price;
  const oldPrice = window.BookPricing ? window.BookPricing.getBookOldPrice(book) : book?.price;
  const isDiscounted = window.BookPricing ? window.BookPricing.isDiscountedBook(book?.id) : false;
  const price = formatBynHtml(effectivePrice);
  const rating = typeof book?.rating === "number" ? book.rating.toFixed(1) : "0.0";
  const reviews = Math.floor((book?.rating || 0) * 1000);
  const description = book?.description || "Описание книги скоро появится.";

  const titleEl = document.getElementById("book-title");
  const pageTitleEl = document.getElementById("book-page-title");
  const breadcrumbEl = document.getElementById("breadcrumb-title");
  const authorEl = document.getElementById("book-author");
  const genreEl = document.getElementById("book-genre");
  const ratingEl = document.getElementById("book-rating");
  const reviewsEl = document.getElementById("book-reviews");
  const priceEl = document.getElementById("book-price");
  const oldPriceEl = document.getElementById("book-price-old");
  const descriptionEl = document.getElementById("book-description");
  const coverEl = document.getElementById("book-cover");
  const yearEl = document.getElementById("book-year");
  const publisherEl = document.getElementById("book-publisher");
  const pagesEl = document.getElementById("book-pages");
  const languageEl = document.getElementById("book-language");

  const setText = (el, value) => {
    if (el) el.textContent = value;
  };

  setText(titleEl, title);
  setText(pageTitleEl, `${title} — BookStore`);
  setText(breadcrumbEl, title);
  setText(authorEl, author);
  setText(genreEl, genre);
  setText(ratingEl, rating);
  setText(reviewsEl, `(${reviews} отзывов)`);
  if (priceEl) priceEl.innerHTML = price;
  if (oldPriceEl) {
    if (isDiscounted) {
      oldPriceEl.innerHTML = formatBynHtml(oldPrice);
      oldPriceEl.hidden = false;
    } else {
      oldPriceEl.hidden = true;
    }
  }
  setText(descriptionEl, description);
  if (coverEl) {
    coverEl.src = `../${book?.image || "svg/placeholder.svg"}`;
    coverEl.alt = title;
    coverEl.onerror = () => {
      coverEl.src = "../svg/placeholder.svg";
    };
  }
  setText(yearEl, book?.year || "-");
  setText(publisherEl, book?.publisher || "-");
  setText(pagesEl, book?.pages || "-");
  setText(languageEl, book?.language || "Русский");
}

function initAddButton(bookId) {
  const btn = document.getElementById("book-add-btn");
  if (!btn) return;

  const alreadyAdded = isInCart(bookId);
  if (alreadyAdded) {
    if (window.BookUi) window.BookUi.markAdded(btn);
    else {
      btn.textContent = "ДОБАВЛЕНО";
      btn.classList.add("book-card__btn--added");
    }
  }

  btn.addEventListener("click", () => {
    if (window.BookUi) window.BookUi.addToCartOnce(bookId, 1);
    else if (!isInCart(bookId)) Cart.add(bookId, 1);
    updateCartCounter();
    if (window.BookUi) window.BookUi.markAdded(btn);
    else {
      btn.textContent = "ДОБАВЛЕНО";
      btn.classList.add("book-card__btn--added");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onBookStoreReady(() => {
    updateCartCounter();
    const bookId = getBookIdFromUrl();
    const book = getBookById(bookId) || getBookById(1);
    fillBookPage(book);
    initAddButton(book?.id || 1);
  });
});
