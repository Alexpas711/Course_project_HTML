function money(value) {
  return formatBynHtml(value);
}

function renderCart() {
  const root = document.getElementById("cart-content");
  if (!root) return;

  const items = Cart.getDetailedItems();
  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h3>Корзина пуста</h3>
        <p>Добавьте книги из каталога, чтобы оформить заказ.</p>
        <a href="catalog.html" class="btn btn--gold">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  const rows = items
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item__cover">
          <img src="../${item.cover}" alt="${item.title}" onerror="this.src='../svg/placeholder.svg'">
        </div>
        <div class="cart-item__info">
          <p class="cart-item__title">${item.title}</p>
          <p class="cart-item__author">${item.author}</p>
          <p class="cart-item__price-each">Цена: <span>${money(item.price)}</span></p>
        </div>
        <div class="cart-item__controls">
          <div class="qty-control">
            <button class="qty-control__btn js-qty-minus" type="button" data-id="${item.id}">-</button>
            <span class="qty-control__value">${item.qty}</span>
            <button class="qty-control__btn js-qty-plus" type="button" data-id="${item.id}">+</button>
          </div>
          <span class="cart-item__subtotal">${money(item.price * item.qty)}</span>
          <button class="cart-item__remove js-remove-item" type="button" data-id="${item.id}">×</button>
        </div>
      </div>
    `
    )
    .join("");

  root.innerHTML = `
    <div class="cart-layout">
      <section>
        <div class="cart-items">${rows}</div>
      </section>
      <aside class="cart-summary">
        <h2 class="cart-summary__title">Итоги заказа</h2>
        <div class="cart-summary__row"><span>Товаров:</span><span class="cart-summary__value">${Cart.getTotalCount()}</span></div>
        <div class="cart-summary__row cart-summary__row--total"><span>Итого:</span><span class="cart-summary__value">${money(Cart.getTotalPrice())}</span></div>
        <a href="checkout.html" class="btn btn--gold btn--full">Оформить заказ</a>
      </aside>
    </div>
  `;
}

function initCartActions() {
  const refresh = () => {
    updateCartCounter();
    renderCart();
  };
  const getId = (el) => Number(el?.getAttribute("data-id"));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const plus = target.closest(".js-qty-plus");
    if (plus) {
      const id = getId(plus);
      const current = Cart.load().find((item) => item.id === id);
      Cart.setQty(id, (current?.qty || 0) + 1);
      refresh();
      return;
    }

    const minus = target.closest(".js-qty-minus");
    if (minus) {
      const id = getId(minus);
      const current = Cart.load().find((item) => item.id === id);
      Cart.setQty(id, (current?.qty || 0) - 1);
      refresh();
      return;
    }

    const remove = target.closest(".js-remove-item");
    if (remove) {
      const id = getId(remove);
      Cart.remove(id);
      refresh();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onBookStoreReady(() => {
    updateCartCounter();
    renderCart();
    initCartActions();
  });
});
