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

new Typed("#typedElement", {
  strings: [
    "New Cairo Technological University",
    "f8b2aa1161b59c8c65c050173efc2e9fad23e143",
  ],
  typeSpeed: 50,
  backSpeed: 50,
  loop: true,
});

new Typed("#typedElementStatus", {
  strings: ["Processing...", "Encrypting..."],
  typeSpeed: 0,
  backSpeed: 0,
  backDelay: 5700,
  loop: true,
  showCursor: false,
});
