const BookStoreData = [];
let bookStoreDataReady = false;
let bookStoreDataPromise = null;

const BOOK_META = {
  1: { rating: 4.9, image: "images/covers/master-i-margarita.jpg" },
  2: { rating: 4.8, image: "images/covers/rytsar-semi-korolevstv.jpg" },
  3: { rating: 4.7, image: "images/covers/na-zapadnom-fronte-bez-peremen.jpg" },
  4: { rating: 4.6, image: "images/covers/metro-2033.jpg" },
  5: { rating: 4.9, image: "images/covers/pesn-lda-i-plameni.jpg" },
  6: { rating: 4.5, image: "images/covers/boytsovskiy-klub.jpg" },
  7: { rating: 4.9, image: "images/covers/garri-potter.jpg" },
  8: { rating: 4.8, image: "images/covers/hobbit.jpg" },
  9: { rating: 4.9, image: "images/covers/malenkiy-prints.jpg" },
  10: { rating: 4.8, image: "images/covers/voyna-i-mir.jpg" },
  11: { rating: 4.9, image: "images/covers/vlastelin-kolets.jpg" },
  12: { rating: 4.8, image: "images/covers/prestuplenie-i-nakazanie.jpg" }
};
const DISCOUNT_BOOK_IDS = [1, 3, 4, 11, 12];
const DISCOUNT_RATE = 0.2;

function getAssetPrefix() {
  return window.location.pathname.toLowerCase().includes("/pages/") ? "../" : "";
}

function getCatalogPath() {
  return `${getAssetPrefix()}xml/catalog.xml`;
}

async function loadBookStoreData() {
  if (bookStoreDataPromise) return bookStoreDataPromise;

  bookStoreDataPromise = (async () => {
    try {
      const response = await fetch(getCatalogPath());
      if (!response.ok) throw new Error("catalog load failed");

      const xmlText = await response.text();
      const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
      if (xmlDoc.querySelector("parsererror")) throw new Error("catalog parse error");

      const booksFromXml = Array.from(xmlDoc.querySelectorAll("book")).map((bookNode) => {
        const id = Number(bookNode.getAttribute("id"));
        const meta = BOOK_META[id] || { rating: 0, image: "svg/placeholder.svg" };
        const priceText = bookNode.querySelector("price")?.textContent?.trim() ?? "";
        const priceParsed = Number.parseFloat(priceText.replace(",", "."));
        const price = Number.isFinite(priceParsed) && priceParsed >= 0 ? priceParsed : 0;
        return {
          id,
          title: bookNode.querySelector("title")?.textContent?.trim() || "Книга",
          author: bookNode.querySelector("author")?.textContent?.trim() || "Автор",
          genre: bookNode.querySelector("genre")?.textContent?.trim() || "Без жанра",
          year: bookNode.querySelector("year")?.textContent?.trim() || "",
          publisher: bookNode.querySelector("publisher")?.textContent?.trim() || "",
          pages: bookNode.querySelector("pages")?.textContent?.trim() || "",
          language: bookNode.querySelector("language")?.textContent?.trim() || "Русский",
          description: bookNode.querySelector("description")?.textContent?.trim() || "",
          price,
          rating: meta.rating,
          image: meta.image
        };
      });

      BookStoreData.splice(0, BookStoreData.length, ...booksFromXml);
      bookStoreDataReady = true;
      document.dispatchEvent(new CustomEvent("bookstore:data-ready"));
      return BookStoreData;
    } catch (error) {
      bookStoreDataReady = true;
      document.dispatchEvent(new CustomEvent("bookstore:data-ready"));
      return BookStoreData;
    }
  })();

  return bookStoreDataPromise;
}

function onBookStoreReady(callback) {
  if (typeof callback !== "function") return;
  if (bookStoreDataReady) {
    callback();
    return;
  }
  document.addEventListener("bookstore:data-ready", callback, { once: true });
}

function isDiscountedBook(bookId) {
  return DISCOUNT_BOOK_IDS.includes(Number(bookId));
}

function getBookPrice(book) {
  const base = Number(book?.price);
  if (!Number.isFinite(base)) return 0;
  if (!isDiscountedBook(book?.id)) return base;
  return base * (1 - DISCOUNT_RATE);
}

function getBookOldPrice(book) {
  const base = Number(book?.price);
  return Number.isFinite(base) ? base : 0;
}

const Cart = {
  STORAGE_KEY: "bookstore-cart",

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  },

  add(bookId, qty = 1) {
    const items = this.load();
    const found = items.find((item) => item.id === bookId);
    if (found) {
      found.qty += qty;
    } else {
      items.push({ id: bookId, qty });
    }
    this.save(items);
  },

  remove(bookId) {
    this.save(this.load().filter((item) => item.id !== bookId));
  },

  setQty(bookId, qty) {
    if (qty <= 0) {
      this.remove(bookId);
      return;
    }
    const items = this.load();
    const found = items.find((item) => item.id === bookId);
    if (found) {
      found.qty = qty;
      this.save(items);
    }
  },

  clear() {
    this.save([]);
  },

  getDetailedItems() {
    const coverPrefix = getAssetPrefix();
    return this.load()
      .map((item) => {
        const book = BookStoreData.find((entry) => entry.id === item.id);
        if (!book) return null;
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          cover: `${coverPrefix}${book.image}`,
          price: getBookPrice(book),
          qty: item.qty
        };
      })
      .filter(Boolean);
  },

  getTotalCount() {
    return this.load().reduce((sum, item) => sum + item.qty, 0);
  },

  getTotalPrice() {
    return this.getDetailedItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  }
};

function updateCartCounter() {
  const countEl = document.querySelector(".js-cart-count");
  if (!countEl) return;
  const count = Cart.getTotalCount();
  countEl.textContent = String(count);
  countEl.classList.toggle("header__cart-count--hidden", count === 0);
}

function isInCart(bookId) {
  return Cart.load().some((item) => item.id === bookId);
}

function addToCartOnce(bookId, qty = 1) {
  if (isInCart(bookId)) return false;
  Cart.add(bookId, qty);
  return true;
}

function getNumberAttr(el, attrName) {
  return Number(el?.getAttribute(attrName));
}

function markAdded(button, text = "ДОБАВЛЕНО") {
  if (!button) return;
  button.textContent = text;
  button.classList.add("book-card__btn--added");
}

window.BookStoreData = BookStoreData;
window.Cart = Cart;
window.updateCartCounter = updateCartCounter;
window.onBookStoreReady = onBookStoreReady;
window.BookPricing = {
  discountRate: DISCOUNT_RATE,
  discountBookIds: DISCOUNT_BOOK_IDS,
  isDiscountedBook,
  getBookPrice,
  getBookOldPrice
};
window.BookUi = {
  isInCart,
  addToCartOnce,
  getNumberAttr,
  markAdded
};

loadBookStoreData();
