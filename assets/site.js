(function () {
  "use strict";

  // Sticky header: add a subtle border/shadow once the page is scrolled.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav toggle.
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Mark the current page in the nav.
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").toLowerCase();
    if (href === here && !a.classList.contains("btn")) a.setAttribute("aria-current", "page");
  });

  // Scroll-reveal: fade/slide in elements with class "reveal" as they enter the
  // viewport. JS arms the hidden state first, so if this script never runs the
  // content stays visible (no blank page). A safety timer reveals anything the
  // observer hasn't caught (e.g. very tall sections, or observer never firing).
  var revealTargets = document.querySelectorAll(".reveal");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var reveal = function (el) { el.classList.add("is-visible"); };
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) {
      el.classList.add("reveal-armed");
      observer.observe(el);
    });
    // Failsafe: never leave content hidden.
    window.addEventListener("load", function () {
      setTimeout(function () { revealTargets.forEach(reveal); }, 1200);
    });
  }

  // Respect reduced-motion preferences: keep the branded video poster visible
  // without forcing animation for visitors who have asked for less motion.
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
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

  // Call-request form: assemble a pre-filled email via mailto (HubSpot pending).
  var callForm = document.getElementById("call-form");
  if (callForm) {
    callForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = callForm.elements;
      var techParam = new URLSearchParams(window.location.search).get("tech");
      var lines = [
        "Name: " + f.name.value,
        "Company: " + (f.company.value || "-"),
        "Email: " + f.email.value,
        "Phone: " + (f.phone.value || "-"),
        "Help needed with: " + f.need.value + (techParam ? " (arrived via: " + techParam + ")" : ""),
        "",
        "What's happening:",
        f.details.value || "-",
        "",
        "Preferred call time: " + (f.time.value || "any")
      ];
      var subject = "Call request: " + f.need.value + (f.company.value ? " — " + f.company.value : "");
      window.location.href = "mailto:info@myrmekes.co.uk?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }
})();
