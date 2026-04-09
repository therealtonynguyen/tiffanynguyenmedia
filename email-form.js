(function () {
  var openBtn = document.getElementById("openEmailForm");
  var modal = document.getElementById("emailModal");
  var dialog = document.getElementById("emailDialog");
  var form = document.getElementById("emailForm");
  var statusEl = document.getElementById("emailFormStatus");
  if (!openBtn || !modal || !dialog || !form) return;

  var dismissEls = modal.querySelectorAll("[data-modal-dismiss]");
  var lastFocus = null;

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.setAttribute("hidden", "");
    statusEl.classList.remove("email-form__status--error");
  }

  function showStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.removeAttribute("hidden");
    if (isError) statusEl.classList.add("email-form__status--error");
    else statusEl.classList.remove("email-form__status--error");
  }

  function resetFormUi() {
    form.reset();
    clearStatus();
    var submitBtn = form.querySelector(".email-form__submit");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
  }

  function setOpen(open) {
    if (open) {
      lastFocus = document.activeElement;
      resetFormUi();
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      var first = form.querySelector("#emailFrom");
      if (first) first.focus();
    } else {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      resetFormUi();
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
    if (e.key === "Tab" && !modal.hasAttribute("hidden")) {
      var focusables = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      var list = Array.prototype.slice.call(focusables).filter(function (el) {
        return !el.hasAttribute("disabled") && el.tabIndex !== -1;
      });
      if (list.length === 0) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  openBtn.addEventListener("click", function () {
    setOpen(true);
  });

  dismissEls.forEach(function (el) {
    el.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", onKeydown);

  function formspreeErrorMessage(data) {
    if (!data || typeof data !== "object") return null;
    if (typeof data.error === "string") return data.error;
    if (data.errors && typeof data.errors === "object") {
      var keys = Object.keys(data.errors);
      if (keys.length && Array.isArray(data.errors[keys[0]])) {
        return data.errors[keys[0]][0];
      }
    }
    return null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var endpoint = form.getAttribute("action") || "";
    if (!endpoint || /\/xxxxxxxx\/?$/i.test(endpoint) || /YOUR_FORM_ID/i.test(endpoint)) {
      showStatus(
        "Replace xxxxxxxx in the form action with your Formspree form ID (index.html).",
        true
      );
      return;
    }

    clearStatus();
    var submitBtn = form.querySelector(".email-form__submit");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    var fd = new FormData(form);

    fetch(endpoint, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        var ct = res.headers.get("content-type") || "";
        if (ct.indexOf("application/json") !== -1) {
          return res.json().then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
        }
        return { ok: res.ok, status: res.status, data: null };
      })
      .then(function (out) {
        if (out.ok) {
          form.reset();
          showStatus("Thanks — your message was sent.", false);
        } else {
          var msg =
            formspreeErrorMessage(out.data) ||
            "Something went wrong. Please try again.";
          showStatus(msg, true);
        }
      })
      .catch(function () {
        showStatus("Network error. Check your connection and try again.", true);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send";
        }
      });
  });
})();
