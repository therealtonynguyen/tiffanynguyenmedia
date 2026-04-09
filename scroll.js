(function () {
  var logoLayer = document.getElementById("logoLayer");
  var contact = document.getElementById("contact");
  if (!logoLayer || !contact) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight || 1;

    var fadeSpan = vh * 1.05;
    var logoT = clamp(y / fadeSpan, 0, 1);
    var eased = easeOutCubic(logoT);

    if (reduceMotion) {
      logoLayer.style.opacity = String(1 - eased);
      logoLayer.style.transform = "translate3d(0, 0, 0) scale(1)";
    } else {
      var parallax = y * 0.22;
      var scale = 1 - eased * 0.06;
      logoLayer.style.opacity = String(1 - eased);
      logoLayer.style.transform =
        "translate3d(0, " + parallax + "px, 0) scale(" + scale + ")";
    }

    var contactStart = vh * 0.35;
    var contactSpan = vh * 0.55;
    var cT = clamp((y - contactStart) / contactSpan, 0, 1);
    contact.style.opacity = String(easeOutCubic(cT));
    contact.style.transform =
      "translate3d(0, " + (1 - easeOutCubic(cT)) * 16 + "px, 0)";
  }

  var scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      tick();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  tick();
})();
