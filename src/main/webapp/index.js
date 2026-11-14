/* Home page: remove any image that fails to load (replaces the old inline onerror attributes) */
document.querySelectorAll("img").forEach(function (img) {
  function drop() { img.remove(); }
  if (img.complete && img.naturalWidth === 0) { drop(); return; }
  img.addEventListener("error", drop);
});
