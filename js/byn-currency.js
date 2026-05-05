window.formatBynHtml = function formatBynHtml(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${amount.toFixed(2)} <i class="nbrb-icon" aria-hidden="true">BYN</i>`;
};
