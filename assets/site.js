(function () {
  "use strict";

  // Scroll-reveal: fade/slide in elements with class "reveal" as they enter the viewport.
  var revealTargets = document.querySelectorAll(".reveal");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // "/" keyboard shortcut: focus the page's search input, if it has one.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var active = document.activeElement;
    var tag = active && active.tagName ? active.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;
    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Contact page: prefill the mailto subject from a ?tech= URL param, if present.
  var mailtoLinks = document.querySelectorAll('a[href^="mailto:info@myrmekes.co.uk"]');
  if (mailtoLinks.length) {
    var params = new URLSearchParams(window.location.search);
    var tech = params.get("tech");
    if (tech) {
      var subject = "Support enquiry: " + tech;
      mailtoLinks.forEach(function (link) {
        link.href = "mailto:info@myrmekes.co.uk?subject=" + encodeURIComponent(subject);
      });
      var banner = document.querySelector("[data-tech-banner]");
      if (banner) {
        banner.textContent = "Asking about \"" + tech + "\" — mention it and we'll get straight into it.";
        banner.hidden = false;
      }
    }
  }
})();
