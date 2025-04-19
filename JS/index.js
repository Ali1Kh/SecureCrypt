function copyToClipboard(id) {
  let text = document.getElementById(id).value;
  navigator.clipboard.writeText(text);
}

function navigateTo(page) {
  window.location.href = page;
}
