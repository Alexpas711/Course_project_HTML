document.addEventListener("DOMContentLoaded", () => {
  const notify = (message) =>
    window.Toast && typeof window.Toast.show === "function"
      ? window.Toast.show(message, "error")
      : alert(message);

  if (Cart.getTotalCount() === 0) {
    location.href = "cart.html";
    return;
  }

  const tabs = document.querySelectorAll(".checkout-form__pay-tab");
  const panels = document.querySelectorAll(".js-pay-panel");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("checkout-form__pay-tab--active", t === tab));
      const target = tab.dataset.tab;
      panels.forEach((p) => {
        p.style.display = p.dataset.panel === target ? "block" : "none";
      });
    })
  );

  const form = document.getElementById("checkout-form");
  if (!form) return;
  const submitBtn = document.getElementById("submit-btn");
  const defaultBtnText = submitBtn?.textContent.trim() || "Оплатить";
  const hasValue = (field) => (field.type === "checkbox" ? field.checked : !!field.value.trim());
  const updateSubmitText = () => {
    if (!submitBtn) return;
    const allFilled = [...form.querySelectorAll("[required]")].every(hasValue);
    submitBtn.textContent = allFilled ? "Отправлено" : defaultBtnText;
  };

  const attachMask = (id, map) =>
    document.getElementById(id)?.addEventListener("input", (e) => {
      e.target.value = map(String(e.target.value));
      updateSubmitText();
    });

  const formatBelarusPhone = (raw) => {
    let d = String(raw).replace(/\D/g, "");
    if (d.length === 0) return "";
    if (!d.startsWith("375")) d = `375${d}`;
    d = d.slice(0, 12);
    const nn = d.slice(3);
    let out = "+375";
    if (nn.length === 0) return out;
    out += ` (${nn.slice(0, Math.min(2, nn.length))}`;
    if (nn.length <= 2) return nn.length === 2 ? `${out})` : out;
    const tail = nn.slice(2, 9);
    out += `) ${tail.slice(0, 3)}`;
    if (tail.length <= 3) return out;
    out += `-${tail.slice(3, 5)}`;
    if (tail.length <= 5) return out;
    return `${out}-${tail.slice(5, 7)}`;
  };

  attachMask("checkout-phone", formatBelarusPhone);
  attachMask("card-number", (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim());
  attachMask("card-expiry", (v) => {
    const clean = v.replace(/\D/g, "").slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  });
  attachMask("card-cvv", (v) => v.replace(/\D/g, "").slice(0, 3));
  form.addEventListener("input", updateSubmitText);
  form.addEventListener("change", updateSubmitText);
  updateSubmitText();

  const validateForm = () => {
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      field.classList.remove("input--error");
      if (!hasValue(field)) {
        field.classList.add("input--error");
        valid = false;
      }
    });

    if (!valid) {
      notify("Пожалуйста, заполните все обязательные поля");
      form.querySelector(".input--error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const email = form.querySelector('[type="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add("input--error");
      notify("Введите корректный email");
      valid = false;
    }
    return valid;
  };

  const showSuccess = () => {
    document.getElementById("checkout-layout")?.style.setProperty("display", "none");
    document.getElementById("order-success")?.style.setProperty("display", "block");
    const numEl = document.getElementById("order-number");
    if (numEl) numEl.textContent = Math.floor(Math.random() * 0o10000000).toString(8);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (submitBtn) {
      submitBtn.textContent = "Отправлено";
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      Cart.clear();
      showSuccess();
    }, 1500);
  });
});
