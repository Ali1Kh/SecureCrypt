function copyToClipboard(id) {
  let text = document.getElementById(id).value;
  if (!text) {
    return;
  }
  navigator.clipboard.writeText(text);
  Toastify({
    text: "Copied to your clipboard",
    gravity: "bottom",
    position: "center",
    style: {
      background: "black",
      color: "white",
      borderRadius: "5px",
    },
  }).showToast();
}

function navigateTo(page) {
  window.location.href = page;
}
