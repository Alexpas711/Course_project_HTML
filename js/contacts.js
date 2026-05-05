document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const btn = form.querySelector('[type="submit"]');
  const defaultBtnText = btn.textContent.trim();
  const hasValue = (field) => (field.type === "checkbox" ? field.checked : !!field.value.trim());
  const updateSubmitText = () => {
    const allFilled = [...form.querySelectorAll("[required]")].every(hasValue);
    btn.textContent = allFilled ? "Отправлено" : defaultBtnText;
  };
  const resetBtn = () => {
    btn.textContent = defaultBtnText;
    btn.disabled = false;
  };

  form.addEventListener("input", updateSubmitText);
  form.addEventListener("change", updateSubmitText);
  updateSubmitText();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    btn.textContent = "Отправлено";
    btn.disabled = true;

    form.querySelectorAll(".input--error").forEach((el) => el.classList.remove("input--error"));
    const invalid = [...form.querySelectorAll("[required]")].filter((field) => !hasValue(field));
    invalid.forEach((field) => field.classList.add("input--error"));

    if (invalid.length) {
      Toast.show("Заполните все обязательные поля", "error");
      resetBtn();
      return;
    }

    setTimeout(() => {
      Toast.show("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.", "success", 5000);
      form.reset();
      resetBtn();
      updateSubmitText();
    }, 1200);
  });
});
