(function () {
  var KEY = "tiffanynguyenmedia-theme";
  var root = document.documentElement;
  var btn = document.getElementById("themeToggle");
  var icon = document.getElementById("themeToggleIcon");
  var label = document.getElementById("themeToggleText");
  if (!btn || !icon || !label) return;

  function isLight() {
    return root.getAttribute("data-theme") === "light";
  }

  function apply(theme) {
    function dom() {
      if (theme === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        root.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {}
      syncUi();
    }
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(dom);
    } else {
      dom();
    }
  }

  function syncUi() {
    var light = isLight();
    btn.setAttribute("aria-pressed", light ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      light ? "Switch to dark mode" : "Switch to light mode"
    );
    icon.className =
      "fa-solid contact-chip__icon theme-toggle__icon " +
      (light ? "fa-moon" : "fa-sun");
    label.textContent = light ? "Dark mode" : "Light mode";
  }

  btn.addEventListener("click", function () {
    apply(isLight() ? "dark" : "light");
  });

  syncUi();
})();
