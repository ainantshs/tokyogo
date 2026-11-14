/* Hamburger menu toggle, shared by every page that uses navbar.css */
document.querySelectorAll("nav .menu").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var links = btn.parentElement.querySelector("ul");
    if (links) links.classList.toggle("open");
  });
});
