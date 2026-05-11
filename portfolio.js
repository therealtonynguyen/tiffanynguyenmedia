(function () {
  var hero = document.getElementById("portfolioHero");
  var main = document.getElementById("portfolio-main");
  var pageTop = document.getElementById("page-top");
  var scrollToTopBtn = document.getElementById("scrollToTop");
  var sections = document.querySelectorAll(".portfolio-section[data-reveal]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /**
   * Skip scroll-scrubbed dimming / folds for touch layouts and common “phone” cases.
   * Width alone misses desktop-mode / in-app browsers; coarse pointer + hover:none catches those.
   */
  var portfolioWideTouchMql = window.matchMedia(
    "(max-width: 1024px), (pointer: coarse)"
  );

  function portfolioSkipScrollDim() {
    if (portfolioWideTouchMql.matches) return true;
    try {
      return (
        typeof navigator !== "undefined" &&
        navigator.maxTouchPoints > 0 &&
        window.matchMedia("(hover: none)").matches
      );
    } catch (e) {
      return false;
    }
  }

  function syncPortfolioSkipScrollFxClass() {
    document.documentElement.classList.toggle(
      "portfolio-skip-scroll-fx",
      portfolioSkipScrollDim()
    );
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateHero(scrollY) {
    if (!hero) return;
    var vh = window.innerHeight || 1;
    var fadeSpan = vh * 1.05;
    var logoT = clamp(scrollY / fadeSpan, 0, 1);
    var eased = easeOutCubic(logoT);

    if (reduceMotion) {
      hero.style.opacity = String(1 - eased);
      hero.style.transform = "translate3d(0, 0, 0) scale(1)";
    } else {
      var parallax = scrollY * 0.2;
      var scale = 1 - eased * 0.07;
      hero.style.opacity = String(1 - eased);
      hero.style.transform =
        "translate3d(0, " + parallax + "px, 0) scale(" + scale + ")";
    }
  }

  /** Scroll-scrubbed “fold from bottom” on gallery faces (rotateX + slight lift). */
  function updateGalleryFolds() {
    if (reduceMotion || portfolioSkipScrollDim()) {
      if (!reduceMotion && portfolioSkipScrollDim()) {
        document.querySelectorAll(".portfolio-tile__face").forEach(function (face) {
          face.style.opacity = "";
          face.style.transform = "";
        });
      }
      return;
    }

    var galleries = document.querySelectorAll(".portfolio-gallery");
    var vh = window.innerHeight || 1;
    var bandStart = vh * 0.9;
    var bandEnd = vh * 0.18;
    var span = Math.max(bandStart - bandEnd, vh * 0.42);

    galleries.forEach(function (gallery) {
      var rect = gallery.getBoundingClientRect();
      var raw = (bandStart - rect.top) / span;
      var p = clamp(raw, 0, 1);
      var faces = gallery.querySelectorAll(".portfolio-tile__face");
      var n = faces.length;
      if (!n) return;

      faces.forEach(function (face, i) {
        var stagger = n > 1 ? (i / (n - 1)) * 0.26 : 0;
        var pi = clamp((p - stagger) / Math.max(1 - stagger, 0.15), 0, 1);
        var eased = easeOutCubic(pi);
        var rot = (1 - eased) * 86;
        var lift = (1 - eased) * 36;
        face.style.opacity = String(0.2 + eased * 0.8);
        face.style.transform =
          "translate3d(0, " +
          lift +
          "px, 0) rotateX(" +
          rot +
          "deg) translateZ(2px)";
      });
    });
  }

  /** As a section scrolls up past the top edge, fade and shrink it away. */
  function updateSectionExit() {
    if (reduceMotion) {
      sections.forEach(function (section) {
        section.style.opacity = "";
        section.style.transform = "";
        section.style.transformOrigin = "";
      });
      return;
    }

    if (portfolioSkipScrollDim()) {
      sections.forEach(function (section) {
        section.style.opacity = "";
        section.style.transform = "";
        section.style.transformOrigin = "";
      });
      return;
    }

    var vh = window.innerHeight || 1;
    var band = Math.max(vh * 0.4, 220);

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var past = Math.max(0, -rect.top);
      var out = clamp(past / band, 0, 1);
      var ease = easeOutCubic(out);
      section.style.opacity = String(1 - ease * 0.9);
      section.style.transform =
        "translate3d(0, " +
        -ease * 36 +
        "px, 0) scale(" +
        (1 - ease * 0.1) +
        ")";
      section.style.transformOrigin = "50% 12%";
    });
  }

  var lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
    });
  }

  function raf(time) {
    syncPortfolioSkipScrollFxClass();
    if (lenis) {
      lenis.raf(time);
      updateHero(lenis.scroll);
    } else {
      updateHero(window.scrollY || window.pageYOffset);
    }
    updateGalleryFolds();
    updateSectionExit();
    requestAnimationFrame(raf);
  }

  syncPortfolioSkipScrollFxClass();
  portfolioWideTouchMql.addEventListener("change", syncPortfolioSkipScrollFxClass);
  window.addEventListener("resize", syncPortfolioSkipScrollFxClass);

  requestAnimationFrame(raf);

  if (main) {
    main.addEventListener("click", function (e) {
      var nextBtn = e.target.closest("[data-scroll-to-section]");
      if (!nextBtn) return;
      var sel = nextBtn.getAttribute("data-scroll-to-section");
      if (!sel) return;
      var el = document.querySelector(sel);
      if (!el) return;
      e.preventDefault();
      try {
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(el, { offset: -24, duration: 1.05 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function () {
      try {
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(0, { duration: 1.15 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (e) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (pageTop && typeof pageTop.focus === "function") {
        try {
          pageTop.focus({ preventScroll: true });
        } catch (e2) {
          pageTop.focus();
        }
      }
    });
  }

  if (!sections.length || reduceMotion) {
    sections.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    sections.forEach(function (el) {
      io.observe(el);
    });
  }
})();
